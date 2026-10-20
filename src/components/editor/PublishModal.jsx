import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Globe, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react'

const RESERVED_SLUGS = [
  'admin',
  'api',
  'login',
  'register',
  'dashboard',
  'settings',
  'publishers',
  'auth',
  'reset-password',
  'forgot-password',
]

/** Turn a project name into a slug that passes validateSlug. */
function slugifyName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function PublishModal({ projectRecord, currentDocument, onClose, onPublished }) {
  const [slug, setSlug] = useState(
    projectRecord?.slug || slugifyName(projectRecord?.name) || ''
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

      // 1. Check if slug is used by someone else.
      // `maybeSingle()` errors when several rows match, so read the error
      // instead of assuming a null result means "free".
      const { data: existing, error: lookupError } = await supabase
        .from('published_sites')
        .select('project_id')
        .eq('slug', cleanSlug)
        .limit(1)

      if (lookupError) throw lookupError

      if (existing && existing.length > 0 && existing[0].project_id !== projectRecord.id) {
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
      // Supabase resolves with { error } instead of throwing, so check both
      // responses explicitly — otherwise a failed delete silently "succeeds".
      const { error: deleteError } = await supabase
        .from('published_sites')
        .delete()
        .eq('project_id', projectRecord.id)

      if (deleteError) throw deleteError

      const { data: updated, error: updateError } = await supabase
        .from('projects')
        .update({ status: 'draft' })
        .eq('id', projectRecord.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSuccessUrl('')
      setError('')
      if (onPublished) onPublished(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Unpublishing failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-lg animate-scale-in rounded-3xl border p-6 shadow-lift"
        style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)', color: 'var(--ws-text)' }}
      >
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--ws-border)' }}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl" style={{ background: 'var(--ws-accent-soft)', color: 'var(--ws-accent)' }}>
              <Globe className="h-[18px] w-[18px]" />
            </span>
            <h3 className="font-display text-base font-bold">Publish & Share Website</h3>
          </div>
          <button onClick={onClose} className="ws-icon-btn">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-crimson-500/30 bg-crimson-950/50 p-3 text-xs text-crimson-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successUrl && (
          <div className="mt-4 rounded-2xl border border-crimson-500/30 bg-crimson-950/20 p-4">
            <span className="text-xs font-semibold text-crimson-400">Website is live at:</span>
            <div className="mt-2 flex items-center justify-between rounded-xl border p-2 text-xs" style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}>
              <span className="truncate font-mono" style={{ color: 'var(--ws-text-2)' }}>{successUrl}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successUrl)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="ws-icon-btn !h-7 !min-w-7 !p-0"
                >
                  {copied ? <Check className="h-4 w-4 text-crimson-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <a href={successUrl} target="_blank" rel="noreferrer" className="ws-icon-btn !h-7 !min-w-7 !p-0">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handlePublish} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold" style={{ color: 'var(--ws-text-2)' }}>Public URL Slug</label>
            <div
              className="mt-1 flex items-center rounded-xl border px-3 py-2.5 text-sm transition focus-within:border-[var(--ws-accent)] focus-within:shadow-[0_0_0_3px_var(--ws-accent-soft)]"
              style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}
            >
              <span style={{ color: 'var(--ws-text-3)' }}>/publishers/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-transparent pl-1 font-mono focus:outline-none"
                style={{ color: 'var(--ws-text)' }}
                placeholder="myportfolio"
              />
            </div>
            <p className="mt-1 text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
              Only letters, numbers, and hyphens (e.g. <code className="text-crimson-400">my-portfolio</code>).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {projectRecord?.status === 'published' ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={loading}
                className="text-xs font-medium text-crimson-400 hover:underline"
              >
                Unpublish Site
              </button>
            ) : <div />}

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="ws-btn">
                Close
              </button>
              <button type="submit" disabled={loading} className="ws-btn ws-btn-primary disabled:opacity-50">
                {loading ? 'Publishing…' : projectRecord?.status === 'published' ? 'Republish Changes' : 'Publish Now'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
