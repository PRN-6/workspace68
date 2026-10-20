import { useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { downloadWorkspaceFile, readWorkspaceFile } from '../../lib/workspaceFile'
import { X, FilePlus2, FileDown, FileUp, Trash2 } from 'lucide-react'

function savedDate(value) {
  if (!value) return 'Saved in this browser'
  return `Last edited ${new Date(value).toLocaleString()}`
}

export default function WorkspaceManager({ onClose }) {
  const workspaces = useEditorStore((s) => s.workspaces)
  const currentWorkspaceId = useEditorStore((s) => s.currentWorkspaceId)
  const createWorkspace = useEditorStore((s) => s.createWorkspace)
  const openWorkspace = useEditorStore((s) => s.openWorkspace)
  const deleteWorkspace = useEditorStore((s) => s.deleteWorkspace)
  const importWorkspace = useEditorStore((s) => s.importWorkspace)
  const fileInput = useRef(null)
  const [error, setError] = useState('')

  const openFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const project = await readWorkspaceFile(file)
      importWorkspace(project)
      setError('')
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this project file.')
    }
  }

  return (
    <div
      className="ws-workspace-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-manager-title"
        className="ws-workspace-modal flex max-h-[min(720px,90vh)] w-full max-w-2xl animate-scale-in flex-col overflow-hidden rounded-3xl border shadow-lift"
        style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)', color: 'var(--ws-text)' }}
      >
        <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--ws-border)' }}>
          <div>
            <h2 id="workspace-manager-title" className="font-display text-base font-bold" style={{ color: 'var(--ws-text)' }}>
              Your workspaces
            </h2>
            <p className="mt-1 text-xs" style={{ color: 'var(--ws-text-3)' }}>
              Projects save automatically in this browser.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close workspace manager" className="ws-icon-btn">
            <X size={15} />
          </button>
        </header>

        <div className="ws-scroll flex-1 space-y-3 overflow-y-auto p-5">
          {workspaces.map((workspace) => {
            const active = workspace.id === currentWorkspaceId
            return (
              <article
                key={workspace.id}
                className="rounded-2xl border p-4 transition hover:-translate-y-0.5"
                style={{
                  borderColor: active ? 'var(--ws-accent)' : 'var(--ws-border)',
                  background: active ? 'var(--ws-accent-soft)' : 'var(--ws-panel-2)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold" style={{ color: 'var(--ws-text)' }}>
                        {workspace.project.name || workspace.name}
                      </h3>
                      {active && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: 'var(--ws-accent)', color: 'var(--ws-accent-text)' }}
                        >
                          Open
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: 'var(--ws-text-3)' }}>
                      {workspace.project.pages.length} {workspace.project.pages.length === 1 ? 'page' : 'pages'} · {savedDate(workspace.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!active && (
                      <button
                        type="button"
                        onClick={() => { openWorkspace(workspace.id); onClose() }}
                        className="ws-btn ws-btn-primary"
                      >
                        Open
                      </button>
                    )}
                    <button type="button" onClick={() => downloadWorkspaceFile(workspace.project)} className="ws-btn">
                      <FileDown size={12} /> Save file
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        title={`Delete ${workspace.project.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete "${workspace.project.name}" from this browser?`)) deleteWorkspace(workspace.id)
                        }}
                        className="ws-icon-btn hover:!text-crimson-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
          {error && (
            <p role="alert" className="rounded-xl bg-crimson-950/60 px-3 py-2 text-sm text-crimson-400">
              {error}
            </p>
          )}
          <p className="text-xs leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
            Use <b>Save file</b> to keep a portable backup. Open that file on another day or device with <b>Open project file</b>.
          </p>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t px-5 py-4" style={{ borderColor: 'var(--ws-border)' }}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { createWorkspace(); onClose() }}
              className="ws-btn ws-btn-primary"
            >
              <FilePlus2 size={12} /> New workspace
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} className="ws-btn">
              <FileUp size={12} /> Open project file
            </button>
            <input ref={fileInput} type="file" accept=".json,.workspace68.json,application/json" className="hidden" onChange={openFile} />
          </div>
          <button type="button" onClick={onClose} className="ws-btn">
            Done
          </button>
        </footer>
      </section>
    </div>
  )
}
