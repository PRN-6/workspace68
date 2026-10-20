import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const APP_URL = process.env.APP_URL || 'http://localhost:5183/dnd-test.html'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9334

const profileDir = mkdtempSync(join(tmpdir(), 'ws68-diag-'))
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profileDir}`,
  '--headless=new', '--no-first-run', '--disable-gpu', '--window-size=1600,1000', 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const t = (await res.json()).find((x) => x.type === 'page')
      if (t) return t
    } catch {}
    await sleep(250)
  }
  throw new Error('no target')
}

const target = await getTarget()
const ws = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej) })

let id = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  if (m.method === 'Runtime.consoleAPICalled') {
    console.log('  [console.' + m.params.type + ']', m.params.args.map(a => a.value ?? a.description).join(' '))
  }
  if (m.method === 'Runtime.exceptionThrown') {
    console.log('  [EXCEPTION]', m.params.exceptionDetails?.exception?.description?.slice(0, 400))
  }
  if (m.method === 'Log.entryAdded') {
    console.log('  [log.' + m.params.entry.level + ']', m.params.entry.text?.slice(0, 300))
  }
})
const send = (method, params = {}) => {
  const i = ++id
  return new Promise((res) => { pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
}

await send('Page.enable')
await send('Runtime.enable')
await send('Log.enable')
await send('Page.navigate', { url: APP_URL })
await sleep(5000)

const res = await send('Runtime.evaluate', {
  expression: `JSON.stringify({ body: document.body.innerText.slice(0,300), html: document.getElementById('root')?.innerHTML.length, ws: !!document.querySelector('.ws-app') })`,
  returnByValue: true,
})
console.log('\n  state:', res.result.value)

chrome.kill()
rmSync(profileDir, { recursive: true, force: true })
process.exit(0)
