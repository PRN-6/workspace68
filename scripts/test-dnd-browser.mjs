// Browser test for the editor's drag & drop, driven over the Chrome DevTools
// Protocol (no third-party test deps — uses Node's built-in WebSocket).
//
// Run: node scripts/test-dnd-browser.mjs
// Requires the dev server on http://localhost:5183 and a local Chrome.

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const APP_URL = process.env.APP_URL || 'http://localhost:5183/dnd-test.html'
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const PORT = 9400 + (process.pid % 500)

const profileDir = mkdtempSync(join(tmpdir(), 'ws68-'))
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profileDir}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1600,1000',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function getTarget() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page')
      if (page) return page
    } catch {
      /* chrome not up yet */
    }
    await sleep(250)
  }
  throw new Error('Chrome did not expose a debug target')
}

class Cdp {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      }
    })
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id)
          reject(new Error(`timeout: ${method}`))
        }
      }, 30000)
    })
  }
  async evaluate(expr) {
    const res = await this.send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    })
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || 'eval failed')
    }
    return res.result.value
  }
}

let failures = 0
function check(name, ok, detail = '') {
  if (ok) {
    console.log(`  ok   ${name}`)
  } else {
    failures++
    console.log(`  FAIL ${name}${detail ? `\n       ${detail}` : ''}`)
  }
}

