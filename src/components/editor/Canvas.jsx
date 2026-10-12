import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import * as T from '../../lib/tree'
import Preview from './Preview'

function widthFor(v) {
  if (v === 'mobile') return '420px'
  if (v === 'tablet') return '860px'
  return '100%'
}

function canvasTagOf(el) {
  if (el.type === 'heading') return `h${el.props.level || 1}`
  if (el.type === 'image') return 'div'
  if (el.type === 'divider') return 'div'
  if (el.type === 'button') return 'a'
  return 'div'
}

function EditableText({ element }) {
  const editing = useEditorStore((s) => s.editingId === element.id)
  const updateProps = useEditorStore((s) => s.updateProps)
  const setEditing = useEditorStore((s) => s.setEditing)

  return (
    <span
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e) => {
        updateProps(element.id, { text: e.currentTarget.innerText })
        setEditing(null)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') e.currentTarget.blur()
        e.stopPropagation()
      }}
      style={{ outline: 'none', display: 'inline-block', minWidth: editing ? '40px' : undefined }}
    >
      {element.props.text}
    </span>
  )
}

function EditableElement({ element, containerId }) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const hoveredId = useEditorStore((s) => s.hoveredId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const setHovered = useEditorStore((s) => s.setHovered)
  const setEditing = useEditorStore((s) => s.setEditing)
  const removeElement = useEditorStore((s) => s.removeElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const setElementLayout = useEditorStore((s) => s.setElementLayout)

  const def = COMPONENTS[element.type]
  const canHaveChildren = !!def?.canHaveChildren
  const elementNode = useRef(null)
  const interaction = useRef(null)
  const [interactionStyle, setInteractionStyle] = useState(null)

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: element.id,
      data: { source: 'canvas', containerId, elementId: element.id },
    })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop:${element.id}`,
    disabled: !canHaveChildren,
    data: { type: 'container', containerId: element.id },
  })

  const ref = (node) => {
    elementNode.current = node
    setNodeRef(node)
    if (canHaveChildren) setDropRef(node)
  }

  const selected = selectedId === element.id
  const hovered = hoveredId === element.id

  const Tag = canvasTagOf(element)
  const style = {
    ...element.style,
    ...(interactionStyle || {}),
    position: interactionStyle?.position || element.style.position || 'relative',
    cursor: element.style.cursor || (selected ? 'move' : undefined),
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    ...(isDragging ? { opacity: 0.35 } : {}),
  }

  const isTexty = ['heading', 'text', 'button'].includes(element.type)

  const childIds = canHaveChildren ? element.children.map((c) => c.id) : []
  const imageStyle = element.type === 'image' ? { ...element.style, display: 'block' } : null
  if (imageStyle) {
    for (const key of ['position', 'left', 'top', 'right', 'bottom', 'margin']) delete imageStyle[key]
  }

  const beginInteraction = (event, kind) => {
    const ignoredTarget = event.target.closest('button:not(.ws-resize-handle), input, textarea, select, [contenteditable="true"]')
    if (event.button !== 0 || ignoredTarget) return
    const node = elementNode.current
    const parent = node?.parentElement
    if (!node || !parent) return

    event.stopPropagation()
    selectElement(element.id)
    const rect = node.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    const isFree = element.style.position === 'absolute'
    const startLeft = isFree
      ? Number.parseFloat(element.style.left) || 0
      : rect.left - parentRect.left - parent.clientLeft + parent.scrollLeft
    const startTop = isFree
      ? Number.parseFloat(element.style.top) || 0
      : rect.top - parentRect.top - parent.clientTop + parent.scrollTop
    const flowStyle = element.layout?.flowStyle || Object.fromEntries(
      ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'margin']
        .filter((key) => Object.hasOwn(element.style, key))
        .map((key) => [key, element.style[key]])
    )

    interaction.current = {
      kind,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft,
      startTop,
      startWidth: rect.width,
      startHeight: rect.height,
      flowStyle,
      moved: false,
    }
    if (event.isTrusted) node.setPointerCapture(event.pointerId)
  }

  const onPointerDown = (event) => beginInteraction(event, 'move')
  const onResizePointerDown = (event) => {
    event.stopPropagation()
    beginInteraction(event, 'resize')
  }

  const onPointerMove = (event) => {
    const current = interaction.current
    if (!current || current.pointerId !== event.pointerId) return
    const dx = event.clientX - current.startX
    const dy = event.clientY - current.startY
    if (!current.moved && Math.hypot(dx, dy) < 3) return
    current.moved = true
    event.preventDefault()

    const nextStyle = {
      position: 'absolute',
      left: `${Math.round(current.startLeft + (current.kind === 'move' ? dx : 0))}px`,
      top: `${Math.round(current.startTop + (current.kind === 'move' ? dy : 0))}px`,
      width: `${Math.max(24, Math.round(current.startWidth + (current.kind === 'resize' ? dx : 0)))}px`,
      height: `${Math.max(24, Math.round(current.startHeight + (current.kind === 'resize' ? dy : 0)))}px`,
      margin: '0px',
    }
    current.nextStyle = nextStyle
    setInteractionStyle(nextStyle)
  }

  const finishInteraction = (event) => {
    const current = interaction.current
    if (!current || current.pointerId !== event.pointerId) return
    if (current.moved && current.nextStyle) {
      setElementLayout(element.id, current.nextStyle, { mode: 'free', flowStyle: current.flowStyle })
    }
    interaction.current = null
    setInteractionStyle(null)
  }

  return (
    <Tag
      ref={ref}
      id={element.id}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishInteraction}
      onPointerCancel={finishInteraction}
      onClick={(e) => {
        e.stopPropagation()
        selectElement(element.id)
      }}
      onDoubleClick={(e) => {
        if (!isTexty) return
        e.stopPropagation()
        setEditing(element.id)
      }}
      onMouseEnter={() => setHovered(element.id)}
      onMouseLeave={() => setHovered(null)}
    >
      {isTexty && <EditableText element={element} />}

      {element.type === 'image' && (
        <img
          src={element.props.src}
          alt={element.props.alt}
          style={imageStyle}
          draggable={false}
        />
      )}

      {canHaveChildren && (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {element.children.map((child) => (
            <EditableElement key={child.id} element={child} containerId={element.id} />
          ))}
          {element.children.length === 0 && (
            <div
              className="flex items-center justify-center text-[11px]"
              style={{
                minHeight: 56,
                width: '100%',
                border: '1px dashed #cbd5e1',
                borderRadius: 8,
                color: '#94a3b8',
                pointerEvents: 'none',
                background: isOver ? 'rgba(239,68,68,0.08)' : 'transparent',
              }}
            >
              Drop blocks inside this {def.label.toLowerCase()}
            </div>
          )}
        </SortableContext>
      )}

      {element.type === 'image' && style.width === undefined && null}

      {(selected || hovered || isOver) && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            inset: 0,
            outline: isOver ? '2px dashed #ef4444' : selected ? '2px solid #ef4444' : '1px dashed #f87171',
            outlineOffset: '-1px',
            borderRadius: 2,
          }}
        />
      )}

      {selected && !isDragging && (
        <div className="absolute -top-7 left-0 z-20 flex items-center gap-0.5 rounded-md bg-indigo-600 px-1 py-0.5 text-[10px] font-medium text-white shadow-lg">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            title="Drag to move"
            className="cursor-grab rounded px-1 py-0.5 hover:bg-indigo-500 active:cursor-grabbing"
          >
            ⠿
          </button>
          <span className="px-1">{element.name}</span>
          <button
            type="button"
            title="Duplicate"
            className="rounded px-1 py-0.5 hover:bg-indigo-500"
            onClick={(e) => {
              e.stopPropagation()
              duplicateElement(element.id)
            }}
          >
            ⧉
          </button>
          <button
            type="button"
            title="Delete"
            className="rounded px-1 py-0.5 hover:bg-rose-500"
            onClick={(e) => {
              e.stopPropagation()
              removeElement(element.id)
            }}
          >
            ✕
          </button>
        </div>
      )}
      {selected && !isDragging && (
        <button
          type="button"
          title="Drag to resize"
          aria-label="Resize element"
          onPointerDown={onResizePointerDown}
          className="ws-resize-handle absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-white bg-indigo-600 shadow"
        />
      )}
    </Tag>
  )
}

function RootList({ page }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop:root', data: { type: 'container', containerId: 'root' } })
  const ids = page.root.map((e) => e.id)
  return (
    <div
      ref={setNodeRef}
      className="relative min-h-full"
      style={{ outline: isOver ? '2px dashed #ef4444' : 'none', outlineOffset: -2 }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {page.root.map((el) => (
          <EditableElement key={el.id} element={el} containerId="root" />
        ))}
      </SortableContext>
      {page.root.length === 0 && (
        <div className="flex h-[70vh] flex-col items-center justify-center gap-2 p-10 text-center">
          <div className="text-4xl">✥</div>
          <p className="text-sm font-semibold text-slate-500">Drag blocks here from the left panel</p>
          <p className="max-w-xs text-xs text-slate-400">
            Start with a <b>Section</b>, then drop headings, text, buttons and images inside it.
          </p>
        </div>
      )}
    </div>
  )
}

function PagesBar() {
  const pages = useEditorStore((s) => s.project.pages)
  const currentPageId = useEditorStore((s) => s.currentPageId)
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage)
  const addPage = useEditorStore((s) => s.addPage)
  const removePage = useEditorStore((s) => s.removePage)
  const setPageName = useEditorStore((s) => s.setPageName)

  return (
    <div className="ws-pages-bar flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
      {pages.map((p) => (
        <div
          key={p.id}
          className={`group flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
            p.id === currentPageId ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <button type="button" onClick={() => setCurrentPage(p.id)} className="whitespace-nowrap">
            {p.name}
          </button>
          <span className="text-[10px] opacity-50">{p.path}</span>
          {pages.length > 1 && (
            <button
              type="button"
              title="Delete page"
              className="hidden text-slate-400 hover:text-rose-500 group-hover:block"
              onClick={() => removePage(p.id)}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addPage}
        className="ml-1 shrink-0 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
      >
        + Page
      </button>
      {/* inline rename of current page lives in the properties panel */}
      <input type="hidden" onChange={(e) => setPageName(currentPageId, e.target.value)} />
    </div>
  )
}

