import { useEffect, useRef, useState } from 'react'
import { TAGS } from '../../lib/style'
import { useReveal } from '../../lib/useReveal'
import { useEditorStore } from '../../store/editorStore'

function actionHandlers(action) {
  if (!action || action.type === 'none' || !action.value) return {}
  const store = useEditorStore.getState()
  if (action.type === 'url') {
    return {
      onClick: (e) => {
        e.preventDefault()
        window.open(action.value, action.newTab === false ? '_self' : '_blank')
      },
      style: { cursor: 'pointer' },
    }
  }
  if (action.type === 'scroll') {
    return {
      onClick: (e) => {
        e.preventDefault()
        const target = document.getElementById(action.value)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      },
      style: { cursor: 'pointer' },
    }
  }
  if (action.type === 'page') {
    return {
      onClick: (e) => {
        e.preventDefault()
        const target = store.project.pages.find((p) => p.path === action.value)
        if (target) store.setPreviewPage(target.id)
      },
      style: { cursor: 'pointer' },
    }
  }
  return {}
}

function PreviewElement({ element }) {
  const { ref, style: revealStyle } = useReveal(element.animation)
  const action = actionHandlers(element.action)
  const Tag = TAGS[element.type] || 'div'

  const isSection = element.type === 'section'
  const isContainer = ['section', 'container', 'row', 'column'].includes(element.type)
  const position = isSection ? 'relative' : (element.style.position || (isContainer ? 'relative' : undefined))

  const style = {
    ...element.style,
    ...revealStyle,
    ...action.style,
    ...(position ? { position } : {}),
    ...(isSection ? { width: '100%', overflow: 'hidden' } : {}),
  }

  if (isSection) {
    delete style.left
    delete style.top
    delete style.right
    delete style.bottom
  }

  const common = { id: element.id, style, onClick: action.onClick }

  // Wrap images in a div container (matching canvas rendering behavior)
  // Layout styles (flex, position, margin) go on the wrapper div,
  // image-specific styles (objectFit, borderRadius) go on the <img>.
  if (element.type === 'image') {
    const imgStyle = { ...element.style, display: 'block' }
    // Remove layout-level styles from <img> - they belong on the wrapper
    for (const key of ['position', 'left', 'top', 'right', 'bottom', 'margin', 'flex', 'alignSelf']) {
      delete imgStyle[key]
    }
    return (
      <div ref={ref} {...common}>
        <img
          src={element.props.src}
          alt={element.props.alt}
          style={imgStyle}
          draggable={false}
        />
      </div>
    )
  }
  if (element.type === 'divider') return <hr ref={ref} {...common} />
  if (element.type === 'spacer') return <div ref={ref} {...common} />

  if (element.type === 'button') {
    const isUrl = element.action?.type === 'url'
    const isScroll = element.action?.type === 'scroll'
    const href = isUrl ? (element.action.value || '#') : isScroll ? `#${element.action.value}` : '#'

    const handleClick = (e) => {
      if (action.onClick) {
        action.onClick(e)
      } else {
        e.preventDefault()
      }
    }

    return (
      <a
        ref={ref}
        id={element.id}
        href={href}
        style={{
          ...style,
          cursor: 'pointer',
          textDecoration: 'none',
          display: style.display || 'inline-block',
        }}
        className="ws-preview-btn transition hover:brightness-110 active:scale-95"
        onClick={handleClick}
        target={isUrl && element.action.newTab !== false ? '_blank' : undefined}
        rel={isUrl ? 'noopener noreferrer' : undefined}
      >
        {element.props.text || 'Button'}
      </a>
    )
  }

  const children = element.children?.map((c) => <PreviewElement key={c.id} element={c} />)

  let content = null
  if (element.type === 'heading' || element.type === 'text') {
    content = element.props.text
  }

  return (
    <Tag ref={ref} {...common}>
      {content}
      {children}
    </Tag>
  )
}

export default function Preview() {
  const pages = useEditorStore((s) => s.project.pages)
  const previewPageId = useEditorStore((s) => s.previewPageId)
  const currentPageId = useEditorStore((s) => s.currentPageId)
  const viewport = useEditorStore((s) => s.viewport)

  const page = pages.find((p) => p.id === (previewPageId || currentPageId)) || pages[0]

  return (
    <div className="ws-canvas-workspace ws-canvas-grid ws-scroll flex-1 overflow-y-auto p-8">
      <div
        className="mx-auto overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-black/5 transition-all"
        style={{ maxWidth: widthFor(viewport) }}
      >
        <div className="relative w-full" style={{ minHeight: '70vh' }}>
          {(page?.root || []).map((el) => (
            <PreviewElement key={el.id} element={el} />
          ))}
          {!page && (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-2 text-center">
              <p className="font-display text-base font-bold text-slate-700">Nothing to preview yet</p>
              <p className="max-w-xs text-xs text-slate-400">
                Add a screen from the Screens panel, then build it out on the canvas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function widthFor(v) {
  if (v === 'mobile') return '420px'
  if (v === 'tablet') return '820px'
  return '100%'
}