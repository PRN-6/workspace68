import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createPortfolioPage } from '../data/templates'
import { 
  Plus, Globe, Copy, Check, ExternalLink, Trash2, Edit3, Settings as SettingsIcon, LogOut, Search
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
    <div className="min-h-screen bg-[#070709] text-zinc-100">
      {/* Header */}
      <nav className="border-b border-zinc-800 bg-[#0c0c10] px-6 py-3.5 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-sm font-bold text-white shadow-md shadow-red-600/30">
                W
              </div>
              <span className="font-bold tracking-tight text-white">workspace68</span>
            </Link>
            <span className="text-xs font-semibold text-zinc-400">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-700 hover:text-white"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              <span>{profile?.display_name || user?.email?.split('@')[0]}</span>
            </Link>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-red-600/40 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Banner & Stats */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">My Websites</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Manage your visual projects, drafts, and published sites.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500"
          >
            <Plus className="h-4 w-4" /> Create New Website
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-[#0e0e12] p-4">
            <span className="text-xs text-zinc-400">Total Projects</span>
            <p className="text-2xl font-bold text-white">{projects.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#0e0e12] p-4">
            <span className="text-xs text-zinc-400">Published Sites</span>
            <p className="text-2xl font-bold text-red-500">{publishedCount}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-[#0e0e12] p-4">
            <span className="text-xs text-zinc-400">Drafts</span>
            <p className="text-2xl font-bold text-zinc-300">{draftCount}</p>
          </div>
        </div>

        {/* Search */}
        <div className="mt-8 flex items-center justify-between gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search websites…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-[#0e0e12] py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="mt-12 text-center text-sm text-zinc-400">Loading your projects…</div>
        ) : filteredProjects.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <Globe className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="mt-3 text-base font-semibold text-white">No websites yet</h3>
            <p className="mt-1 text-xs text-zinc-400">Create your first website with our visual editor.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
            >
              Create Website
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#0e0e12] p-5 transition hover:border-zinc-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        project.status === 'published'
                          ? 'bg-red-600/10 text-red-500 border border-red-600/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {project.status === 'published' ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-zinc-400">
                    Updated {new Date(project.updated_at).toLocaleDateString()}
                  </p>

                  {project.slug && (
                    <div className="mt-3 flex items-center justify-between rounded-lg bg-[#070709] p-2 text-xs text-red-400 border border-zinc-800/60">
                      <span className="truncate font-mono">/publishers/{project.slug}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyPublicUrl(project.slug, project.id)}
                          title="Copy public link"
                          className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          {copiedId === project.id ? <Check className="h-3.5 w-3.5 text-red-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                        <a
                          href={`/publishers/${project.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Open public website"
                          className="rounded p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                  <Link
                    to={`/editor/${project.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateProject(project)}
                      title="Duplicate project"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete project"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-950/40 hover:text-red-400"
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
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white">Create New Website</h3>
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
                  className="w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
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
