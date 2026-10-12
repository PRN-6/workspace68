import { COMPONENTS, buildElement } from '../data/components'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_RESPONSE_CHARS = 120_000
const MAX_ELEMENTS = 120
const MAX_DEPTH = 8

const STYLE_KEYS = new Set([
  'alignItems', 'alignSelf', 'background', 'backgroundColor', 'backgroundImage', 'border',
  'borderColor', 'borderRadius', 'borderStyle', 'borderWidth', 'boxShadow', 'color',
  'columnGap', 'cursor', 'display', 'flex', 'flexBasis', 'flexDirection', 'flexGrow',
  'flexShrink', 'flexWrap', 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'gap',
  'gridTemplateColumns', 'height', 'justifyContent', 'left', 'letterSpacing', 'lineHeight',
  'margin', 'marginBottom', 'marginLeft', 'marginRight', 'marginTop', 'maxHeight', 'maxWidth',
  'minHeight', 'minWidth', 'objectFit', 'opacity', 'overflow', 'padding', 'paddingBottom',
  'paddingLeft', 'paddingRight', 'paddingTop', 'position', 'right', 'textAlign',
  'textDecoration', 'textTransform', 'top', 'transform', 'width', 'zIndex',
])

function cleanText(value, fallback = '') {
  return typeof value === 'string' ? value.slice(0, 3000) : fallback
}

function safeStyle(style) {
  if (!style || typeof style !== 'object' || Array.isArray(style)) return {}
  return Object.fromEntries(
    Object.entries(style).filter(([key, value]) => {
      if (!STYLE_KEYS.has(key) || !['string', 'number'].includes(typeof value)) return false
      return typeof value === 'number' ||
        (value.length <= 200 && !/(url\s*\(|expression\s*\(|javascript:|@import|[<>])/i.test(value))
    })
  )
}

function safeImageSource(value) {
  if (typeof value !== 'string' || value.length > 2048) return ''
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function getChatCompletionsUrl(baseUrl) {
  let parsed
  try {
    parsed = new URL(baseUrl.trim())
  } catch {
    throw new Error('Enter a valid API base URL, such as https://api.openai.com/v1.')
  }
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('The API URL must use HTTP(S) and cannot contain credentials, a query, or a fragment.')
  }
  const endpoint = parsed.href.replace(/\/+$/, '')
  return endpoint.endsWith('/chat/completions') ? endpoint : `${endpoint}/chat/completions`
}

function extractJson(text) {
  const response = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = response.indexOf('{')
  if (start < 0) throw new Error('The AI response did not contain a JSON website layout.')

  let depth = 0
  let inString = false
  let escaped = false
  for (let index = start; index < response.length; index += 1) {
    const char = response[index]
    if (inString) {
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }
    if (char === '"') inString = true
    else if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return JSON.parse(response.slice(start, index + 1))
    }
  }
  throw new Error('The AI response contained incomplete JSON. Try again with a simpler request.')
}

export function normalizeAIElements(response) {
  const data = typeof response === 'string' ? extractJson(response) : response
  if (!data || typeof data !== 'object' || !Array.isArray(data.root)) {
    throw new Error('The AI response must contain a "root" array of website elements.')
  }

  let total = 0
  const normalize = (raw, depth) => {
    total += 1
    if (total > MAX_ELEMENTS) throw new Error(`The generated website exceeds the ${MAX_ELEMENTS}-element limit.`)
    if (depth > MAX_DEPTH) throw new Error(`The generated website exceeds the ${MAX_DEPTH}-level nesting limit.`)
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || !COMPONENTS[raw.type]) {
      throw new Error('The AI returned an unsupported website element.')
    }

    const element = buildElement(raw.type)
    element.name = cleanText(raw.name, element.name) || element.name
    element.style = { ...element.style, ...safeStyle(raw.style) }
    const rawProps = raw.props && typeof raw.props === 'object' && !Array.isArray(raw.props) ? raw.props : {}
    if (['heading', 'text', 'button'].includes(raw.type)) {
      element.props.text = cleanText(rawProps.text, element.props.text)
    } else if (raw.type === 'image') {
      element.props.src = safeImageSource(rawProps.src) || element.props.src
      element.props.alt = cleanText(rawProps.alt, element.props.alt)
    }
    if (raw.type === 'heading' && Number.isInteger(rawProps.level)) {
      element.props.level = Math.max(1, Math.min(6, rawProps.level))
    }
    if (COMPONENTS[raw.type].canHaveChildren) {
      if (raw.children != null && !Array.isArray(raw.children)) {
        throw new Error('The AI returned an invalid child element list.')
      }
      element.children = (raw.children || []).map((child) => normalize(child, depth + 1))
    }
    return element
  }

  if (data.root.length === 0) throw new Error('The AI did not generate any website elements.')
  return data.root.map((element) => normalize(element, 0))
}

