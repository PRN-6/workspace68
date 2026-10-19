import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { TAGS } from '../lib/style'

function PublicElement({ element }) {
  const Tag = TAGS[element.type] || 'div'
  const isSection = element.type === 'section'
  const isContainer = ['section', 'container', 'row', 'column'].includes(element.type)
  const position = isSection ? 'relative' : (element.style?.position || (isContainer ? 'relative' : undefined))

  const style = {
    ...element.style,
    ...(position ? { position } : {}),
    ...(isSection ? { width: '100%' } : {}),
  }

  if (isSection) {
    delete style.left
    delete style.top
    delete style.right
    delete style.bottom
  }

  if (element.type === 'image') {
    return <img src={element.props?.src} alt={element.props?.alt || ''} style={style} />
  }

  if (element.type === 'divider') return <hr style={style} />
  if (element.type === 'spacer') return <div style={style} />

  if (element.type === 'button') {
    const isUrl = element.action?.type === 'url'
    const href = isUrl ? (element.action.value || '#') : '#'
    return (
      <a
        href={href}
        style={{
          ...style,
          cursor: 'pointer',
          textDecoration: 'none',
          display: style.display || 'inline-block',
        }}
        target={isUrl && element.action?.newTab !== false ? '_blank' : undefined}
        rel={isUrl ? 'noopener noreferrer' : undefined}
      >
        {element.props?.text || 'Button'}
      </a>
    )
  }

  const children = element.children?.map((c) => <PublicElement key={c.id} element={c} />)

  let content = null
  if (element.type === 'heading' || element.type === 'text') {
    content = element.props?.text
  }

  return (
    <Tag style={style}>
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (notFound || !site?.pages?.[0]) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h1 className="text-4xl font-extrabold text-red-500">404</h1>
          <h2 className="mt-2 text-lg font-semibold">Website Not Found</h2>
          <p className="mt-2 text-xs text-slate-400">
            The website at <code className="text-indigo-400">/publishers/{slug}</code> does not exist or has been unpublished by the creator.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Create Your Own Website
          </Link>
        </div>
      </div>
    )
  }

  const homePage = site.pages[0]

  return (
    <div className="min-h-screen w-full bg-white">
      {homePage.root.map((el) => (
        <PublicElement key={el.id} element={el} />
      ))}
    </div>
  )
}
