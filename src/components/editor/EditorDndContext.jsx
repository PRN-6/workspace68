import { createContext, useContext, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import { iconFor } from './componentIcons'
import * as T from '../../lib/tree'
import { editorCollisionDetection, resolveDrop, describeOver } from '../../lib/dnd'

/**
 * Where the block would land if you dropped right now.
 * `position` is 'inside' | 'before' | 'after' | null.
 */
const DragHintContext = createContext({ position: null, overId: null })

export function useDragHint() {
  return useContext(DragHintContext)
}

/**
 * The single DndContext for the whole editor.
 *
 * Both the left-hand palette and the canvas live inside this provider, so
 * they share ONE droppable registry. Previously the canvas mounted a second,
 * nested DndContext, which meant palette drags could never resolve an
 * `over` target and silently did nothing.
 */
export function EditorDndProvider({ children }) {
  const page = useEditorStore((s) => s.currentPage())
  const insertElement = useEditorStore((s) => s.insertElement)
  const moveElement = useEditorStore((s) => s.moveElement)

  const [drag, setDrag] = useState(null)
  const [dropHint, setDropHint] = useState({ position: null, overId: null })
  const pointerY = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragStart = (e) => {
    setDrag(e.active.data.current)
    pointerY.current = null
  }

  const onDragMove = (e) => {
    const y = e.activatorEvent?.clientY
    if (typeof y === 'number') pointerY.current = y
    const next = describeOver(e.over, page, pointerY.current)
    // Only re-render when the hint actually changes.
    setDropHint((prev) =>
      prev.position === next.position && prev.overId === next.overId ? prev : next
    )
  }

  const onDragCancel = () => {
    setDrag(null)
    setDropHint({ position: null, overId: null })
    pointerY.current = null
  }

  const onDragEnd = (e) => {
    setDrag(null)
    setDropHint({ position: null, overId: null })

    const { active, over } = e
    if (!over) return

    const activeData = active.data.current

    // Keep the pointer position fresh for the final resolve — onDragMove does
    // not always fire for the very last pixel before drop.
    const lastY = e.activatorEvent?.clientY
    if (typeof lastY === 'number') pointerY.current = lastY

    if (activeData?.source === 'palette') {
      const dest = resolveDrop(over, page, activeData.elementType, null, pointerY.current)
      if (!dest) return
      insertElement(activeData.elementType, dest.containerId, dest.index)
      return
    }

    const activeId = String(active.id)
    const activeEl = T.findById(page.root, activeId)
    const dest = resolveDrop(over, page, activeEl?.type, activeId, pointerY.current)
    if (!dest) return
    if (dest.containerId === activeId) return
    moveElement(activeId, dest.containerId, dest.index)
  }

  const dragLabel =
    drag?.source === 'palette'
      ? COMPONENTS[drag.elementType]?.label
      : drag?.elementId
        ? T.findById(page.root, drag.elementId)?.name || 'Block'
        : null

  const DragIcon = drag?.source === 'palette' ? iconFor(drag.elementType) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={editorCollisionDetection}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <DragHintContext.Provider value={dropHint}>{children}</DragHintContext.Provider>
      <DragOverlay dropAnimation={null}>
        {dragLabel ? (
          // dnd-kit sizes the overlay wrapper to the dragged element, so the
          // chip needs w-max to hug its own content instead of stretching.
          <div className="pointer-events-none z-50 flex w-max items-center gap-1.5 rounded-full bg-[#e11d33] px-3.5 py-2 text-xs font-semibold text-white shadow-glow ring-2 ring-[#f43f4e]/40">
            {DragIcon && <DragIcon size={13} />}
            <span>{dragLabel}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
