import { useEffect, useRef, useState } from 'react'
import { TAGS, ANIM_STYLES } from '../../lib/style'
import { useEditorStore } from '../../store/editorStore'

function useReveal(anim) {
  const ref = useRef(null)
  const inactive = !anim || anim.type === 'none'
  const [shown, setShown] = useState(inactive || anim.trigger !== 'scroll')
  useEffect(() => {
    if (inactive || anim.trigger !== 'scroll') return
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            io.disconnect()
          }
        })
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inactive, anim?.trigger])

  if (inactive) return { ref, style: {} }
  const hidden = ANIM_STYLES[anim.type] || null
  const dur = Number(anim.duration) || 0.6
  const delay = Number(anim.delay) || 0
  const style = hidden
    ? {
        ...(shown ? {} : hidden),
        transition: `opacity ${dur}s ${anim.easing || 'ease-out'} ${delay}s, transform ${dur}s ${anim.easing || 'ease-out'} ${delay}s`,
      }
    : {}
  return { ref, style }
}

function actionHandlers(action) {
  if (!action || action.type === 'none' || !action.value) return {}
  const store = useEditorStore.getState()
  if (action.type === 'url') {
    return {
      onClick: () => window.open(action.value, action.newTab === false ? '_self' : '_blank'),
      style: { cursor: 'pointer' },
    }
  }
  if (action.type === 'scroll') {
    return {
      onClick: () => document.getElementById(action.value)?.scrollIntoView({ behavior: 'smooth' }),
      style: { cursor: 'pointer' },
    }
  }
  if (action.type === 'page') {
    return {
      onClick: () => {
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
  const style = { ...element.style, ...revealStyle, ...action.style }
  const common = { id: element.id, style, onClick: action.onClick }

  if (element.type === 'image') {
    return <img ref={ref} {...common} src={element.props.src} alt={element.props.alt} />
  }
  if (element.type === 'divider') return <hr ref={ref} {...common} />
  if (element.type === 'spacer') return <div ref={ref} {...common} />

  const children = element.children?.map((c) => <PreviewElement key={c.id} element={c} />)

  let content = null
  if (element.type === 'heading' || element.type === 'text' || element.type === 'button') {
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
    <div className="ws-canvas-workspace ws-scroll flex-1 overflow-y-auto bg-slate-100 p-6">
      <div className="mx-auto overflow-hidden rounded-xl bg-white shadow-xl" style={{ maxWidth: widthFor(viewport) }}>
        <div className="min-h-[70vh]">
          {page.root.map((el) => (
            <PreviewElement key={el.id} element={el} />
          ))}
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