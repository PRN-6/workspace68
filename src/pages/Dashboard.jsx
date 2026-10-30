import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  createProject,
  deleteProject,
  duplicateProject,
  listProjects,
} from '../lib/projects'
import { createPortfolioPage } from '../data/templates'
import {
  AlertTriangle,
  Check,
  Cloud,
  Copy,
  Edit3,
  ExternalLink,
  FolderOpen,
  Globe,
  Layers,
  Link2,
  LogOut,
  Plus,
  Rocket,
  Search,
  Settings as SettingsIcon,
  Trash2,
  X,
} from 'lucide-react'

function formatRelativeTime(value) {
  if (!value) return 'Just now'
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return 'Just now'
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000))
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString()
}

function starterDocument(name) {
  return {
    name,
    pages: [createPortfolioPage()],
  }
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const result = await listProjects()
      setProjects(Array.isArray(result) ? result : [])
    } catch (err) {
      // Never block the page — fall back to an empty list and show a notice.
      setProjects([])
      setLoadError(err?.message || 'Could not load your projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
    // Reload when the user signs in or out — the visible set of projects changes.
  }, [loadProjects, user?.id])

  const handleCreateProject = async (event) => {
    event?.preventDefault()
    const name = newProjectName.trim() || 'Untitled project'
    try {
      setCreating(true)
      setCreateError(null)
      const project = await createProject(name, starterDocument(name))
      if (!project?.id) throw new Error('The project could not be created.')
      setModalOpen(false)
      setNewProjectName('')
      navigate(`/editor/${project.id}`)
    } catch (err) {
      setCreateError(err?.message || 'Something went wrong while creating the project.')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This cannot be undone.`
    )
    if (!confirmed) return
    try {
      setBusyId(project.id)
      await deleteProject(project.id)
      setProjects((prev) => prev.filter((p) => p.id !== project.id))
    } catch (err) {
      setLoadError(err?.message || 'Could not delete that project.')
    } finally {
      setBusyId(null)
    }
  }

  const handleDuplicateProject = async (project) => {
    if (!project?.document) {
      setLoadError('That project has no saved content to duplicate.')
      return
    }
    try {
      setBusyId(project.id)
      const copy = await duplicateProject(project)
      if (copy) setProjects((prev) => [copy, ...prev])
    } catch (err) {
      setLoadError(err?.message || 'Could not duplicate that project.')
    } finally {
      setBusyId(null)
    }
  }

  const copyPublicUrl = async (project) => {
    const url = `${window.location.origin}/publishers/${project.slug}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Clipboard can be blocked — fall back to a temporary textarea.
      const field = document.createElement('textarea')
      field.value = url
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      try {
        document.execCommand('copy')
      } catch {
        /* nothing else we can do */
      }
      document.body.removeChild(field)
    }
    setCopiedId(project.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter((p) => (p.name || '').toLowerCase().includes(query))
  }, [projects, search])

  const totalCount = projects.length
  const liveCount = projects.filter((p) => p.status === 'published').length
  const draftCount = totalCount - liveCount

  const stats = [
    { label: 'Total projects', value: totalCount, icon: Layers, accent: false },
    { label: 'Drafts', value: draftCount, icon: Globe, accent: false },
    { label: 'Live', value: liveCount, icon: Rocket, accent: true },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-zinc-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-crimson-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-crimson-800/10 blur-[130px]" />

      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-sm font-bold text-white shadow-glow-sm">
                W
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-white">workspace68</span>
            </Link>
            <span className="hidden text-xs font-semibold text-zinc-500 sm:inline">Dashboard</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-white"
                >
                  <SettingsIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Settings</span>
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  title="Sign out"
                  className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-crimson-400"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <span className="hidden text-[11px] text-zinc-500 md:inline">
                  Projects are saved in this browser
                </span>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-white"
                >
                  <Cloud className="h-3.5 w-3.5" />
                  Sign in to sync
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main container */}
      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Primary CTA */}
        <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 p-7 shadow-lift sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-crimson-600/20 blur-3xl" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Start a new <span className="text-crimson-500">design</span>
              </h1>
              <p className="mt-2.5 text-sm text-zinc-400">
                A blank canvas is one click away. No account, no setup — your work is saved in this browser
                automatically.
              </p>
              {!user && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-3 py-1.5 text-[11px] text-zinc-400">
                  <Link2 className="h-3 w-3 text-crimson-500" />
                  Working locally. Sign in later to sync across devices.
                </p>
              )}
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setNewProjectName('')
                  setCreateError(null)
                  setModalOpen(true)
                }}
                className="flex items-center justify-center gap-2 rounded-full bg-crimson-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-crimson-500 hover:shadow-glow active:translate-y-0"
              >
                <Plus className="h-4 w-4" />
                Start a new design
              </button>
              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-full border border-ink-600 bg-ink-900 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-white"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>

        {/* Error notice — never blocks the page */}
        {loadError && (
          <div className="animate-fade-up mt-6 flex items-start gap-3 rounded-2xl border border-crimson-600/30 bg-crimson-600/10 px-4 py-3 text-xs text-crimson-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-crimson-500" />
            <div className="flex-1">
              <p className="font-semibold text-crimson-300">{loadError}</p>
              <p className="mt-0.5 text-crimson-200/70">
                Everything else on this page still works. You can retry loading your projects.
              </p>
            </div>
            <button
              type="button"
              onClick={loadProjects}
              className="shrink-0 rounded-full border border-crimson-600/40 px-3 py-1 text-[11px] font-semibold text-crimson-200 transition hover:bg-crimson-600/20"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="animate-fade-up group relative overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 p-5 transition hover:-translate-y-1 hover:border-ink-600"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {stat.accent && (
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-crimson-600/20 blur-2xl transition group-hover:bg-crimson-600/30" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">{stat.label}</span>
                  <Icon className={`h-4 w-4 ${stat.accent ? 'text-crimson-500' : 'text-zinc-600'}`} />
                </div>
                <p className={`mt-2 font-display text-3xl font-bold ${stat.accent ? 'text-crimson-500' : 'text-white'}`}>
                  {stat.value}
                </p>
              </div>
            )
          })}
        </div>

        {/* Search */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search projects"
              className="w-full rounded-full border border-ink-700 bg-ink-850 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-crimson-600 focus:outline-none focus:ring-4 focus:ring-crimson-600/15"
            />
          </div>
          {search.trim() && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="flex items-center gap-1 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition hover:border-crimson-600/40 hover:text-white"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>

        {/* Projects */}
        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-3xl border border-ink-700 bg-ink-850/60"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="animate-fade-up mt-6 rounded-3xl border border-dashed border-ink-700 bg-ink-900/50 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-crimson-600/10 shadow-glow-sm">
              {search.trim() ? (
                <Search className="h-8 w-8 text-crimson-500" />
              ) : (
                <FolderOpen className="h-8 w-8 text-crimson-500" />
              )}
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-white">
              {search.trim() ? 'No projects match that search' : 'Nothing here yet — let’s make something'}
            </h3>
            <p className="mx-auto mt-1.5 max-w-sm text-xs text-zinc-400">
              {search.trim()
                ? 'Try a different name, or clear the search to see everything in this browser.'
                : 'Start with a blank canvas and drop in your first parts. Everything saves locally, instantly.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {search.trim() ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="rounded-full border border-ink-600 bg-ink-850 px-5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-crimson-600/50 hover:text-white"
                >
                  Clear search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNewProjectName('')
                    setCreateError(null)
                    setModalOpen(true)
                  }}
                  className="flex items-center gap-2 rounded-full bg-crimson-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:bg-crimson-500"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Start a new design
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, i) => {
              const isLive = project.status === 'published'
              const isCloud = project.source === 'cloud'
              const busy = busyId === project.id
              return (
                <div
                  key={project.id}
                  className="animate-fade-up group flex flex-col justify-between rounded-3xl border border-ink-700 bg-ink-850 p-5 transition hover:-translate-y-1 hover:border-crimson-600/40 hover:shadow-glow-sm"
                  style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="truncate font-display font-semibold text-white" title={project.name}>
                        {project.name}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          isLive
                            ? 'border border-crimson-600/40 bg-crimson-600/10 text-crimson-400'
                            : 'bg-ink-700 text-zinc-400'
                        }`}
                      >
                        {isLive ? '● Live' : 'Draft'}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-zinc-500">
                      <span>Updated {formatRelativeTime(project.updated_at)}</span>
                      <span className="flex items-center gap-1 rounded-full border border-ink-700 bg-ink-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                        {isCloud ? (
                          <>
                            <Cloud className="h-2.5 w-2.5" />
                            Cloud
                          </>
                        ) : (
                          <>
                            <Globe className="h-2.5 w-2.5" />
                            This browser
                          </>
                        )}
                      </span>
                    </div>

                    {project.slug && (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-ink-700 bg-ink-900 p-2 text-xs text-crimson-400">
                        <span className="truncate font-mono text-[11px]">/publishers/{project.slug}</span>
                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => copyPublicUrl(project)}
                            title="Copy public link"
                            aria-label="Copy public link"
                            className="rounded-full p-1 text-zinc-500 transition hover:bg-ink-700 hover:text-white"
                          >
                            {copiedId === project.id ? (
                              <Check className="h-3.5 w-3.5 text-crimson-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <a
                            href={`/publishers/${project.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Open public website"
                            aria-label="Open public website"
                            className="rounded-full p-1 text-zinc-500 transition hover:bg-ink-700 hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-ink-700/80 pt-4">
                    <Link
                      to={`/editor/${project.id}`}
                      className="flex items-center gap-1.5 rounded-full bg-crimson-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow-sm transition hover:bg-crimson-500"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateProject(project)}
                        disabled={busy}
                        title="Duplicate project"
                        aria-label="Duplicate project"
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-ink-700 hover:text-white disabled:opacity-40"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProject(project)}
                        disabled={busy}
                        title="Delete project"
                        aria-label="Delete project"
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-ink-950/60 hover:text-crimson-400 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New project modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !creating) setModalOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Start a new design"
            className="w-full max-w-md animate-scale-in rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-lift"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Start a new design</h3>
                <p className="mt-1 text-xs text-zinc-400">
                  Give it a name — you can change it later. No account required.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={creating}
                aria-label="Close"
                className="rounded-full p-1.5 text-zinc-500 transition hover:bg-ink-700 hover:text-white disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-5 space-y-4">
              <input
                type="text"
                required
                autoFocus
                maxLength={80}
                placeholder="e.g. My Portfolio, Studio Landing"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full rounded-xl border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-crimson-600 focus:outline-none focus:ring-4 focus:ring-crimson-600/15"
              />

              {createError && (
                <p className="flex items-center gap-2 text-xs text-crimson-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {createError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={creating}
                  className="rounded-full border border-ink-600 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:border-ink-500 hover:text-white disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-1.5 rounded-full bg-crimson-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition hover:bg-crimson-500 disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create & open editor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
