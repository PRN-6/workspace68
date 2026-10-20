// Screenshot the editor's left-panel tabs (Screens / Blocks / Layers).
// Run: node scripts/shots-editor.mjs
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BASE = process.env.BASE || 'http://localhost:5183'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9700 + (process.pid % 250)
const OUT = 'scripts/.shots'

const profileDir = mkdtempSync(join(tmpdir(), 'ws68-ed-'))
mkdirSync(OUT, { recursive: true })

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`,
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--disable-gpu',
  '--hide-scrollbars', '--window-size=1600,1000', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const t = (await res.json()).find((x) => x.type === 'page')
      if (t) return t
    } catch { /* not up */ }
    await sleep(250)
  }
  throw new Error('no target')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })

let id = 0
const pending = new Map()
const errors = []
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description?.slice(0, 200))
})
const send = (method, params = {}) => {
  const i = ++id
  return new Promise((res) => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
}
const evaluate = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return res.exceptionDetails ? null : res.result.value
}

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false })
await send('Page.navigate', { url: `${BASE}/dnd-test.html` })
await sleep(5000)

for (const tab of ['Screens', 'Blocks', 'Layers']) {
  const ok = await evaluate(`
    (() => {
      const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('title')||'') === '${tab}');
      if (!b) return false;
      b.click();
      return true;
    })()
  `)
  await sleep(900)
  const png = await send('Page.captureScreenshot', { format: 'png' })
  const name = `editor-${tab.toLowerCase()}`
  writeFileSync(join(OUT, `${name}.png`), Buffer.from(png.data, 'base64'))
  console.log(`  ${name}.png  (tab clicked: ${ok})`)
}

// Hover state on a palette card, to check the drag affordance.
await evaluate(`
  (() => {
    const b = [...document.querySelectorAll('button')].find(x => (x.getAttribute('title')||'') === 'Blocks');
    if (b) b.click();
  })()
`)
await sleep(600)
const hovered = await evaluate(`
  (() => {
    const cards = [...document.querySelectorAll('aside button')].filter(b => b.title && b.title.length > 3);
    const c = cards[0];
    if (!c) return null;
    c.dispatchEvent(new MouseEvent('mouseover', {bubbles:true}));
    c.dispatchEvent(new MouseEvent('mouseenter', {bubbles:true}));
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2), count: cards.length };
  })()
`)
if (hovered) {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hovered.x, y: hovered.y })
  await sleep(500)
  const png = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, 'editor-blocks-hover.png'), Buffer.from(png.data, 'base64'))
  console.log(`  editor-blocks-hover.png  (${hovered.count} palette cards)`)
}

if (errors.length) console.log('  errors:', errors.slice(0, 3))
ws.close()
chrome.kill()
try { rmSync(profileDir, { recursive: true, force: true }) } catch { /* ignore */ }
process.exit(0)
