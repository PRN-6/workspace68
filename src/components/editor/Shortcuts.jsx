import { useEffect } from 'react'
import { useEditorStore } from '../../store/editorStore'

// Global editor shortcuts. Mirrors the keyboard map advertised on the
// landing page: undo/redo, clipboard, grouping, nudging, zoom and preview.

function isTypingTarget(target) {
  if (!target) return false
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true
  return target.isContentEditable === true
}

export default function Shortcuts() {
  useEffect(() => {
    const onKeyDown = (event) => {
      const store = useEditorStore.getState()

      // Preview is a full-screen mode — only Escape applies there.
      if (event.key === 'Escape') {
        if (store.previewMode) {
          store.togglePreview()
          event.preventDefault()
        } else if (store.editingId) {
          store.setEditing(null)
        } else if (store.selectedId) {
          store.selectElement(null)
        }
        return
      }

      if (isTypingTarget(event.target)) return
      if (event.altKey) return

      const meta = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      if (meta) {
        switch (key) {
          case 'z':
            event.preventDefault()
            if (event.shiftKey) store.redo()
            else store.undo()
            return
          case 'y':
            event.preventDefault()
            store.redo()
            return
          case 'c':
            event.preventDefault()
            store.copySelection()
            return
          case 'v':
            event.preventDefault()
            store.pasteClipboard()
            return
          case 'd':
            event.preventDefault()
            if (store.selectedId) store.duplicateElement(store.selectedId)
            return
          case 'g':
            event.preventDefault()
            if (event.shiftKey) store.ungroupElements()
            else store.groupElements()
            return
          case 's':
            event.preventDefault()
            return
          default:
            return
        }
      }

      switch (key) {
        case 'p':
          event.preventDefault()
          store.togglePreview()
          return
        case 'delete':
        case 'backspace':
          if (store.selectedIds?.length) {
            event.preventDefault()
            for (const id of store.selectedIds) store.removeElement(id)
          }
          return
        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright': {
          if (!store.selectedId) return
          event.preventDefault()
          const step = event.shiftKey ? 8 : 1
          const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
          const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
          store.nudge(dx, dy)
          return
        }
        case '+':
        case '=':
          event.preventDefault()
          store.zoomIn()
          return
        case '-':
        case '_':
          event.preventDefault()
          store.zoomOut()
          return
        case '0':
          event.preventDefault()
          store.zoomToFit()
          return
        default:
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}