export async function generateWebsite({
  baseUrl,
  apiKey,
  model,
  prompt,
  image,
  currentElements = [],
  signal,
}) {
  if (!apiKey.trim()) throw new Error('Enter an API key to connect to your AI provider.')
  if (!model.trim()) throw new Error('Enter the vision-capable model name for your provider.')
  if (!prompt.trim()) throw new Error('Describe the website you want to create.')
  if (!image?.dataUrl) throw new Error('Choose a reference image before generating the website.')

  const userContent = [
    {
      type: 'text',
      text: [
        `Create or refine the current website based on this request: ${prompt.trim()}`,
        currentElements.length
          ? `\nCurrent editable website layout (JSON): ${JSON.stringify({ root: currentElements })}`
          : '\nThis is a new website. Build the page from the reference image and request.',
        '\nMake the page responsive, use accessible text and semantic layout, and use the supplied image as visual reference. Keep image URLs to public HTTP(S) sources if images are needed. Do not include scripts, HTML strings, code, API keys, or explanations.',
        '\nReturn only a JSON object with this shape: {"root":[{"type":"section","name":"Hero","style":{"backgroundColor":"#111111","color":"#ffffff","padding":"64px 24px","display":"flex","flexDirection":"column","gap":"20px"},"props":{},"children":[{"type":"heading","props":{"text":"Page title","level":1},"style":{"fontSize":"48px","fontWeight":"700"}}]}]}.',
        '\nAllowed types: section, container, row, column, heading, text, button, image, spacer, divider. Components may have "name", "style", "props", and "children" where appropriate. Keep the result concise (about 20 elements or fewer).',
      ].join(' '),
    },
    { type: 'image_url', image_url: { url: image.dataUrl, detail: 'high' } },
  ]

  const response = await fetch(getChatCompletionsUrl(baseUrl), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model.trim(),
      messages: [
        {
          role: 'system',
          content: 'You are a website designer for workspace68. Follow the requested JSON schema exactly. Return valid JSON only.',
        },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
    }),
    signal,
  })

  const result = await response.json().catch(() => null)
  if (!response.ok) {
    const message = result?.error?.message || result?.message
    throw new Error(message || `The AI provider returned HTTP ${response.status}. Check your endpoint, model, and API key.`)
  }
  const content = result?.choices?.[0]?.message?.content
  const text = Array.isArray(content)
    ? content.filter((part) => part?.type === 'text').map((part) => part.text).join('\n')
    : content
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('The AI provider returned no website layout. Check that the selected model supports image input and chat completions.')
  }
  if (text.length > MAX_RESPONSE_CHARS) {
    throw new Error('The AI response was too large to safely import. Try asking for a simpler page.')
  }
  return normalizeAIElements(text)
}

export function readReferenceImage(file) {
  if (!file || !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
    return Promise.reject(new Error('Choose a valid image file as the website reference.'))
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return Promise.reject(new Error('Reference images must be 8 MB or smaller.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Could not read the selected reference image.'))
        return
      }
      resolve({ name: file.name, dataUrl: reader.result })
    }
    reader.onerror = () => reject(new Error('Could not read the selected reference image.'))
    reader.readAsDataURL(file)
  })
}