async function main() {
  const target = await getTarget()
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve)
    ws.addEventListener('error', reject)
  })
  const cdp = new Cdp(ws)

  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')

  const errors = []
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails?.exception?.description || 'unknown error')
    }
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') {
      const text = msg.params.entry.text || ''
      // Ignore asset 404s (favicon etc.) — not app errors.
      if (!text.includes('404') && !text.includes('Failed to load resource')) {
        errors.push(text)
      }
    }
  })

  // Load the app. The editor route needs auth, so we stub the auth user and
  // the project fetch before the app boots.
  await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      const store = {
        access_token: 'test-token', refresh_token: 'r', expires_at: Math.floor(Date.now()/1000)+3600,
        user: { id: '11111111-1111-1111-1111-111111111111', email: 'test@example.com' },
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(store));
      window.__supabaseMock = true;
    `,
  })

  // The harness page stubs the Supabase REST calls itself, so no CDP-level
  // interception is needed here (which would also stall Vite's own requests).

  await cdp.send('Page.navigate', { url: APP_URL })
  await sleep(3500)

  // Logged-in view requires Supabase. Rather than fight auth, drive the editor
  // component directly through the app's own store, which is what the DnD
  // layer reads from.
  const booted = await cdp.evaluate(`document.body.innerText.slice(0, 200)`)
  console.log('\n  page says:', JSON.stringify(booted))

  // If we landed on the login screen, mount the editor manually.
  const onEditor = await cdp.evaluate(`!!document.querySelector('.ws-app')`)
  if (!onEditor) {
    console.log('\n  (auth wall — mounting editor directly)')
    const mounted = await cdp.evaluate(`
      (async () => {
        const mod = await import('/src/pages/EditorPage.jsx');
        const store = await import('/src/store/editorStore.js');
        const React = await import('react');
        const { createRoot } = await import('react-dom/client');
        const el = document.getElementById('root');
        createRoot(el).render(
          React.createElement(mod.default, { projectId: 'local-test' })
        );
        return 'rendered';
      })()
    `)
    console.log('  ', mounted)
    await sleep(2500)
  }

  const editorPresent = await cdp.evaluate(`!!document.querySelector('.ws-app')`)
  check('editor mounts', editorPresent)
  if (!editorPresent) {
    console.log('\n  could not mount the editor; aborting')
    return
  }

  // --- open the Blocks tab so the palette is visible ---
  const opened = await cdp.evaluate(`
    (() => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find(x => x.getAttribute('title') === 'Blocks');
      if (b) { b.click(); return true; }
      return false;
    })()
  `)
  check('can open the Blocks tab', opened)
  await sleep(700)

  // --- count palette cards & canvas elements before the drag ---
  // Palette cards are the buttons in the left sidebar; canvas elements are
  // the nodes the Canvas renders with id={element.id}.
  const before = await cdp.evaluate(`
    (() => {
      const page = window.__store.getState().currentPage();
      const root = page.root || [];
      const countAll = (nodes) => nodes.reduce(
        (n, el) => n + 1 + (el.children ? countAll(el.children) : 0), 0);
      let headings = 0;
      const walk = (nodes) => {
        for (const el of nodes) {
          if (el.type === 'heading') headings++;
          if (el.children?.length) walk(el.children);
        }
      };
      walk(root);
      const canvasCount = countAll(root);
      const paletteCards = [...document.querySelectorAll('aside button')]
        .filter(b => b.title && b.title.length > 3);
      return { paletteCount: paletteCards.length, canvasCount, headings,
               labels: paletteCards.map(b => b.title) };
    })()
  `)
  console.log('  ', JSON.stringify(before))
  check('palette blocks are visible', before.paletteCount > 0, `got ${before.paletteCount}`)

  const paletteCard = await cdp.evaluate(`
    (() => {
      // Palette cards carry the component description as their title.
      const el = [...document.querySelectorAll('aside [role="button"], aside button')]
        .find(b => (b.getAttribute('title') || '').startsWith('Big headline'));
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width/2, y: r.top + r.height/2, w: r.width, h: r.height };
    })()
  `)
  check('heading palette card is visible', !!paletteCard, JSON.stringify(paletteCard))

  // --- find a drop target on the canvas ---
  const dropTarget = await cdp.evaluate(`
    (() => {
      const page = window.__store.getState().currentPage();
      // Find the first leaf block (heading/text/button) in the tree.
      let leaf = null;
      const walk = (nodes) => {
        for (const el of nodes) {
          if (!leaf) {
            if (['heading','text','button'].includes(el.type) && !el.children?.length) leaf = el;
            if (el.children?.length) walk(el.children);
          }
        }
      };
      walk(page.root || []);
      if (!leaf) return null;
      const node = document.getElementById(leaf.id);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { id: leaf.id, type: leaf.type,
               x: r.left + r.width/2, y: r.top + r.height/2,
               top: r.top, bottom: r.bottom };
    })()
  `)
  check('canvas has droppable elements', !!dropTarget, JSON.stringify(dropTarget))

  if (paletteCard && dropTarget) {
    // --- perform a real drag with CDP mouse events ---
    const steps = 24
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mousePressed', x: paletteCard.x, y: paletteCard.y,
      button: 'left', buttons: 1, clickCount: 1,
    })
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      await cdp.send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: paletteCard.x + (dropTarget.x - paletteCard.x) * t,
        y: paletteCard.y + (dropTarget.y - paletteCard.y) * t,
        button: 'left', buttons: 1,
      })
      await sleep(12)
    }
    await sleep(150)

    // capture the drop hint while still dragging
    const hint = await cdp.evaluate(`
      (() => {
        const lines = [...document.querySelectorAll('div')].filter(d => {
          const s = getComputedStyle(d);
          return s.backgroundColor === 'rgb(225, 29, 51)' && s.position === 'absolute' && d.offsetHeight <= 6;
        });
        const overlays = [...document.querySelectorAll('div')].filter(d => d.textContent === 'Heading' && d.className.includes('rounded-full'));
        return { insertionLines: lines.length, overlay: overlays.length };
      })()
    `)
    console.log('   hint during drag:', JSON.stringify(hint))
    check('drop indicator appears while dragging', hint.insertionLines > 0 || hint.overlay > 0, JSON.stringify(hint))

    // The drag overlay chip should be visible while dragging. It renders in a
    // portal with the icon and label side by side.
    const overlayChip = await cdp.evaluate(`
      (() => {
        const el = [...document.querySelectorAll('div')].find(d => {
          if (!d.className.includes('pointer-events-none')) return false;
          if (!d.className.includes('rounded-full')) return false;
          const t = d.textContent.trim();
          return t === 'AaHeading' || t === 'Heading';
        });
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { text: el.textContent.trim(), x: Math.round(r.left), y: Math.round(r.top),
                 w: Math.round(r.width), h: Math.round(r.height) };
      })()
    `)
    console.log('   drag overlay chip:', JSON.stringify(overlayChip))
    check('drag overlay chip is shown', !!overlayChip, JSON.stringify(overlayChip))

    // Save a screenshot of the mid-drag state for visual review.
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' })
    const { writeFileSync } = await import('node:fs')
    writeFileSync('scripts/.drag-state.png', Buffer.from(shot.data, 'base64'))
    console.log('   screenshot: scripts/.drag-state.png')

    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased', x: dropTarget.x, y: dropTarget.y,
      button: 'left', buttons: 0, clickCount: 1,
    })
    await sleep(800)

    const after = await cdp.evaluate(`
      (() => {
        const page = window.__store.getState().currentPage();
        const countAll = (nodes) => nodes.reduce(
          (n, el) => n + 1 + (el.children ? countAll(el.children) : 0), 0);
        let headings = 0;
        const walk = (nodes) => {
          for (const el of nodes) {
            if (el.type === 'heading') headings++;
            if (el.children?.length) walk(el.children);
          }
        };
        walk(page.root || []);
        return { canvasCount: countAll(page.root || []), headings };
      })()
    `)
    console.log('   before:', JSON.stringify(before), 'after:', JSON.stringify(after))
    check('block was inserted by the drag', after.canvasCount > before.canvasCount,
      `canvas ${before.canvasCount} -> ${after.canvasCount}`)
    check('a heading was added', after.headings > before.headings,
      `headings ${before.headings} -> ${after.headings}`)
  }

  // --- second scenario: reorder existing canvas elements ---
  {
    const orderBefore = await cdp.evaluate(`
      (() => {
        const page = window.__store.getState().currentPage();
        const sec = (page.root || []).find(e => e.type === 'section');
        const col = sec?.children?.find(e => e.type === 'column');
        const kids = col?.children || [];
        return kids.map(k => ({ id: k.id, type: k.type, name: k.name }));
      })()
    `)
    console.log('   order before:', JSON.stringify(orderBefore.map(o => o.type)))

    if (orderBefore.length >= 2) {
      const picked = await cdp.evaluate(`
        (() => {
          const page = window.__store.getState().currentPage();
          const sec = (page.root || []).find(e => e.type === 'section');
          const col = sec?.children?.find(e => e.type === 'column');
          const first = col?.children?.[0];
          if (!first) return null;
          const node = document.getElementById(first.id);
          if (!node) return null;
          // Click the element to select it — the drag handle only appears
          // on the selected element's floating toolbar.
          const r = node.getBoundingClientRect();
          return { id: first.id, type: first.type,
                   x: r.left + 10, y: r.top + Math.min(r.height/2, 12) };
        })()
      `)

      if (picked) {
        // Select the element, then grab the ⠿ drag handle.
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: picked.x, y: picked.y, button: 'left', buttons: 1, clickCount: 1,
        })
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: picked.x, y: picked.y, button: 'left', buttons: 0, clickCount: 1,
        })
        await sleep(400)
      }

      const landed = await cdp.evaluate(`
        (() => {
          const page = window.__store.getState().currentPage();
          const sec = (page.root || []).find(e => e.type === 'section');
          const col = sec?.children?.find(e => e.type === 'column');
          const kids = col?.children || [];
          const last = kids[kids.length - 1];
          if (!last) return null;
          const node = document.getElementById(last.id);
          if (!node) return null;
          const r = node.getBoundingClientRect();
          return { id: last.id, x: r.left + 10, y: r.bottom - 6 };
        })()
      `)

      if (picked && landed) {
        // Grab the ⠿ drag handle on the selected element's floating toolbar.
        const handle = await cdp.evaluate(`
          (() => {
            const btn = [...document.querySelectorAll('button')]
              .find(b => (b.getAttribute('title') || '') === 'Drag to move');
            if (!btn) return null;
            const r = btn.getBoundingClientRect();
            if (!r.width) return null;
            return { x: r.left + r.width/2, y: r.top + r.height/2 };
          })()
        `)

        const from = handle || { x: picked.x, y: picked.y }
        const steps = 22
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mousePressed', x: from.x, y: from.y, button: 'left', buttons: 1, clickCount: 1,
        })
        for (let i = 1; i <= steps; i++) {
          const t = i / steps
          await cdp.send('Input.dispatchMouseEvent', {
            type: 'mouseMoved',
            x: from.x + (landed.x - from.x) * t,
            y: from.y + (landed.y - from.y) * t,
            button: 'left', buttons: 1,
          })
          await sleep(12)
        }
        await cdp.send('Input.dispatchMouseEvent', {
          type: 'mouseReleased', x: landed.x, y: landed.y, button: 'left', buttons: 0, clickCount: 1,
        })
        await sleep(700)
      }

      const orderAfter = await cdp.evaluate(`
        (() => {
          const page = window.__store.getState().currentPage();
          const sec = (page.root || []).find(e => e.type === 'section');
          const col = sec?.children?.find(e => e.type === 'column');
          return (col?.children || []).map(k => ({ id: k.id, type: k.type, name: k.name }));
        })()
      `)
      console.log('   order after: ', JSON.stringify(orderAfter.map(o => o.type)))
      check('canvas elements can be reordered by dragging',
        JSON.stringify(orderAfter.map(o => o.id)) !== JSON.stringify(orderBefore.map(o => o.id)),
        'order unchanged')
    }
  }

  check('no uncaught runtime errors', errors.length === 0, errors.slice(0, 3).join(' | '))

  ws.close()
}

main()
  .catch((e) => {
    console.error('\nTEST RUNNER ERROR:', e.message)
    failures++
  })
  .finally(async () => {
    chrome.kill()
    try { rmSync(profileDir, { recursive: true, force: true }) } catch { /* ignore */ }
    console.log(failures === 0 ? '\nAll browser tests passed.\n' : `\n${failures} browser test(s) failed.\n`)
    process.exit(failures === 0 ? 0 : 1)
  })
