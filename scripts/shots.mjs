// Capture screenshots of the app's key screens over CDP.
// Run: node scripts/shots.mjs [baseUrl]
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.argv[2] || 'http://localhost:5183'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9500 + (process.pid % 400)
const OUT = 'scripts/.shots'

const profileDir = mkdtempSync(join(tmpdir(), 'ws68-shots-'))
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
    consoleErrors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 200) || 'error')
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    consoleErrors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200))
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

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false,
})

const shots = [
  { name: 'landing', url: `${BASE}/`, wait: 6000 },
  { name: 'login', url: `${BASE}/login`, wait: 4000 },
  { name: 'register', url: `${BASE}/register`, wait: 4000 },
  { name: 'editor', url: `${BASE}/dnd-test.html`, wait: 5000 },
]

for (const shot of shots) {
  await send('Page.navigate', { url: shot.url })
  await sleep(shot.wait)
  const title = await evaluate(`document.title + ' :: ' + (document.querySelector('h1,h2')?.textContent || '').trim().slice(0, 60)`)
  const png = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, `${shot.name}.png`), Buffer.from(png.data, 'base64'))
  console.log(`  ${shot.name.padEnd(9)} -> ${OUT}/${shot.name}.png   ${title}`)
}

if (consoleErrors.length) {
  console.log('\n  console errors:')
  for (const e of [...new Set(consoleErrors)].slice(0, 8)) console.log('   -', e)
} else {
  console.log('\n  no console errors')
}

ws.close()
chrome.kill()
try { rmSync(profileDir, { recursive: true, force: true }) } catch { /* ignore */ }
process.exit(0)
