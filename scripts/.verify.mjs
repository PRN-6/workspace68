// Temporary verification run: exercises the local-first flow in a real browser.
// Run: node scripts/.verify.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] || 'http://127.0.0.1:5183'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9800 + (process.pid % 300)
const OUT = 'scripts/.shots'

const profileDir = mkdtempSync(join(tmpdir(), 'ws68-verify-'))
mkdirSync(OUT, { recursive: true })

const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1600,1000',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const page = (await res.json()).find((t) => t.type === 'page')
      if (page) return page
    } catch {
      /* not up yet */
    }
    await sleep(250)
  }
  throw new Error('Chrome did not expose a debug target')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res)
  ws.addEventListener('error', rej)
})

let id = 0
const pending = new Map()
const consoleErrors = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    if (m.error) reject(new Error(JSON.stringify(m.error)))
    else resolve(m.result)
  }
  if (m.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 300) || 'error')
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300))
  }
})

const send = (method, params = {}) => {
  const i = ++id
  return new Promise((resolve, reject) => {
    pending.set(i, { resolve, reject })
    ws.send(JSON.stringify({ id: i, method, params }))
    setTimeout(() => {
      if (pending.has(i)) {
        pending.delete(i)
        reject(new Error(`timeout: ${method}`))
      }
    }, 30000)
  })
}

const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (res.exceptionDetails) {
    throw new Error(res.exceptionDetails.exception?.description || 'eval failed')
  }
  return res.result.value
}

const shoot = async (name) => {
  const png = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(png.data, 'base64'))
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1600,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
})

// --- landing -------------------------------------------------------------
await send('Page.navigate', { url: `${BASE}/` })
await sleep(5000)
const landingTitle = await evaluate(
  `document.title + ' :: ' + (document.querySelector('h1')?.textContent || '').trim().slice(0, 70)`
)
await shoot('v-landing')
console.log('landing  ->', landingTitle)

// --- dashboard (anonymous) ----------------------------------------------
await send('Page.navigate', { url: `${BASE}/dashboard` })
await sleep(4000)
const dashTitle = await evaluate(
  `document.body.innerText.replace(/\\s+/g, ' ').slice(0, 140)`
)
await shoot('v-dashboard')
console.log('dashboard ->', dashTitle)

// --- seed a local project and open the editor ---------------------------
const projectId = await evaluate(`(() => {
  const key = 'workspace68.local.projects.v1'
  const id = 'local_verify_1'
  const doc = {
    name: 'Verify Project',
    theme: { seed: '#e11d33', radius: '16px', font: 'Inter', scheme: 'light' },
    pages: [
      { id: 'pg1', name: 'Home', path: '/', root: [] },
      { id: 'pg2', name: 'Pricing', path: '/pricing', root: [] },
    ],
  }
  const row = {
    id, name: 'Verify Project', document: doc, status: 'draft', slug: null,
    owner_id: null, source: 'local',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }
  localStorage.setItem(key, JSON.stringify([row]))
  return id
})()`)

await send('Page.navigate', { url: `${BASE}/editor/${projectId}` })
await sleep(5000)
const editorText = await evaluate(`document.body.innerText.replace(/\\s+/g, ' ').slice(0, 200)`)
await shoot('v-editor')
console.log('editor   ->', editorText)

// --- left panel tabs -----------------------------------------------------
const clickTab = async (label, name) => {
  const clicked = await evaluate(`(() => {
    const btn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === ${JSON.stringify(label)})
    if (!btn) return false
    btn.click()
    return true
  })()`)
  await sleep(1200)
  await shoot(name)
  console.log('tab', label, '->', clicked)
}

await clickTab('Blocks', 'v-blocks')
await clickTab('Flow', 'v-flow')
await clickTab('Theme', 'v-theme')

// --- insert a block and check the canvas --------------------------------
const inserted = await evaluate(`(() => {
  const btn = [...document.querySelectorAll('button')].find((b) => b.getAttribute('title')?.startsWith('Add '))
  if (!btn) return 'no-add-button'
  btn.click()
  return 'clicked'
})()`)
await sleep(1200)
await shoot('v-insert')
console.log('insert   ->', inserted)

const blocks = await evaluate(`document.querySelectorAll('[id^="el-"], [id^="b-"]').length`)
console.log('blocks   ->', blocks)

if (consoleErrors.length) {
  console.log('\nconsole errors:')
  for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log('  -', e)
} else {
  console.log('\nno console errors')
}

ws.close()
chrome.kill()
try {
  rmSync(profileDir, { recursive: true, force: true })
} catch {
  /* ignore */
}
process.exit(0)
