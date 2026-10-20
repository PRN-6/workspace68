import { slugify } from './id'
import { TAGS, styleToJsLiteral } from './style'
import { COMPONENTS } from '../data/components'

const IND = '  '

const ANIM_HIDDEN = {
  'fade': "  'fade': { opacity: 0 },\n",
  'fade-up': "  'fade-up': { opacity: 0, transform: 'translateY(28px)' },\n",
  'fade-down': "  'fade-down': { opacity: 0, transform: 'translateY(-28px)' },\n",
  'fade-left': "  'fade-left': { opacity: 0, transform: 'translateX(28px)' },\n",
  'fade-right': "  'fade-right': { opacity: 0, transform: 'translateX(-28px)' },\n",
  'zoom-in': "  'zoom-in': { opacity: 0, transform: 'scale(0.92)' },\n",
  'zoom-out': "  'zoom-out': { opacity: 0, transform: 'scale(1.06)' },\n",
}

function pascal(name) {
  const base = name.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('') || 'Page'
  return base
}

function cap(tag) {
  return tag.charAt(0).toUpperCase() + tag.slice(1)
}

function tagFor(el) {
  return el.type === 'heading' ? `h${el.props?.level || 1}` : TAGS[el.type] || 'div'
}

function anchorAttr(el) {
  const a = el.action || {}
  if (!a.type || a.type === 'none' || !a.value) return null
  const target = JSON.stringify(a.newTab === false ? '_self' : '_blank')
  if (a.type === 'url') return `href={${JSON.stringify(a.value)}} target={${target}} rel="noreferrer"`
  if (a.type === 'page') return `href="#/" onClick={(e) => { e.preventDefault(); navigate(${JSON.stringify(a.value)}) }}`
  if (a.type === 'scroll')
    return `href={"#${a.value}"} onClick={(e) => { e.preventDefault(); document.getElementById(${JSON.stringify(a.value)})?.scrollIntoView({ behavior: 'smooth' }) }}`
  return null
}

function clickAttr(el) {
  const a = el.action || {}
  if (!a.type || a.type === 'none' || !a.value) return null
  const target = JSON.stringify(a.newTab === false ? '_self' : '_blank')
  if (a.type === 'url') return `onClick={() => window.open(${JSON.stringify(a.value)}, ${target})}`
  if (a.type === 'page') return `onClick={() => navigate(${JSON.stringify(a.value)})}`
  if (a.type === 'scroll')
    return `onClick={() => document.getElementById(${JSON.stringify(a.value)})?.scrollIntoView({ behavior: 'smooth' })}`
  return null
}

function revealAttr(el) {
  const a = el.animation
  if (!a || a.type === 'none') return null
  const props = {
    type: a.type,
    trigger: a.trigger || 'scroll',
    duration: Number(a.duration) || 0.6,
    delay: Number(a.delay) || 0,
    easing: a.easing || 'ease-out',
  }
  return `reveal={${JSON.stringify(props).replace(/"([a-zA-Z]+)":/g, '$1:')}}`
}

function genElement(el, level, cx) {
  const pad = IND.repeat(level)
  const def = COMPONENTS[el.type]
  const isContainer = !!def?.canHaveChildren
  const tag = tagFor(el)
  const reveal = !!(el.animation && el.animation.type !== 'none')
  const TagName = reveal ? `Anim${cap(tag)}` : tag
  if (reveal) cx.animated.add(tag)

  const exportedStyle = { ...el.style }
  if (el.type === 'section') {
    delete exportedStyle.left
    delete exportedStyle.top
    delete exportedStyle.right
    delete exportedStyle.bottom
    exportedStyle.width = '100%'
    if (!exportedStyle.position) exportedStyle.position = 'relative'
  } else if (isContainer && exportedStyle.position !== 'absolute') {
    exportedStyle.position = 'relative'
  }
  const attrs = [`id={${JSON.stringify(el.id)}}`, `style={${styleToJsLiteral(exportedStyle)}}`]
  if (reveal) attrs.push(revealAttr(el))

  if (el.type === 'image') {
    const click = clickAttr(el)
    if (click) attrs.push(click)
    const s = `src={${JSON.stringify(el.props.src || '')}}`
    const a = `alt={${JSON.stringify(el.props.alt || 'Image')}}`
    const idx = attrs.findIndex((x) => x.startsWith('style='))
    if (idx >= 0) attrs.splice(idx + 1, 0, s, a)
    else attrs.push(s, a)
    return `${pad}<${TagName} ${attrs.join(' ')} />`
  } else if (el.type === 'spacer' || el.type === 'divider') {
    return `${pad}<${TagName} ${attrs.join(' ')} />`
  } else if (el.type === 'button') {
    const aa = anchorAttr(el)
    if (aa) attrs.push(aa)
  } else if (!isContainer) {
    const c = clickAttr(el)
    if (c) attrs.push(c)
  }

  const open = `${pad}<${TagName} ${attrs.join(' ')}>`
  const close = `${pad}</${TagName}>`

  if (isContainer) {
    const children = el.children?.length
      ? '\n' + el.children.map((c) => genElement(c, level + 1, cx)).join('\n') + `\n${pad}`
      : ''
    return `${open}${children}${close}`
  }

  let txt = ''
  if (el.type === 'heading') txt = el.props.text || 'Heading'
  else if (el.type === 'text') txt = el.props.text || ''
  else if (el.type === 'button') txt = el.props.text || 'Button'
  const esc = String(txt)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/{/g, '&#123;')
    .replace(/}/g, '&#125;')
  return `${open}${esc}${close}`
}

