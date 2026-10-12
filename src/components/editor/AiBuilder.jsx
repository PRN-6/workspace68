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
      className="ws-ai-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && !loading && close()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-builder-title"
        className="ws-ai-modal flex max-h-[min(860px,94vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="ai-builder-title" className="text-base font-semibold text-slate-900">AI website builder</h2>
            <p className="mt-1 text-xs text-slate-500">Chat with a vision model to create and refine this page.</p>
          </div>
          <button type="button" onClick={close} aria-label="Close AI website builder" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </header>

        <div className="ws-scroll flex-1 space-y-4 overflow-y-auto p-5">
          <details
            className="rounded-xl border border-slate-200 p-4"
            open={settingsOpen}
            onToggle={(event) => setSettingsOpen(event.currentTarget.open)}
          >
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">AI provider settings</summary>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-slate-600 sm:col-span-2">
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
              <label className="text-xs font-medium text-slate-600">
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
              <label className="text-xs font-medium text-slate-600">
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
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
              Use a provider that supports OpenAI-compatible chat completions with image input.               Your API key, prompts, and reference image are sent directly to the endpoint above. The key stays in memory only and is not saved with your workspace. Browser access may depend on the provider&apos;s CORS settings.
            </p>
          </details>

          <div className="ws-ai-chat min-h-24 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            {messages.length === 0 ? (
              <p className="px-1 py-2 text-sm text-slate-500">
                Add a screenshot or mockup, then describe the website you want. Generated elements remain editable in the canvas.
              </p>
            ) : messages.map((message, index) => (
              <div key={`${index}-${message.role}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <p className={`max-w-[88%] rounded-xl px-3 py-2 text-xs leading-relaxed ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>
                  {message.text}
                </p>
              </div>
            ))}
            {loading && <p role="status" className="px-1 text-xs font-medium text-red-600">Designing your page…</p>}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="ai-reference-image" className="text-xs font-semibold text-slate-700">Reference image</label>
                <span className="text-[11px] text-slate-500">PNG, JPEG, WebP, GIF · up to 8 MB</span>
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
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <img src={image.dataUrl} alt="Selected website reference" className="h-16 w-24 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-700">{image.name}</p>
                    <button type="button" onClick={() => setImage(null)} className="mt-1 text-xs font-medium text-red-600 hover:text-red-700">Remove image</button>
                  </div>
                  <button type="button" onClick={() => imageInput.current?.click()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Change</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => imageInput.current?.click()}
                  className="flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-5 text-sm font-medium text-slate-600 transition hover:border-indigo-400 hover:bg-slate-50"
                >
                  + Choose a reference image
                </button>
              )}
            </div>

            <label htmlFor="ai-builder-prompt" className="block text-xs font-semibold text-slate-700">
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

            {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700">{error}</p>}

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">Your current page is undoable after generation.</p>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
