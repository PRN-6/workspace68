import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { downloadProject } from '../../lib/exportProject'
import WorkspaceManager from './WorkspaceManager'

const VIEWPORTS = [
  { id: 'desktop', icon: '🖥', label: 'Desktop' },
  { id: 'tablet', icon: '▤', label: 'Tablet' },
  { id: 'mobile', icon: '▯', label: 'Mobile' },
]

function IconButton({ children, onClick, disabled, title, active }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`flex h-8 items-center gap-1 rounded-lg px-2.5 text-xs font-medium transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
        } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  )
}

export default function Toolbar() {
  const projectName = useEditorStore((s) => s.project.name)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const viewport = useEditorStore((s) => s.viewport)
  const setViewport = useEditorStore((s) => s.setViewport)
  const darkMode = useEditorStore((s) => s.darkMode)
  const toggleDarkMode = useEditorStore((s) => s.toggleDarkMode)
  const previewMode = useEditorStore((s) => s.previewMode)
  const togglePreview = useEditorStore((s) => s.togglePreview)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const project = useEditorStore((s) => s.project)

  const [exporting, setExporting] = useState(false)
  const [workspaceManagerOpen, setWorkspaceManagerOpen] = useState(false)

  const onExport = async () => {
    setExporting(true)
    try {
      await downloadProject(project)
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="ws-toolbar flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-800 text-sm font-bold text-white shadow">
            W
          </div>
          <span className="hidden text-sm font-semibold tracking-tight text-slate-800 sm:block">
            workspace68
          </span>
        </div>
        <div className="mx-2 hidden h-6 w-px bg-slate-200 md:block" />
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="hidden w-48 rounded-lg border border-transparent px-2 py-1 text-sm font-medium text-slate-700 hover:border-slate-200 focus:border-indigo-400 focus:outline-none md:block"
        />
        <button
          type="button"
          onClick={() => setWorkspaceManagerOpen(true)}
          className="h-8 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Workspaces
        </button>
        <a
          href="https://prinson.is-a.dev/"
          target="_blank"
          rel="noreferrer"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-indigo-600"
          title="Developer Portfolio"
        >
          <span>👨‍💻</span>
          <span className="hidden sm:inline">Developer</span>
        </a>
      </div>

      <div className="flex items-center gap-1">
        <IconButton title="Undo" disabled={!canUndo || previewMode} onClick={undo}>
          ↺
        </IconButton>
        <IconButton title="Redo" disabled={!canRedo || previewMode} onClick={redo}>
          ↻
        </IconButton>
        <div className="mx-1 h-6 w-px bg-slate-200" />
        {VIEWPORTS.map((v) => (
          <IconButton
            key={v.id}
            title={v.label}
            active={viewport === v.id}
            onClick={() => setViewport(v.id)}
          >
            <span>{v.icon}</span>
          </IconButton>
        ))}
        <IconButton
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          active={darkMode}
          onClick={toggleDarkMode}
        >
          <span aria-hidden="true">{darkMode ? '☀' : '☾'}</span>
        </IconButton>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePreview}
          className={`h-9 rounded-lg px-3 text-sm font-medium transition ${previewMode ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
        >
          {previewMode ? '← Back to editor' : '▶ Preview'}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          title="Download the full website project as a .zip file"
          className="h-9 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {exporting ? 'Creating ZIP…' : '⬇ Download ZIP'}
        </button>
      </div>
      {workspaceManagerOpen && <WorkspaceManager onClose={() => setWorkspaceManagerOpen(false)} />}
    </header>
  )
}