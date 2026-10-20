import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createPortfolioPage } from '../data/templates'
import {
  Plus, Globe, Copy, Check, ExternalLink, Trash2, Edit3, Settings as SettingsIcon, LogOut, Search, Layers, Rocket
} from 'lucide-react'

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
      if (!error && data) {
        setProjects(data)
      }
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!newProjectName.trim()) return
    try {
      const initialDoc = {
        name: newProjectName.trim(),
        pages: [createPortfolioPage()],
      }
      const { data, error } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: newProjectName.trim(),
          document: initialDoc,
          status: 'draft',
        })
        .select()
        .single()

      if (error) throw error
      setIsCreating(false)
      setNewProjectName('')
      navigate(`/editor/${data.id}`)
    } catch (err) {
      alert(`Error creating project: ${err.message}`)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId)
      if (error) throw error
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    } catch (err) {
      alert(`Error deleting project: ${err.message}`)
    }
  }

  const handleDuplicateProject = async (project) => {
    try {
      const duplicateDoc = structuredClone(project.document)
      duplicateDoc.name = `${project.name} (Copy)`
      const { data, error } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id,
          name: duplicateDoc.name,
          document: duplicateDoc,
          status: 'draft',
        })
        .select()
        .single()
      if (error) throw error
      setProjects([data, ...projects])
    } catch (err) {
      alert(`Error duplicating project: ${err.message}`)
    }
  }

  const copyPublicUrl = (slug, id) => {
    const url = `${window.location.origin}/publishers/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const publishedCount = projects.filter((p) => p.status === 'published').length
  const draftCount = projects.length - publishedCount

  return (
    <div className="relative min-h-screen bg-ink-950 text-zinc-100">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-crimson-600/15 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-crimson-800/10 blur-[130px]" />

      {/* Header */}
      <nav className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-sm font-bold text-white shadow-glow-sm">
                W
              </div>
              <span className="font-display text-sm font-bold tracking-tight text-white">workspace68</span>
            </Link>
            <span className="text-xs font-semibold text-zinc-500">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-white"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              <span>{profile?.display_name || user?.email?.split('@')[0]}</span>
            </Link>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-850 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-crimson-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative mx-auto max-w-7xl px-6 py-10">
        {/* Welcome Banner & Stats */}
        <div className="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white">
              My <span className="text-crimson-500">Websites</span>
            </h1>
            <p className="mt-1.5 text-xs text-zinc-400">
              Manage your visual projects, drafts, and published sites.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 self-start rounded-full bg-crimson-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5 hover:bg-crimson-500 hover:shadow-glow active:translate-y-0 sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Create New Website
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, icon: Layers, accent: false },
            { label: 'Published Sites', value: publishedCount, icon: Rocket, accent: true },
            { label: 'Drafts', value: draftCount, icon: Globe, accent: false },
          ].map((stat, i) => {
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
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search websites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-ink-700 bg-ink-850 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-crimson-600 focus:outline-none focus:ring-4 focus:ring-crimson-600/15"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="mt-12 text-center text-sm text-zinc-400">Loading your projects…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-ink-700 bg-ink-900/50 p-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-crimson-600/10 shadow-glow-sm">
              <Globe className="h-8 w-8 text-crimson-500" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-white">No websites yet</h3>
            <p className="mt-1 text-xs text-zinc-400">Create your first website with our visual editor.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-5 rounded-full bg-crimson-600 px-5 py-2.5 text-xs font-semibold text-white shadow-glow-sm transition hover:-translate-y-0.5 hover:bg-crimson-500"
            >
              Create Website
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project, i) => (
              <div
                key={project.id}
                className="animate-fade-up group flex flex-col justify-between rounded-3xl border border-ink-700 bg-ink-850 p-5 transition hover:-translate-y-1 hover:border-crimson-600/40 hover:shadow-glow-sm"
                style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-white">{project.name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        project.status === 'published'
                          ? 'border border-crimson-600/40 bg-crimson-600/10 text-crimson-400'
                          : 'bg-ink-700 text-zinc-400'
                      }`}
                    >
                      {project.status === 'published' ? '● Live' : 'Draft'}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-zinc-500">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </p>

                  {project.slug && (
                    <div className="mt-3 flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900 p-2 text-xs text-crimson-400">
                      <span className="truncate font-mono">/publishers/{project.slug}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyPublicUrl(project.slug, project.id)}
                          title="Copy public link"
                          className="rounded-full p-1 text-zinc-500 transition hover:bg-ink-700 hover:text-white"
                        >
                          {copiedId === project.id ? <Check className="h-3.5 w-3.5 text-crimson-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <a
                          href={`/publishers/${project.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open public website"
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
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicateProject(project)}
                      title="Duplicate project"
                      className="rounded-full p-2 text-zinc-500 transition hover:bg-ink-700 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete project"
                      className="rounded-full p-2 text-zinc-500 transition hover:bg-crimson-950/60 hover:text-crimson-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md animate-scale-in rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-lift">
              <h3 className="font-display text-lg font-bold text-white">Create New Website</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Choose a project name to start visual editing.
              </p>
              <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. My Portfolio, Inovex Studio"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded-xl border border-ink-700 bg-ink-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 transition focus:border-crimson-600 focus:outline-none focus:ring-4 focus:ring-crimson-600/15"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded-full border border-ink-600 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:bg-ink-700 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-crimson-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-sm transition hover:bg-crimson-500"
                  >
                    Create & Open Editor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
