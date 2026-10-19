import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import * as T from '../../lib/tree'

export function resolveDrop(over, elements, draggedType) {
  if (!over) return null
  const data = over.data?.current

  if (data?.type === 'container') {
    if (draggedType && draggedType !== 'section' && data.containerId === 'root' && elements.root?.length > 0) {
      const targetSec = elements.root.find((s) => s.type === 'section') || elements.root[0]
      if (targetSec) {
        const col = targetSec.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
        return { containerId: col ? col.id : targetSec.id, index: null }
      }
    }
    return { containerId: data.containerId, index: null }
  }

  if (data?.source === 'canvas') {
    const overEl = T.findById(elements.root, over.id)
    if (overEl && COMPONENTS[overEl.type]?.canHaveChildren && draggedType !== 'section') {
      const col = overEl.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
      return { containerId: col ? col.id : overEl.id, index: null }
    }
    const containerId = data.containerId
    const list = containerId === 'root' ? elements.root : T.findById(elements.root, containerId)?.children
    const index = list ? list.findIndex((x) => x.id === over.id) : null
    return { containerId, index: index < 0 ? null : index }
  }

  return null
}

function collisionDetectionStrategy(args) {
  const pointerCollisions = pointerWithin(args)
  if (pointerCollisions.length > 0) {
    return pointerCollisions
  }
  return closestCenter(args)
}

export function EditorDndProvider({ children }) {
  const page = useEditorStore((s) => s.currentPage())
  const insertElement = useEditorStore((s) => s.insertElement)
  const moveElement = useEditorStore((s) => s.moveElement)
  const [drag, setDrag] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragStart = (e) => setDrag(e.active.data.current)
  const onDragCancel = () => setDrag(null)

  const onDragEnd = (e) => {
    setDrag(null)
    const { active, over } = e
    if (!over) return
    const activeData = active.data.current

    if (activeData?.source === 'palette') {
      const dest = resolveDrop(over, page, activeData.elementType)
      if (!dest) return
      insertElement(activeData.elementType, dest.containerId, dest.index)
      return
    }

    const activeId = String(active.id)
    const activeEl = T.findById(page.root, activeId)
    const dest = resolveDrop(over, page, activeEl?.type)
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

  const dragIcon =
    drag?.source === 'palette'
      ? COMPONENTS[drag.elementType]?.icon
      : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {dragLabel ? (
          <div className="pointer-events-none flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xl ring-2 ring-indigo-400 z-50">
            {dragIcon && <span>{dragIcon}</span>}
            <span>{dragLabel}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
