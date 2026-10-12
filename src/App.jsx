import Toolbar from './components/editor/Toolbar'
import LeftSidebar from './components/editor/LeftSidebar'
import Canvas from './components/editor/Canvas'
import PropertiesPanel from './components/editor/PropertiesPanel'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const previewMode = useEditorStore((s) => s.previewMode)
  const darkMode = useEditorStore((s) => s.darkMode)

  return (
    <div className={`ws-app h-full flex flex-col overflow-hidden${darkMode ? ' ws-dark' : ''}`}>
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        {!previewMode && <LeftSidebar />}
        <Canvas />
        {!previewMode && <PropertiesPanel />}
      </div>
    </div>
  )
}