import { useRef, useState } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { downloadWorkspaceFile, readWorkspaceFile } from '../../lib/workspaceFile'

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
      className="ws-workspace-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-manager-title"
        className="ws-workspace-modal flex max-h-[min(720px,90vh)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="workspace-manager-title" className="text-base font-semibold text-slate-900">Your workspaces</h2>
            <p className="mt-1 text-xs text-slate-500">Projects save automatically in this browser.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close workspace manager" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            ✕
          </button>
        </header>

        <div className="ws-scroll flex-1 space-y-3 overflow-y-auto p-5">
          {workspaces.map((workspace) => {
            const active = workspace.id === currentWorkspaceId
            return (
              <article key={workspace.id} className={`rounded-xl border p-4 ${active ? 'border-indigo-300 bg-indigo-50/50' : 'border-slate-200'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-slate-800">{workspace.project.name || workspace.name}</h3>
                      {active && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Open</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {workspace.project.pages.length} {workspace.project.pages.length === 1 ? 'page' : 'pages'} · {savedDate(workspace.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {!active && (
                      <button type="button" onClick={() => { openWorkspace(workspace.id); onClose() }} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
                        Open
                      </button>
                    )}
                    <button type="button" onClick={() => downloadWorkspaceFile(workspace.project)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      Save file
                    </button>
                    {workspaces.length > 1 && (
                      <button
                        type="button"
                        title={`Delete ${workspace.project.name}`}
                        onClick={() => {
                          if (window.confirm(`Delete "${workspace.project.name}" from this browser?`)) deleteWorkspace(workspace.id)
                        }}
                        className="rounded-lg px-2 py-2 text-xs text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
          <p className="text-xs leading-relaxed text-slate-500">
            Use <b>Save file</b> to keep a portable backup. Open that file on another day or device with <b>Open project file</b>.
          </p>
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-slate-200 px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { createWorkspace(); onClose() }}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              + New workspace
            </button>
            <button type="button" onClick={() => fileInput.current?.click()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              Open project file
            </button>
            <input ref={fileInput} type="file" accept=".json,.workspace68.json,application/json" className="hidden" onChange={openFile} />
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            Done
          </button>
        </footer>
      </section>
    </div>
  )
}
