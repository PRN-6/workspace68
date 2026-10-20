import { useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { downloadProject } from '../../lib/exportProject'
import WorkspaceManager from './WorkspaceManager'
import { Monitor, Tablet, Smartphone, Undo2, Redo2, Sun, Moon, Play, Download, Layers } from 'lucide-react'

const VIEWPORTS = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' },
]

function IconBtn({ children, onClick, disabled, title, active }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      data-active={active ? 'true' : 'false'}
      className="ws-icon-btn"
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
    <header
      className="ws-toolbar flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-sm font-bold text-white shadow-glow-sm">
          W
        </div>
        <span className="hidden font-display text-sm font-bold tracking-tight sm:block" style={{ color: 'var(--ws-text)' }}>
          workspace68
        </span>
        <div className="mx-1 hidden h-5 w-px md:block" style={{ background: 'var(--ws-border)' }} />
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="hidden w-48 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium transition md:block"
          style={{ color: 'var(--ws-text-2)' }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ws-border)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--ws-accent)'
            e.currentTarget.style.boxShadow = '0 0 0 3px var(--ws-accent-soft)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        <button type="button" onClick={() => setWorkspaceManagerOpen(true)} className="ws-btn hidden sm:inline-flex">
          <Layers size={13} />
          Workspaces
        </button>
        <a
          href="https://prinson.is-a.dev/"
          target="_blank"
          rel="noreferrer"
          className="ws-btn hidden md:inline-flex"
          title="Developer Portfolio"
        >
          <span>👨‍💻</span>
          <span className="hidden lg:inline">Developer</span>
        </a>
      </div>

      <div className="flex items-center gap-0.5">
        <IconBtn title="Undo" disabled={!canUndo || previewMode} onClick={undo}>
          <Undo2 size={15} />
        </IconBtn>
        <IconBtn title="Redo" disabled={!canRedo || previewMode} onClick={redo}>
          <Redo2 size={15} />
        </IconBtn>
        <div className="mx-1 h-5 w-px" style={{ background: 'var(--ws-border)' }} />
        <div className="ws-seg mr-1">
          {VIEWPORTS.map((v) => {
            const Icon = v.icon
            return (
              <button
                key={v.id}
                type="button"
                title={v.label}
                data-active={viewport === v.id ? 'true' : 'false'}
                onClick={() => setViewport(v.id)}
                className="ws-seg-btn"
              >
                <Icon size={14} />
              </button>
            )
          })}
        </div>
        <IconBtn
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          active={darkMode}
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </IconBtn>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePreview}
          className={`ws-btn ${previewMode ? '!bg-[var(--ws-text)] !text-[var(--ws-panel)] !border-transparent' : ''}`}
        >
          {previewMode ? (
            <>
              <Undo2 size={13} /> Back to editor
            </>
          ) : (
            <>
              <Play size={13} /> Preview
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          title="Download the full website project as a .zip file"
          className="ws-btn ws-btn-primary"
        >
          <Download size={13} />
          {exporting ? 'Creating ZIP…' : 'Download ZIP'}
        </button>
      </div>
      {workspaceManagerOpen && <WorkspaceManager onClose={() => setWorkspaceManagerOpen(false)} />}
    </header>
  )
}
