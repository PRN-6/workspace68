import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TAGS } from '../lib/style'
import { useReveal } from '../lib/useReveal'

function PublicElement({ element, onNavigatePage }) {
  const { ref, style: revealStyle } = useReveal(element.animation)
  const Tag = TAGS[element.type] || 'div'
  const isSection = element.type === 'section'
  const isContainer = ['section', 'container', 'row', 'column'].includes(element.type)
  const position = isSection ? 'relative' : (element.style?.position || (isContainer ? 'relative' : undefined))

  const baseStyle = {
    ...element.style,
    ...(position ? { position } : {}),
    ...(isSection ? { width: '100%', overflow: 'hidden' } : {}),
    ...revealStyle,
  }

  if (isSection) {
    delete baseStyle.left
    delete baseStyle.top
    delete baseStyle.right
    delete baseStyle.bottom
  }

  // Wrap images in a div container (matching canvas rendering behavior)
  // Layout styles (flex, position, margin) go on the wrapper div,
  // image-specific styles (objectFit, borderRadius, width, height) go on the <img>.
  if (element.type === 'image') {
    const imgStyle = { ...element.style, display: 'block' }
    for (const key of ['position', 'left', 'top', 'right', 'bottom', 'margin', 'flex', 'alignSelf']) {
      delete imgStyle[key]
    }
    return (
      <div ref={ref} id={element.id} style={baseStyle}>
        <img
          src={element.props?.src}
          alt={element.props?.alt || ''}
          style={imgStyle}
          draggable={false}
        />
      </div>
    )
  }

  if (element.type === 'divider') {
    return <hr ref={ref} id={element.id} style={baseStyle} />
  }

  if (element.type === 'spacer') {
    return <div ref={ref} id={element.id} style={baseStyle} />
  }

  if (element.type === 'button') {
    const isUrl = element.action?.type === 'url'
    const isScroll = element.action?.type === 'scroll'
    const isPage = element.action?.type === 'page'
    const href = isUrl
      ? (element.action?.value || '#')
      : isScroll
      ? `#${element.action?.value}`
      : '#'

    const handleClick = (e) => {
      if (isScroll && element.action?.value) {
        e.preventDefault()
        const target = document.getElementById(element.action.value)
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' })
        }
      } else if (isPage && onNavigatePage) {
        e.preventDefault()
        onNavigatePage(element.action?.value)
      } else if (!isUrl) {
        e.preventDefault()
      }
    }

    return (
      <a
        ref={ref}
        id={element.id}
        href={href}
        style={{
          ...baseStyle,
          cursor: 'pointer',
          textDecoration: 'none',
          display: baseStyle.display || 'inline-block',
        }}
        className="ws-preview-btn transition hover:brightness-110 active:scale-95"
        onClick={handleClick}
        target={isUrl && element.action?.newTab !== false ? '_blank' : undefined}
        rel={isUrl ? 'noopener noreferrer' : undefined}
      >
        {element.props?.text || 'Button'}
      </a>
    )
  }

  const children = element.children?.map((c) => (
    <PublicElement key={c.id} element={c} onNavigatePage={onNavigatePage} />
  ))

  let content = null
  if (element.type === 'heading' || element.type === 'text') {
    content = element.props?.text
  }

  return (
    <Tag ref={ref} id={element.id} style={baseStyle}>
      {content}
      {children}
    </Tag>
  )
}

export default function PublicSite() {
  const { slug } = useParams()
  const [site, setSite] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [currentPageId, setCurrentPageId] = useState(null)

  useEffect(() => {
    async function fetchPublishedSite() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('published_sites')
          .select('published_document')
          .eq('slug', slug.toLowerCase())
          .maybeSingle()

        if (error || !data) {
          setNotFound(true)
        } else {
          setSite(data.published_document)
          if (data.published_document?.name) {
            document.title = data.published_document.name
          }
          if (data.published_document?.pages?.[0]?.id) {
            setCurrentPageId(data.published_document.pages[0].id)
          }
        }
      } catch (err) {
        console.error('Error fetching published site:', err)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchPublishedSite()
  }, [slug])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-slate-800">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-crimson-600 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !site?.pages?.[0]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-white">
        <div className="max-w-md rounded-3xl border border-ink-700 bg-ink-850 p-8 shadow-lift">
          <h1 className="font-display text-4xl font-bold text-red-500">404</h1>
          <h2 className="mt-2 font-display text-lg font-semibold">Website Not Found</h2>
          <p className="mt-2 text-xs text-zinc-400">
            The website at <code className="text-crimson-400">/publishers/{slug}</code> does not exist or has been unpublished by the creator.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-full bg-crimson-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:bg-crimson-500 hover:shadow-glow"
          >
            Create Your Own Website
          </Link>
        </div>
      </div>
    )
  }

  const handleNavigatePage = (targetPathOrId) => {
    if (!targetPathOrId || !site?.pages) return
    const match = site.pages.find((p) => p.id === targetPathOrId || p.path === targetPathOrId)
    if (match) {
      setCurrentPageId(match.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const activePage = site.pages.find((p) => p.id === currentPageId) || site.pages[0]

  return (
    <div className="min-h-screen w-full bg-white">
      {activePage.root.map((el) => (
        <PublicElement
          key={el.id}
          element={el}
          onNavigatePage={handleNavigatePage}
        />
      ))}
    </div>
  )
}
