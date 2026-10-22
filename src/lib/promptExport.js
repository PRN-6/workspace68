// Turns a design into a precise brief that an AI coding tool can build from.
//
// The whole point of the editor is that the design leaves as something an
// agent can act on: not a screenshot, but a description of every screen,
// every block, every style and every interaction.

const STYLE_KEYS = [
  'display',
  'flexDirection',
  'justifyContent',
  'alignItems',
  'gap',
  'gridTemplateColumns',
  'width',
  'maxWidth',
  'height',
  'minHeight',
  'padding',
  'margin',
  'marginLeft',
  'marginTop',
  'backgroundColor',
  'color',
  'fontSize',
  'fontWeight',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'border',
  'borderWidth',
  'borderStyle',
  'borderColor',
  'borderRadius',
  'boxShadow',
  'opacity',
  'position',
  'left',
  'top',
  'aspectRatio',
  'objectFit',
]

function compactStyles(style) {
  if (!style) return ''
  const parts = STYLE_KEYS.filter((key) => style[key] !== undefined && style[key] !== '')
    .map((key) => `${key}: ${style[key]}`)
  return parts.join('; ')
}

function describeProps(type, props) {
  if (!props) return ''
  const bits = []
  if (props.text) bits.push(`"${props.text}"`)
  if (props.title) bits.push(`title "${props.title}"`)
  if (props.label) bits.push(`label "${props.label}"`)
  if (props.variant) bits.push(`variant: ${props.variant}`)
  if (props.items) {
    const items = Array.isArray(props.items)
      ? props.items.map((item) => (typeof item === 'string' ? item : item.title)).filter(Boolean)
      : []
    if (items.length) bits.push(`items: ${items.join(', ')}`)
  }
  if (props.links) bits.push(`links: ${[].concat(props.links).join(', ')}`)
  if (props.src) bits.push(`image: ${props.src}`)
  if (props.href) bits.push(`href: ${props.href}`)
  if (props.value !== undefined && !bits.length) bits.push(`value: ${props.value}`)
  if (!bits.length) return ''
  return ` — ${bits.join(', ')}`
}

function describeAction(action, pages) {
  if (!action || action.type === 'none' || !action.value) return ''
  if (action.type === 'page') {
    const target = pages.find((p) => p.path === action.value)
    return ` → opens screen "${target?.name || action.value}"`
  }
  if (action.type === 'url') return ` → opens ${action.value}${action.newTab === false ? ' (same tab)' : ' (new tab)'}`
  if (action.type === 'scroll') return ` → scrolls to #${action.value}`
  return ''
}

function describeBlock(element, pages, depth) {
  const indent = '  '.repeat(depth)
  const type = element.name || element.type
  const styles = compactStyles(element.style)
  const props = describeProps(element.type, element.props)
  const action = describeAction(element.action, pages)
  const animation =
    element.animation && element.animation.type && element.animation.type !== 'none'
      ? ` [animate ${element.animation.type} on ${element.animation.animationTrigger || element.animation.trigger}]`
      : ''

  const lines = [`${indent}- ${type}${props}${action}${animation}`]
  if (styles) lines.push(`${indent}  style: ${styles}`)
  if (element.children?.length) {
    for (const child of element.children) {
      lines.push(...describeBlock(child, pages, depth + 1))
    }
  }
  return lines
}

export function buildDesignPrompt(project) {
  if (!project) return ''
  const pages = project.pages || []
  const theme = project.theme || {}

  const lines = []
  lines.push(`# ${project.name || 'Untitled design'} — build brief`)
  lines.push('')
  lines.push(
    'Build this design as a responsive React app (React 18 + Tailwind CSS). ' +
      'Create one component per block, keep the markup semantic, and make every screen work at desktop, tablet and mobile widths.'
  )
  lines.push('')

  if (Object.keys(theme).length) {
    lines.push('## Theme')
    if (theme.seed) lines.push(`- Accent colour: ${theme.seed}`)
    if (theme.radius) lines.push(`- Corner radius: ${theme.radius}`)
    if (theme.font) lines.push(`- Font family: ${theme.font}`)
    if (theme.scheme) lines.push(`- Colour scheme: ${theme.scheme}`)
    lines.push('')
  }

  lines.push('## Screens')
  pages.forEach((page, index) => {
    lines.push('')
    lines.push(`### ${index + 1}. ${page.name} (${page.path || '/'})`)
    if (!page.root?.length) {
      lines.push('- (empty screen)')
      return
    }
    for (const element of page.root) {
      lines.push(...describeBlock(element, pages, 0))
    }
  })

  const links = []
  for (const page of pages) {
    const walk = (nodes) => {
      for (const node of nodes) {
        if (node.action?.type === 'page' && node.action.value) {
          links.push(`- On "${page.name}", the ${node.name || node.type} "${node.props?.text || node.props?.title || ''}" goes to ${node.action.value}.`)
        }
        if (node.children?.length) walk(node.children)
      }
    }
    walk(page.root || [])
  }
  if (links.length) {
    lines.push('')
    lines.push('## Screen flow')
    lines.push(...links)
  }

  lines.push('')
  lines.push('## Notes')
  lines.push('- Match the spacing, colours and typography above exactly.')
  lines.push('- Keep the blocks in the order they appear in each screen.')
  lines.push('- Make every interactive element keyboard reachable and add a visible focus state.')

  return lines.join('\n')
}

export async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  // Fallback for browsers that block the async clipboard API.
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(area)
  return ok
}
