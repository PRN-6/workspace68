import { useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { generateWebsite, readReferenceImage } from '../../lib/aiWebsite'

function countElements(elements) {
  return elements.reduce((count, element) => count + 1 + countElements(element.children || []), 0)
}

export default function AiBuilder({ config, setConfig, onClose }) {
  const currentPage = useEditorStore((state) =>
    state.project.pages.find((page) => page.id === state.currentPageId)
  )
  const replaceCurrentPageRoot = useEditorStore((state) => state.replaceCurrentPageRoot)
  const imageInput = useRef(null)
  const controller = useRef(null)
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [messages, setMessages] = useState([])
  const [generatedOnce, setGeneratedOnce] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(!config.apiKey)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const close = () => {
    controller.current?.abort()
    onClose()
  }

  const updateConfig = (key, value) => {
    setConfig((current) => ({ ...current, [key]: value }))
  }

  const onChooseImage = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      setImage(await readReferenceImage(file))
      setError('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read this reference image.')
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const requestPrompt = prompt.trim()
    setError('')
    setLoading(true)
    setMessages((current) => [...current, { role: 'user', text: requestPrompt }])

    const requestController = new AbortController()
    controller.current = requestController
    const timeoutId = window.setTimeout(() => requestController.abort(), 90_000)
    try {
      const root = await generateWebsite({
        ...config,
        prompt: requestPrompt,
        image,
        currentElements: generatedOnce ? currentPage?.root || [] : [],
        signal: requestController.signal,
      })
      replaceCurrentPageRoot(root)
      setGeneratedOnce(true)
      setPrompt('')
      setMessages((current) => [
        ...current,
        { role: 'assistant', text: `Updated the page with ${countElements(root)} editable elements. You can refine it with another message.` },
      ])
    } catch (cause) {
      if (cause?.name === 'AbortError') {
        setError('The request was cancelled or timed out. Check the provider and try again.')
      } else if (cause instanceof TypeError) {
        setError('Could not reach the API. Check the endpoint, network, and whether the provider allows browser requests (CORS).')
      } else {
        setError(cause instanceof Error ? cause.message : 'Could not generate the website.')
      }
    } finally {
      window.clearTimeout(timeoutId)
      if (controller.current === requestController) controller.current = null
      setLoading(false)
    }
  }

  return (
    <div
      className="ws-ai-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && !loading && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-builder-title"
        className="ws-ai-modal flex max-h-[min(860px,94vh)] w-full max-w-3xl animate-scale-in flex-col overflow-hidden rounded-3xl border shadow-lift"
        style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)', color: 'var(--ws-text)' }}
      >
        <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--ws-border)' }}>
          <div>
            <h2 id="ai-builder-title" className="font-display text-base font-bold" style={{ color: 'var(--ws-text)' }}>
              AI website builder
            </h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--ws-text-3)' }}>
              Chat with a vision model to create and refine this page.
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close AI website builder" className="ws-icon-btn">
            ✕
          </button>
        </header>

        <div className="ws-scroll flex-1 space-y-4 overflow-y-auto p-5">
          <details
            className="rounded-2xl border p-4"
            style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}
            open={settingsOpen}
            onToggle={(event) => setSettingsOpen(event.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--ws-text)' }}>
              AI provider settings
            </summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium sm:col-span-2" style={{ color: 'var(--ws-text-2)' }}>
                OpenAI-compatible API base URL
                <input
                  className="ws-input mt-1"
                  type="url"
                  required
                  value={config.baseUrl}
                  onChange={(event) => updateConfig('baseUrl', event.target.value)}
                  placeholder="https://api.openai.com/v1"
                  autoComplete="url"
                />
              </label>
              <label className="text-xs font-medium" style={{ color: 'var(--ws-text-2)' }}>
                Vision model
                <input
                  className="ws-input mt-1"
                  required
                  value={config.model}
                  onChange={(event) => updateConfig('model', event.target.value)}
                  placeholder="gpt-4o-mini"
                  autoComplete="off"
                />
              </label>
              <label className="text-xs font-medium" style={{ color: 'var(--ws-text-2)' }}>
                API key
                <input
                  className="ws-input mt-1"
                  type="password"
                  required
                  value={config.apiKey}
                  onChange={(event) => updateConfig('apiKey', event.target.value)}
                  placeholder="Paste your provider key"
                  autoComplete="new-password"
                />
              </label>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
              Use a provider that supports OpenAI-compatible chat completions with image input. Your API key, prompts, and reference image are sent directly to the endpoint above. The key stays in memory only and is not saved with your workspace. Browser access may depend on the provider&apos;s CORS settings.
            </p>
          </details>

          <div
            className="ws-ai-chat min-h-24 space-y-3 rounded-2xl border p-3"
            style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}
          >
            {messages.length === 0 ? (
              <p className="px-1 py-2 text-sm" style={{ color: 'var(--ws-text-3)' }}>
                Add a screenshot or mockup, then describe the website you want. Generated elements remain editable in the canvas.
              </p>
            ) : messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    message.role === 'user' ? 'rounded-br-md bg-[#e11d33] text-white shadow-glow-sm' : 'rounded-bl-md border'
                  }`}
                  style={
                    message.role === 'user'
                      ? undefined
                      : { borderColor: 'var(--ws-border)', background: 'var(--ws-panel)', color: 'var(--ws-text-2)' }
                  }
                >
                  {message.text}
                </p>
              </div>
            ))}
            {loading && <p role="status" className="px-1 text-xs font-medium text-crimson-500">Designing your page…</p>}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="ai-reference-image" className="text-xs font-semibold" style={{ color: 'var(--ws-text-2)' }}>
                  Reference image
                </label>
                <span className="text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
                  PNG, JPEG, WebP, GIF · up to 8 MB
                </span>
              </div>
              <input
                ref={imageInput}
                id="ai-reference-image"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={onChooseImage}
              />
              {image ? (
                <div className="flex items-center gap-3 rounded-2xl border p-3" style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}>
                  <img src={image.dataUrl} alt="Selected website reference" className="h-16 w-24 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium" style={{ color: 'var(--ws-text-2)' }}>{image.name}</p>
                    <button type="button" onClick={() => setImage(null)} className="mt-1 text-xs font-medium text-crimson-500 hover:text-crimson-400">
                      Remove image
                    </button>
                  </div>
                  <button type="button" onClick={() => imageInput.current?.click()} className="ws-btn">
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInput.current?.click()}
                  className="flex w-full items-center justify-center rounded-2xl border border-dashed px-4 py-5 text-sm font-medium transition hover:-translate-y-0.5"
                  style={{ borderColor: 'var(--ws-border-strong)', color: 'var(--ws-text-3)', background: 'var(--ws-panel-2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ws-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ws-border-strong)')}
                >
                  + Choose a reference image
                </button>
              )}
            </div>

            <label htmlFor="ai-builder-prompt" className="block text-xs font-semibold" style={{ color: 'var(--ws-text-2)' }}>
              Your message
              <textarea
                id="ai-builder-prompt"
                className="ws-input mt-1 min-h-24 resize-y"
                required
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Create a responsive portfolio that matches this reference. Use a dark background, bold typography, and red accent buttons…"
              />
            </label>

            {error && <p role="alert" className="rounded-xl bg-crimson-950/60 px-3 py-2 text-xs leading-relaxed text-crimson-400">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
                Your current page is undoable after generation.
              </p>
              <button
                type="submit"
                disabled={loading}
                className="ws-btn ws-btn-primary !px-4 !py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Generating…' : generatedOnce ? 'Send & update page' : 'Generate website'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