function resolveDrop(over, elements) {
  const data = over.data?.current
  if (data?.type === 'container') {
    return { containerId: data.containerId, index: null }
  }
  if (data?.source === 'canvas') {
    const containerId = data.containerId
    const list = containerId === 'root' ? elements.root : T.findById(elements.root, containerId)?.children
    const index = list ? list.findIndex((x) => x.id === over.id) : null
    return { containerId, index: index < 0 ? null : index }
  }
  return null
}

function EditCanvas() {
  const page = useEditorStore((s) => s.currentPage())
  const viewport = useEditorStore((s) => s.viewport)
  const selectElement = useEditorStore((s) => s.selectElement)
  const setHovered = useEditorStore((s) => s.setHovered)
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
      const dest = resolveDrop(over, page)
      if (!dest) return
      insertElement(activeData.elementType, dest.containerId, dest.index)
      return
    }

    const activeId = String(active.id)
    const dest = resolveDrop(over, page)
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

  return (
    <main className="ws-editor-canvas flex min-w-0 flex-1 flex-col">
      <PagesBar />
      <div
        className="ws-canvas-workspace ws-scroll flex-1 overflow-y-auto bg-slate-100 p-6"
        onClick={() => {
          selectElement(null)
          setHovered(null)
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
        >
          <div
            className="mx-auto min-h-[70vh] overflow-hidden rounded-xl bg-white shadow-xl"
            style={{ width: widthFor(viewport), maxWidth: '100%' }}
          >
            <RootList page={page} />
          </div>
          <DragOverlay dropAnimation={null}>
            {dragLabel ? (
              <div className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                {dragLabel}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </main>
  )
}

export default function Canvas() {
  const previewMode = useEditorStore((s) => s.previewMode)
  return previewMode ? <Preview /> : <EditCanvas />
}