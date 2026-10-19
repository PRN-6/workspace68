import { Component } from 'react'
import Toolbar from './components/editor/Toolbar'
import LeftSidebar from './components/editor/LeftSidebar'
import Canvas from './components/editor/Canvas'
import PropertiesPanel from './components/editor/PropertiesPanel'
import { EditorDndProvider } from './components/editor/EditorDndContext'
import { useEditorStore } from './store/editorStore'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Editor caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-slate-900 p-6 text-center text-white">
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-6 max-w-md">
            <h2 className="text-lg font-bold text-red-400">Something went wrong</h2>
            <p className="mt-2 text-xs text-slate-300">
              An unexpected error occurred while rendering the workspace.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
            >
              Reload editor
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  const previewMode = useEditorStore((s) => s.previewMode)
  const darkMode = useEditorStore((s) => s.darkMode)

  return (
    <ErrorBoundary>
      <div className={`ws-app h-full flex flex-col overflow-hidden${darkMode ? ' ws-dark' : ''}`}>
        <Toolbar />
        <EditorDndProvider>
          <div className="flex-1 flex min-h-0">
            {!previewMode && <LeftSidebar />}
            <Canvas />
            {!previewMode && <PropertiesPanel />}
          </div>
        </EditorDndProvider>
      </div>
    </ErrorBoundary>
  )
}