import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEditorStore } from '../store/editorStore'
import Toolbar from '../components/editor/Toolbar'
import LeftSidebar from '../components/editor/LeftSidebar'
import Canvas from '../components/editor/Canvas'
import PropertiesPanel from '../components/editor/PropertiesPanel'
import { EditorDndProvider } from '../components/editor/EditorDndContext'
import PublishModal from '../components/editor/PublishModal'
import { CheckCircle2, Cloud, AlertCircle, ArrowLeft } from 'lucide-react'

export default function EditorPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const [publishModalOpen, setPublishModalOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)

  const previewMode = useEditorStore((s) => s.previewMode)
  const darkMode = useEditorStore((s) => s.darkMode)
  const project = useEditorStore((s) => s.project)
  const init = useEditorStore((s) => s.init)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const leftSidebarOpen = useEditorStore((s) => s.leftSidebarOpen)
  const rightSidebarOpen = useEditorStore((s) => s.rightSidebarOpen)
  const toggleLeftSidebar = useEditorStore((s) => s.toggleLeftSidebar)
  const toggleRightSidebar = useEditorStore((s) => s.toggleRightSidebar)

  const saveTimerRef = useRef(null)
  const isInitialLoad = useRef(true)

  // 1. Fetch project on mount
  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single()

        if (error || !data) {
          alert('Project not found or unauthorized')
          return navigate('/dashboard')
        }

        setCurrentProject(data)
        if (data.document?.pages) {
          init(data.document.pages)
          if (data.name) setProjectName(data.name)
        }
      } catch (err) {
        console.error('Failed to load project:', err)
        navigate('/dashboard')
      } finally {
        setLoading(false)
        setTimeout(() => {
          isInitialLoad.current = false
        }, 800)
      }
    }

    loadProject()
  }, [projectId, init, setProjectName, navigate])

  // 2. Debounced Autosave to Supabase
  const saveToCloud = useCallback(
    async (doc, name) => {
      try {
        setSaveStatus('saving')
        const { error } = await supabase
          .from('projects')
          .update({
            name: name || doc.name,
            document: doc,
            updated_at: new Date().toISOString(),
          })
          .eq('id', projectId)

        if (error) throw error
        setSaveStatus('saved')
      } catch (err) {
        console.error('Autosave error:', err)
        setSaveStatus('error')
      }
    },
    [projectId]
  )

  useEffect(() => {
    if (isInitialLoad.current || loading) return

    clearTimeout(saveTimerRef.current)
    setSaveStatus('saving')

    saveTimerRef.current = setTimeout(() => {
      saveToCloud(project, project.name)
    }, 1500)

    return () => clearTimeout(saveTimerRef.current)
  }, [project, loading, saveToCloud])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ink-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-crimson-500 border-t-transparent" />
          <span className="font-display text-sm font-medium text-zinc-400">Loading website workspace…</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`ws-app flex h-full flex-col overflow-hidden${darkMode ? ' ws-dark' : ''}`}>
      {/* Cloud Header / Status Bar */}
      <div className="flex h-10 items-center justify-between border-b border-zinc-800/80 bg-ink-950 px-4 text-xs text-zinc-300">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 font-medium text-zinc-400 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </button>
          <div className="h-3.5 w-px bg-zinc-800" />
          <span className="font-display font-semibold text-white">{project.name}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px]">
            {saveStatus === 'saving' && (
              <>
                <Cloud className="h-3.5 w-3.5 animate-pulse text-crimson-400" />
                <span className="text-zinc-400">Saving…</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-crimson-500" />
                <span className="text-zinc-400">Saved</span>
              </>
            )}
            {saveStatus === 'error' && (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-crimson-400" />
                <span className="text-crimson-400">Save failed</span>
              </>
            )}
          </div>

          {/* Publish Trigger Button */}
          <button
            onClick={() => setPublishModalOpen(true)}
            className="rounded-full bg-crimson-600 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-glow-sm transition hover:bg-crimson-500 hover:shadow-glow active:scale-95"
          >
            Publish Website
          </button>
        </div>
      </div>

      {/* Existing Toolbar */}
      <Toolbar />

      {/* Visual Canvas Layout with Collapsible Sidebars */}
      <EditorDndProvider>
        <div className="relative flex flex-1 min-h-0 overflow-hidden">
          {/* Left Sidebar (Collapsible) */}
          {!previewMode && (
            <div
              className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col ${
                leftSidebarOpen ? 'w-64' : 'w-0'
              }`}
            >
              <div className="w-64 h-full flex flex-col">
                <LeftSidebar />
              </div>
            </div>
          )}

          {/* Floating Expand Left Sidebar Button (when collapsed) */}
          {!previewMode && !leftSidebarOpen && (
            <button
              type="button"
              onClick={toggleLeftSidebar}
              title="Expand Screens & Blocks Panel"
              className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-[var(--ws-border)] bg-[var(--ws-panel-glass)] px-3.5 py-2 text-xs font-semibold text-[var(--ws-text-2)] shadow-panel backdrop-blur transition hover:text-[var(--ws-accent)] active:scale-95"
            >
              <span>▶</span>
              <span>Screens & Blocks</span>
            </button>
          )}

          {/* Canvas Workspace */}
          <Canvas />

          {/* Floating Expand Right Sidebar Button (when collapsed) */}
          {!previewMode && !rightSidebarOpen && (
            <button
              type="button"
              onClick={toggleRightSidebar}
              title="Expand Properties & Styles Panel"
              className="absolute right-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-[var(--ws-border)] bg-[var(--ws-panel-glass)] px-3.5 py-2 text-xs font-semibold text-[var(--ws-text-2)] shadow-panel backdrop-blur transition hover:text-[var(--ws-accent)] active:scale-95"
            >
              <span>Properties</span>
              <span>◀</span>
            </button>
          )}

          {/* Right Properties Sidebar (Collapsible) */}
          {!previewMode && (
            <div
              className={`transition-all duration-300 ease-in-out shrink-0 overflow-hidden flex flex-col ${
                rightSidebarOpen ? 'w-80' : 'w-0'
              }`}
            >
              <div className="w-80 h-full flex flex-col">
                <PropertiesPanel />
              </div>
            </div>
          )}
        </div>
      </EditorDndProvider>

      {/* Publish Dialog */}
      {publishModalOpen && (
        <PublishModal
          projectRecord={currentProject}
          currentDocument={project}
          onClose={() => setPublishModalOpen(false)}
          onPublished={(updated) => setCurrentProject(updated)}
        />
      )}
    </div>
  )
}
