import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Globe, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react'

const RESERVED_SLUGS = ['admin', 'api', 'login', 'register', 'dashboard', 'settings', 'publishers', 'auth']

export default function PublishModal({ projectRecord, currentDocument, onClose, onPublished }) {
  const [slug, setSlug] = useState(
    projectRecord?.slug ||
      projectRecord?.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
      ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successUrl, setSuccessUrl] = useState(
    projectRecord?.status === 'published' && projectRecord?.slug
      ? `${window.location.origin}/publishers/${projectRecord.slug}`
      : ''
  )
  const [copied, setCopied] = useState(false)

  const validateSlug = (val) => {
    const clean = val.trim().toLowerCase()
    if (!clean) return 'Slug cannot be empty'
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) {
      return 'Slug must use lowercase letters, numbers, and hyphens without leading or trailing hyphens'
    }
    if (RESERVED_SLUGS.includes(clean)) {
      return 'This slug is reserved by the platform'
    }
    return ''
  }

  const handlePublish = async (e) => {
    e.preventDefault()
    setError('')
    const valError = validateSlug(slug)
    if (valError) return setError(valError)

    setLoading(true)
    try {
      const cleanSlug = slug.trim().toLowerCase()

      // 1. Check if slug is used by someone else
      const { data: existing } = await supabase
        .from('published_sites')
        .select('project_id')
        .eq('slug', cleanSlug)
        .maybeSingle()

      if (existing && existing.project_id !== projectRecord.id) {
        throw new Error('This slug is already taken. Please pick another one.')
      }

      // 2. Upsert published snapshot into published_sites
      const { error: pubError } = await supabase
        .from('published_sites')
        .upsert(
          {
            project_id: projectRecord.id,
            owner_id: projectRecord.owner_id,
            slug: cleanSlug,
            published_document: currentDocument,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'project_id' }
        )

      if (pubError) throw pubError

      // 3. Mark project as published
      const { data: updatedProject, error: projError } = await supabase
        .from('projects')
        .update({
          status: 'published',
          slug: cleanSlug,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectRecord.id)
        .select()
        .single()

      if (projError) throw projError

      // 4. Save Version Snapshot
      await supabase.from('project_versions').insert({
        project_id: projectRecord.id,
        owner_id: projectRecord.owner_id,
        document_snapshot: currentDocument,
      })

      const publicUrl = `${window.location.origin}/publishers/${cleanSlug}`
      setSuccessUrl(publicUrl)
      if (onPublished) onPublished(updatedProject)
    } catch (err) {
      setError(err.message || 'Publishing failed')
    } finally {
      setLoading(false)
    }
  }

  const handleUnpublish = async () => {
    if (!window.confirm('Are you sure you want to unpublish this site? Public visitors will receive a 404.')) return
    setLoading(true)
    try {
      await supabase.from('published_sites').delete().eq('project_id', projectRecord.id)
      const { data: updated } = await supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', projectRecord.id)
        .select()
        .single()
      setSuccessUrl('')
      if (onPublished) onPublished(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Unpublishing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-red-500" />
            <h3 className="text-base font-semibold">Publish & Share Website</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-950/60 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successUrl && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/20 p-4">
            <span className="text-xs font-semibold text-red-400">Website is live at:</span>
            <div className="mt-2 flex items-center justify-between rounded-lg bg-[#070709] p-2 text-xs border border-zinc-800">
              <span className="truncate text-zinc-200 font-mono">{successUrl}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="rounded p-1 hover:bg-zinc-800"
                >
                  {copied ? <Check className="h-4 w-4 text-red-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                </button>
                <a href={successUrl} target="_blank" rel="noreferrer" className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePublish} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Public URL Slug</label>
            <div className="mt-1 flex items-center rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm focus-within:border-red-600">
              <span className="text-zinc-500">/publishers/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-transparent pl-1 font-mono text-white focus:outline-none"
                placeholder="myportfolio"
              />
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Only letters, numbers, and hyphens (e.g. <code className="text-red-400">my-portfolio</code>).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {projectRecord?.status === 'published' ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={loading}
                className="text-xs font-medium text-red-400 hover:underline"
              >
                Unpublish Site
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? 'Publishing…' : projectRecord?.status === 'published' ? 'Republish Changes' : 'Publish Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
