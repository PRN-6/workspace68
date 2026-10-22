import { useLayoutEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import * as T from '../../lib/tree'
import { ArrowRight, MousePointerClick } from 'lucide-react'

// A map of the screens and how they link together. Arrows come from the
// "go to screen" action on any block, so the map always matches the design.

function collectLinks(pages) {
  const links = []
  for (const page of pages) {
    T.walk(page.root || [], (element) => {
      if (element.action?.type === 'page' && element.action.value) {
        const target = pages.find((p) => p.path === element.action.value)
        if (target && target.id !== page.id) {
          links.push({
            from: page.id,
            to: target.id,
            label: element.props?.text || element.props?.title || element.name || element.type,
          })
        }
      }
    })
  }
  return links
}

export default function FlowMap() {
  const pages = useEditorStore((s) => s.project.pages)
  const currentPageId = useEditorStore((s) => s.currentPageId)
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage)

  const containerRef = useRef(null)
  const cardRefs = useRef({})
  const [boxes, setBoxes] = useState({})
  const [size, setSize] = useState({ width: 0, height: 0 })

  const links = collectLinks(pages)

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      if (!container) return
      const next = {}
      for (const page of pages) {
        const node = cardRefs.current[page.id]
        if (!node) continue
        const rect = node.getBoundingClientRect()
        const parentRect = container.getBoundingClientRect()
        next[page.id] = {
          top: rect.top - parentRect.top,
          bottom: rect.bottom - parentRect.top,
          right: rect.right - parentRect.left,
        }
      }
      setBoxes(next)
      setSize({ width: container.clientWidth, height: container.scrollHeight })
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [pages, links.length])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
        Every screen in this design and where each tap leads. Arrows come from the
        &ldquo;Go to screen&rdquo; action on a block.
      </p>

      <div ref={containerRef} className="relative pr-12">
        {/* Arrows are drawn behind the cards in the right-hand gutter. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          {links.map((link, index) => {
            const from = boxes[link.from]
            const to = boxes[link.to]
            if (!from || !to) return null
            const x = from.right
            const y1 = (from.top + from.bottom) / 2
            const y2 = (to.top + to.bottom) / 2
            const bulge = Math.max(20, Math.abs(y2 - y1) / 2)
            const path = `M ${x} ${y1} C ${x + bulge} ${y1}, ${x + bulge} ${y2}, ${x} ${y2}`
            return (
              <g key={`${link.from}-${link.to}-${index}`}>
                <path
                  d={path}
                  fill="none"
                  stroke="var(--ws-accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.7"
                />
                <path
                  d={`M ${x} ${y2} L ${x - 5} ${y2 - 4} L ${x - 5} ${y2 + 4} Z`}
                  fill="var(--ws-accent)"
                  opacity="0.8"
                />
              </g>
            )
          })}
        </svg>

        {pages.map((page, index) => {
          const isCurrent = page.id === currentPageId
          const outgoing = links.filter((link) => link.from === page.id)
          return (
            <div
              key={page.id}
              ref={(node) => {
                if (node) cardRefs.current[page.id] = node
              }}
              onClick={() => setCurrentPage(page.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setCurrentPage(page.id)}
              className="mb-2 cursor-pointer rounded-2xl border p-3 transition hover:-translate-y-0.5"
              style={{
                borderColor: isCurrent ? 'var(--ws-accent)' : 'var(--ws-border)',
                background: isCurrent ? 'var(--ws-accent-soft)' : 'var(--ws-panel)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{
                      background: isCurrent ? 'var(--ws-accent)' : 'var(--ws-panel-3)',
                      color: isCurrent ? 'var(--ws-accent-text)' : 'var(--ws-text-2)',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="truncate text-xs font-semibold" style={{ color: 'var(--ws-text)' }}>
                    {page.name}
                  </span>
                </div>
                <span className="font-mono text-[10px]" style={{ color: 'var(--ws-text-3)' }}>
                  {page.path}
                </span>
              </div>

              {outgoing.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {outgoing.map((link, i) => {
                    const target = pages.find((p) => p.id === link.to)
                    return (
                      <span
                        key={`${link.to}-${i}`}
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: 'var(--ws-panel-3)', color: 'var(--ws-text-2)' }}
                      >
                        <ArrowRight size={9} />
                        {target?.name}
                      </span>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-1.5 text-[10px]" style={{ color: 'var(--ws-text-3)' }}>
                  No outgoing taps
                </p>
              )}
            </div>
          )
        })}

        {pages.length === 0 && (
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-3 py-8 text-center"
            style={{ borderColor: 'var(--ws-border)' }}
          >
            <MousePointerClick size={18} style={{ color: 'var(--ws-text-3)' }} />
            <p className="text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
              Add a screen to start mapping the flow.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