function genPageJsx(page, fileName, path, cx) {
  const imports = []
  const top = []
  const Name = fileName
  if (cx.usesNavigate) imports.push(`import { useNavigate } from 'react-router-dom'`)
  if (cx.animated.size) {
    imports.push(`import { createAnimated } from '../lib/animations'`)
    for (const t of [...cx.animated].sort()) {
      top.push(`const Anim${cap(t)} = createAnimated(${JSON.stringify(t)})`)
    }
  }
  const header = imports.join('\n')
  const nav = cx.usesNavigate ? `  const navigate = useNavigate()\n` : ''
  const body = page.root.length
    ? page.root.map((el) => genElement(el, 2, cx)).join('\n')
    : `  {/* Drag & drop blocks here in WebSmith Studio to populate this page */}`
  const head = `${header ? header + '\n\n' : ''}${top.length ? top.join('\n') + '\n\n' : ''}`
  const rootNeedsPosition = page.root.some((el) => el.style.position === 'absolute')
  const wrapper = rootNeedsPosition ? "<main style={{ position: 'relative', minHeight: '100vh' }}>" : '<>'
  const closeWrapper = rootNeedsPosition ? '</main>' : '</>'
  return `${head}export default function ${Name}() {\n${nav}  return (\n    ${wrapper}\n${body}\n    ${closeWrapper}\n  )\n}`
}

function analyzeUsages(page) {
  const cx = { animated: new Set(), usesNavigate: false }
  const scan = (nodes) => {
    for (const el of nodes) {
      if (el.animation && el.animation.type !== 'none') cx.animated.add(tagFor(el))
      if (el.action && el.action.type === 'page' && el.action.value) cx.usesNavigate = true
      if (el.children?.length) scan(el.children)
    }
  }
  scan(page.root)
  return cx
}

