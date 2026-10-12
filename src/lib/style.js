// style values are stored as plain strings/number, ready to be used directly
// as a React inline style object AND serialized into exported source code.

export const TAGS = {
  section: 'section',
  container: 'div',
  row: 'div',
  column: 'div',
  heading: 'h1',
  text: 'p',
  button: 'a',
  image: 'img',
  spacer: 'div',
  divider: 'hr',
}

export function isFlexish(style) {
  return typeof style?.display === 'string' && style.display.includes('flex')
}

export function quote(value) {
  return JSON.stringify(String(value))
}

export function styleToJsLiteral(style) {
  const entries = Object.entries(style || {})
  if (!entries.length) return '{}'
  const parts = entries.map(([k, v]) => `  ${JSON.stringify(k)}: ${quote(v)}`)
  return '{\n' + parts.join(',\n') + '\n}'
}

export function hasChildren(type) {
  return ['section', 'container', 'row', 'column'].includes(type)
}

// ---- box shorthand parsing (e.g. "40px 24px" -> top/right/bottom/left) ----
export function parseBox(value) {
  if (value == null) return { mode: 1, top: '', right: '', bottom: '', left: '' }
  const parts = String(value).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { mode: 1, top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
  if (parts.length === 2) return { mode: 2, top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
  if (parts.length === 3) return { mode: 3, top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] }
  if (parts.length === 4) return { mode: 4, top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
  return { mode: 4, top: '', right: '', bottom: '', left: '' }
}

export function boxToCss({ top, right, bottom, left }) {
  return [top, right, bottom, left].join(' ').trim()
}

// ---- animation transform presets (shared canvas preview + export) ----
export const ANIM_STYLES = {
  'fade': { opacity: 0, transform: 'none' },
  'fade-up': { opacity: 0, transform: 'translateY(28px)' },
  'fade-down': { opacity: 0, transform: 'translateY(-28px)' },
  'fade-left': { opacity: 0, transform: 'translateX(28px)' },
  'fade-right': { opacity: 0, transform: 'translateX(-28px)' },
  'zoom-in': { opacity: 0, transform: 'scale(0.92)' },
  'zoom-out': { opacity: 0, transform: 'scale(1.06)' },
}

export const ANIM_NAMES = Object.keys(ANIM_STYLES)

export function animTransition(anim) {
  const dur = Number(anim.duration || 0.6)
  const delay = Number(anim.delay || 0)
  return `opacity ${dur}s ${anim.easing || 'ease-out'} ${delay}s, transform ${dur}s ${anim.easing || 'ease-out'} ${delay}s`
}

export const SHADOW_PRESETS = [
  { label: 'Soft', value: '0 1px 2px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06)' },
  { label: 'Medium', value: '0 4px 12px rgba(15,23,42,0.1)' },
  { label: 'Large', value: '0 12px 28px rgba(15,23,42,0.16)' },
  { label: 'Glow', value: '0 0 24px rgba(239,68,68,0.35)' },
]