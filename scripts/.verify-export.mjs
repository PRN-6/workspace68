// End-to-end check of the React export: generate a project that uses every
// block type, then build the generated project with Vite.
//
// Run: node scripts/.verify-export.mjs
import { createServer } from 'vite'
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'

const OUT = 'scripts/.shots'

const server = await createServer({
  configFile: 'vite.config.js',
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
})
const { generateProjectFiles } = await server.ssrLoadModule('/src/lib/generateProject.js')
const { COMPONENTS } = await server.ssrLoadModule('/src/data/components.js')
await server.close()

// A page that uses every single block type, so the export has to handle all
// of them.
const types = Object.keys(COMPONENTS)
const children = types.map((type, i) => ({
  id: `el_${i}`,
  type,
  name: COMPONENTS[type].label,
  style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' },
  props: { ...(COMPONENTS[type].defaults?.props || {}) },
  action: type === 'button' || type === 'link' ? { type: 'url', value: 'https://example.com' } : { type: 'none' },
  children: [],
}))

const doc = {
  name: 'Export Check',
  theme: { seed: '#e11d33', radius: '16px', font: 'Inter', scheme: 'light' },
  pages: [
    {
      id: 'pg1',
      name: 'Home',
      path: '/',
      root: [
        {
          id: 'el_sec',
          type: 'section',
          name: 'Section',
          style: { display: 'flex', flexDirection: 'column', gap: '16px', padding: '40px' },
          props: {},
          action: { type: 'none' },
          children,
        },
      ],
    },
    { id: 'pg2', name: 'Pricing', path: '/pricing', root: [] },
  ],
}

const files = generateProjectFiles(doc)
console.log('generated files:', Object.keys(files).length)
console.log('blocks file   :', !!files['src/components/blocks.jsx'])

// Write the project out and build it.
const dir = mkdtempSync(join(tmpdir(), 'ws68-export-'))
mkdirSync(OUT, { recursive: true })
for (const [rel, content] of Object.entries(files)) {
  const target = join(dir, rel)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, content)
}

// Reuse the host project's node_modules so the build does not need a network.
const { symlinkSync } = await import('node:fs')
try {
  symlinkSync(join(process.cwd(), 'node_modules'), join(dir, 'node_modules'), 'junction')
} catch (err) {
  console.log('symlink node_modules failed:', err.message)
}

const build = spawn('npx', ['vite', 'build'], { cwd: dir, shell: true })
let out = ''
build.stdout.on('data', (d) => (out += d))
build.stderr.on('data', (d) => (out += d))
const code = await new Promise((resolve) => build.on('close', resolve))

console.log('\n--- build output ---')
console.log(out.trim().split('\n').slice(-25).join('\n'))

if (code !== 0) {
  console.log('\nEXPORT BUILD: FAILED')
  rmSync(dir, { recursive: true, force: true })
  process.exit(1)
}
console.log('\nEXPORT BUILD: OK')

// ---- render the exported site and look for problems --------------------
// A plain static server for dist/, so the check does not depend on a second
// vite process starting up.
const http = await import('node:http')
const fs = await import('node:fs')
const dist = join(dir, 'dist')
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
}
const preview = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  let file = join(dist, url)
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = join(dist, 'index.html')
  const ext = file.slice(file.lastIndexOf('.'))
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
  res.end(fs.readFileSync(file))
})
await new Promise((r) => preview.listen(4319, '127.0.0.1', r))

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9900 + (process.pid % 300)
const profileDir = mkdtempSync(join(tmpdir(), 'ws68-export-chrome-'))
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
    '--window-size=1400,1400',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let target = null
for (let i = 0; i < 80 && !target; i++) {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
    target = (await res.json()).find((t) => t.type === 'page')
  } catch {
    /* not up yet */
  }
  if (!target) await sleep(250)
}

const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  ws.addEventListener('open', res)
  ws.addEventListener('error', rej)
})

let msgId = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    if (m.error) reject(new Error(JSON.stringify(m.error)))
    else resolve(m.result)
  }
  if (m.method === 'Runtime.exceptionThrown') {
    errors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 300) || 'error')
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    errors.push(m.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 300))
  }
})
const send = (method, params = {}) => {
  const i = ++msgId
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
  if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description || 'eval failed')
  return res.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', {
  width: 1400,
  height: 1400,
  deviceScaleFactor: 1,
  mobile: false,
})
await send('Page.navigate', { url: 'http://127.0.0.1:4319/' })
await sleep(4000)

const rendered = await evaluate(`(() => {
  const body = document.body
  const nestedAnchors = body.querySelectorAll('a a').length
  const h1 = body.querySelectorAll('h1').length
  const imgs = body.querySelectorAll('img').length
  const empty = [...body.querySelectorAll('*')].filter((n) => n.children.length === 0 && !n.textContent.trim() && n.tagName !== 'INPUT' && n.tagName !== 'BR').length
  return {
    href: location.href,
    title: document.title,
    nestedAnchors, h1, imgs,
    textLen: body.innerText.length,
    empty,
    html: body.innerHTML.slice(0, 400),
  }
})()`)
console.log('\nrendered   ->', JSON.stringify(rendered))

const png = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
writeFileSync(join(OUT, 'v-export.png'), Buffer.from(png.data, 'base64'))

if (errors.length) {
  console.log('\nexport console errors:')
  for (const e of [...new Set(errors)].slice(0, 10)) console.log('  -', e)
} else {
  console.log('\nexport: no console errors')
}

ws.close()
chrome.kill()
// Chrome keeps its profile files open for a moment after the kill signal,
// so wait for it to actually exit before removing the directory.
await new Promise((resolve) => {
  if (chrome.exitCode !== null) return resolve()
  chrome.on('exit', resolve)
  setTimeout(resolve, 3000)
})
preview.close()
for (const target of [dir, profileDir]) {
  try {
    rmSync(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  } catch {
    /* the OS may still hold a handle; the temp dir is disposable */
  }
}
process.exit(0)