export function generateProjectFiles(project) {
  const name = project.name || 'My Website'
  const slug = slugify(name) || 'site'
  const files = {}

  const usedPaths = new Set(['/'])
  const pageFiles = []
  const pageLabels = new Map()
  project.pages.forEach((page, i) => {
    let p = page.path && page.path.startsWith('/') ? page.path : '/'
    if (p === '/') p = i === 0 ? '/' : '/page'
    let candidate = p
    let n = 1
    while (usedPaths.has(candidate)) {
      n += 1
      candidate = p.replace(/\/+$/, '') + '-' + n
    }
    usedPaths.add(candidate)
    const baseName = pascal(page.name) || 'Page'
    let fileName = baseName === pageFiles[0]?.baseName ? baseName + (i + 1) : baseName
    let f = fileName
    let k = 1
    while (pageLabels.has(f)) {
      k += 1
      f = baseName + k
    }
    fileName = f
    pageLabels.set(fileName, true)
    pageFiles.push({ page, fileName, path: candidate, baseName })
    if (i === 0) pageFiles[i].path = '/'
  })

  // ---- package.json ----
  files['package.json'] = JSON.stringify(
    {
      name: slug,
      private: true,
      version: '1.0.0',
      type: 'module',
      scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
      dependencies: {
        react: '^18.3.1',
        'react-dom': '^18.3.1',
        'react-router-dom': '^6.26.2',
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.3.1',
        autoprefixer: '^10.4.19',
        postcss: '^8.4.39',
        tailwindcss: '^3.4.10',
        vite: '^5.4.2',
      },
    },
    null,
    2
  )

  files['vite.config.js'] = `import { defineConfig } from 'vite'\nimport react from '@vitejs/plugin-react'\n\nexport default defineConfig({ plugins: [react()] })\n`
  files['tailwind.config.js'] = `/** @type {import('tailwindcss').Config} */\nexport default { content: ['./index.html', './src/**/*.{js,jsx}'], theme: { extend: {} }, plugins: [] }\n`
  files['postcss.config.js'] = `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }\n`
  files['index.html'] = `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${escapeHtml(name)}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.jsx"></script>\n  </body>\n</html>\n`
  files['README.md'] = `# ${name}\n\nBuilt with [WebSmith Studio](https://localhost).\n\n## Run\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n### Pages\n${pageFiles.map((p) => `- \`${p.path}\` -> ${p.fileName}`).join('\n')}\n`
  files['src/main.jsx'] = `import React from 'react'\nimport ReactDOM from 'react-dom/client'\nimport App from './App'\nimport './index.css'\n\nReactDOM.createRoot(document.getElementById('root')).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n)\n`
  files['src/index.css'] = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n* { box-sizing: border-box; }\nhtml, body, #root { margin: 0; padding: 0; }\nbody { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }\nimg { max-width: 100%; }\n`
  files['src/lib/animations.jsx'] = animationsLib()

  const routePieces = pageFiles.map((p) => `        <Route path={${JSON.stringify(p.path)}} element={<${p.fileName} />} />`)
  const importPieces = pageFiles.map((p) => `import ${p.fileName} from './pages/${p.fileName}'`)
  const first = pageFiles[0]
  files['src/App.jsx'] = `import { BrowserRouter, Routes, Route } from 'react-router-dom'\n${importPieces.join('\n')}\n\nexport default function App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n${routePieces.join('\n')}\n        <Route path="*" element={<${first.fileName} />} />\n      </Routes>\n    </BrowserRouter>\n  )\n}\n`

  for (const pf of pageFiles) {
    const cx = analyzeUsages(pf.page)
    files[`src/pages/${pf.fileName}.jsx`] = genPageJsx(pf.page, pf.fileName, pf.path, cx)
  }

  return files
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function animationsLib() {
  return `import { useEffect, useRef, useState } from 'react'

const ANIM_STYLES = {
${Object.values(ANIM_HIDDEN).join('')}}

export function useReveal({ type = 'none', trigger = 'scroll', duration = 0.6, delay = 0, easing = 'ease-out' } = {}) {
  const ref = useRef(null)
  const inactive = !type || type === 'none'
  const [shown, setShown] = useState(Boolean(inactive))
  const [animDone, setAnimDone] = useState(Boolean(inactive))

  useEffect(() => {
    if (inactive) {
      setShown(true)
      setAnimDone(true)
      return
    }
    setShown(false)
    setAnimDone(false)
    if (trigger === 'load') {
      const timer = setTimeout(() => {
        setShown(true)
      }, 50)
      return () => clearTimeout(timer)
    }
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inactive, type, trigger])

  useEffect(() => {
    if (!shown || inactive) return
    const dur = Number(duration) || 0.6
    const del = Number(delay) || 0
    const totalMs = Math.round((dur + del) * 1000) + 70
    const timer = setTimeout(() => {
      setAnimDone(true)
    }, totalMs)
    return () => clearTimeout(timer)
  }, [shown, inactive, duration, delay])

  if (inactive) return { ref, style: {} }
  const hidden = ANIM_STYLES[type] || null
  if (!hidden) return { ref, style: {} }
  const dur = Number(duration) || 0.6
  const del = Number(delay) || 0

  const style = animDone
    ? {}
    : {
        ...(shown ? {} : hidden),
        transition: \`opacity \${dur}s \${easing} \${del}s, transform \${dur}s \${easing} \${del}s\`,
      }

  return { ref, style }
}

export function createAnimated(tag) {
  const El = tag
  return function Animated({ reveal, children, ...rest }) {
    const { ref, style } = useReveal(reveal || {})
    return (
      <El ref={ref} {...rest} style={{ ...(rest.style || {}), ...style }}>
        {children}
      </El>
    )
  }
}
`
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}