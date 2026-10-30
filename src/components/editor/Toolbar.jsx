import { useEffect, useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { downloadProject } from '../../lib/exportProject'
import { buildDesignPrompt, copyText } from '../../lib/promptExport'
import WorkspaceManager from './WorkspaceManager'
import {
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Sun,
  Moon,
  Play,
  Download,
  Layers,
  ChevronDown,
  Sparkles,
  Check,
  Copy,
  FileCode2,
  MousePointer2,
  Plus,
  Hand,

} from 'lucide-react'

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

function ExportMenu({ project }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(null)
  const [exporting, setExporting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const flash = (id) => {
    setCopied(id)
    setTimeout(() => setCopied((current) => (current === id ? null : current)), 1800)
  }

  const onDownloadZip = async () => {
    setExporting(true)
    setOpen(false)
    try {
      await downloadProject(project)
    } finally {
      setExporting(false)
    }
  }

  const onCopyPrompt = async () => {
    const text = buildDesignPrompt(project)
    await copyText(text)
    flash('prompt')
    setOpen(false)
  }

  const onCopyJson = async () => {
    await copyText(JSON.stringify(project, null, 2))
    flash('json')
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ws-btn !bg-[var(--ws-accent)] hover:!bg-[var(--ws-accent-hover)] !text-white !border-transparent !rounded-full !px-4 shadow-sm"
      >
        {exporting ? 'Creating ZIP…' : <Download size={13} />}
        {exporting ? 'Creating ZIP…' : 'Export'}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-11 z-50 w-72 animate-scale-in rounded-2xl border p-1.5 shadow-lift"
          style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
        >
          <button
            type="button"
            onClick={onCopyPrompt}
            className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[var(--ws-accent-soft)]"
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--ws-accent-soft)', color: 'var(--ws-accent)' }}
            >
              {copied === 'prompt' ? <Check size={14} /> : <Sparkles size={14} />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold" style={{ color: 'var(--ws-text)' }}>
                {copied === 'prompt' ? 'Prompt copied!' : 'Copy design prompt'}
              </span>
              <span className="block text-[10px] leading-snug" style={{ color: 'var(--ws-text-3)' }}>
                A precise brief for Claude Code, Codex, Gemini CLI or Cursor.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onDownloadZip}
            className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[var(--ws-accent-soft)]"
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--ws-panel-3)', color: 'var(--ws-text-2)' }}
            >
              <FileCode2 size={14} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold" style={{ color: 'var(--ws-text)' }}>
                Download React project
              </span>
              <span className="block text-[10px] leading-snug" style={{ color: 'var(--ws-text-3)' }}>
                Production-ready source as a .zip archive.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onCopyJson}
            className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[var(--ws-accent-soft)]"
          >
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: 'var(--ws-panel-3)', color: 'var(--ws-text-2)' }}
            >
              {copied === 'json' ? <Check size={14} /> : <Copy size={14} />}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold" style={{ color: 'var(--ws-text)' }}>
                {copied === 'json' ? 'JSON copied!' : 'Copy project JSON'}
              </span>
              <span className="block text-[10px] leading-snug" style={{ color: 'var(--ws-text-3)' }}>
                The raw design document, for backups and sharing.
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default function Toolbar() {
  const projectName = useEditorStore((s) => s.project.name)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const viewport = useEditorStore((s) => s.viewport)
  const setViewport = useEditorStore((s) => s.setViewport)
  const darkMode = useEditorStore((s) => s.darkMode)
  const toggleDarkMode = useEditorStore((s) => s.toggleDarkMode)
  const insertElement = useEditorStore((s) => s.insertElement)
  const previewMode = useEditorStore((s) => s.previewMode)
  const togglePreview = useEditorStore((s) => s.togglePreview)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const canUndo = useEditorStore((s) => s.past.length > 0)
  const canRedo = useEditorStore((s) => s.future.length > 0)
  const project = useEditorStore((s) => s.project)

  const [workspaceManagerOpen, setWorkspaceManagerOpen] = useState(false)

  return (
    <header
      className="ws-toolbar flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      <div className="ws-toolbar-brand flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#6750A4] font-display text-sm font-bold text-white shadow-sm">
          W
        </div>
        <span className="hidden font-display text-sm font-bold tracking-tight sm:block" style={{ color: 'var(--ws-text)' }}>
          workspace68
        </span>
        <div className="mx-1 hidden h-5 w-px md:block" style={{ background: 'var(--ws-border)' }} />
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          aria-label="Project name"
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
        <button
          type="button"
          onClick={() => setWorkspaceManagerOpen(true)}
          className="ws-btn hidden sm:inline-flex"
        >
          <Layers size={13} />
          Workspaces
        </button>
      </div>

      <div className="ws-toolbar-controls flex items-center gap-2">
        {/* Tool Cluster 1: Pointer & Hand */}
        <div className="flex items-center gap-0.5 rounded-full border border-[#E7E0EC] bg-white px-1 py-0.5 shadow-sm">
          <button
            type="button"
            title="Selection tool (V)"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6750A4] text-white shadow-sm"
          >
            <MousePointer2 size={13} />
          </button>
          <button
            type="button"
            title="Hand / Pan tool (H)"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#49454F] transition hover:bg-[#F3EDF7]"
          >
            <Hand size={13} />
          </button>
        </div>

        {/* Tool Cluster 2: Undo / Redo */}
        <div className="flex items-center gap-0.5 rounded-full border border-[#E7E0EC] bg-white px-1 py-0.5 shadow-sm">
          <IconBtn title="Undo (Ctrl+Z)" disabled={!canUndo || previewMode} onClick={undo}>
            <Undo2 size={14} />
          </IconBtn>
          <IconBtn title="Redo (Ctrl+Shift+Z)" disabled={!canRedo || previewMode} onClick={redo}>
            <Redo2 size={14} />
          </IconBtn>
        </div>

        {/* Viewport Segment */}
        <div className="ws-seg">
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

        <IconBtn title="Add Section" onClick={() => insertElement('section')}>
          <Plus size={14} />
        </IconBtn>

        <IconBtn
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          active={darkMode}
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </IconBtn>
      </div>

      <div className="ws-toolbar-actions flex items-center gap-2">
        <button
          type="button"
          onClick={togglePreview}
          title="Preview (P)"
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
        <ExportMenu project={project} />
      </div>
      {workspaceManagerOpen && <WorkspaceManager onClose={() => setWorkspaceManagerOpen(false)} />}
    </header>
  )
}
