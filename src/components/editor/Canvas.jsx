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

  const isSection = element.type === 'section'
  const isFree = !isSection && element.style.position === 'absolute'
  const updateStyle = useEditorStore((s) => s.updateStyle)

  const Tag = canvasTagOf(element)
  const style = {
    ...element.style,
    ...(interactionStyle || {}),
    position: isSection ? 'relative' : (interactionStyle?.position || element.style.position || 'relative'),
    cursor: element.style.cursor || (selected && isFree ? 'move' : undefined),
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
    if (isSection) return
    const ignoredTarget = event.target.closest('button:not(.ws-resize-handle), input, textarea, select, [contenteditable="true"]')
    if (event.button !== 0 || ignoredTarget) return
    const node = elementNode.current
    const parent = node?.parentElement
    if (!node || !parent) return

    // Normal flow elements should NOT be converted into position: absolute on drag
    if (kind === 'move' && !isFree) return

    event.stopPropagation()
    selectElement(element.id)
    const rect = node.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
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

  const onPointerDown = (event) => {
    if (isFree && !isSection) {
      beginInteraction(event, 'move')
    }
  }

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

    if (current.kind === 'move' && isFree) {
      const nextStyle = {
        position: 'absolute',
        left: `${Math.round(current.startLeft + dx)}px`,
        top: `${Math.round(current.startTop + dy)}px`,
        width: `${Math.max(24, Math.round(current.startWidth))}px`,
        height: `${Math.max(24, Math.round(current.startHeight))}px`,
        margin: '0px',
      }
      current.nextStyle = nextStyle
      setInteractionStyle(nextStyle)
    } else if (current.kind === 'resize') {
      const nextWidth = Math.max(24, Math.round(current.startWidth + dx))
      const nextHeight = Math.max(24, Math.round(current.startHeight + dy))
      if (isFree) {
        const nextStyle = {
          position: 'absolute',
          left: `${Math.round(current.startLeft)}px`,
          top: `${Math.round(current.startTop)}px`,
          width: `${nextWidth}px`,
          height: `${nextHeight}px`,
          margin: '0px',
        }
        current.nextStyle = nextStyle
        setInteractionStyle(nextStyle)
      } else {
        const nextStyle = {
          width: `${nextWidth}px`,
        }
        current.nextStyle = nextStyle
        setInteractionStyle(nextStyle)
      }
    }
  }

  const finishInteraction = (event) => {
    const current = interaction.current
    if (!current || current.pointerId !== event.pointerId) return
    if (current.moved && current.nextStyle) {
      if (isFree) {
        setElementLayout(element.id, current.nextStyle, { mode: 'free', flowStyle: current.flowStyle })
      } else {
        updateStyle(element.id, current.nextStyle)
      }
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
  const duplicatePage = useEditorStore((s) => s.duplicatePage)
  const removePage = useEditorStore((s) => s.removePage)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleAdd = (type) => {
    addPage(type)
    setShowAddMenu(false)
  }

  return (
    <div className="ws-pages-bar flex shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2 backdrop-blur-xs">
      <div className="flex items-center gap-1.5 overflow-x-auto ws-scroll py-0.5">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Screens:
        </span>
        {pages.map((p, idx) => {
          const isCurrent = p.id === currentPageId
          return (
            <div
              key={p.id}
              className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                isCurrent
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setCurrentPage(p.id)}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                  isCurrent ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
                }`} />
                <span>{idx + 1}. {p.name}</span>
              </button>

              <button
                type="button"
                title="Duplicate screen"
                onClick={(e) => {
                  e.stopPropagation()
                  duplicatePage(p.id)
                }}
                className={`hidden rounded px-1 text-[10px] group-hover:inline-block ${
                  isCurrent ? 'text-indigo-200 hover:text-white' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                ⧉
              </button>

              {pages.length > 1 && (
                <button
                  type="button"
                  title="Delete screen"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePage(p.id)
                  }}
                  className={`hidden rounded px-1 text-[10px] group-hover:inline-block ${
                    isCurrent ? 'text-indigo-200 hover:text-rose-200' : 'text-slate-400 hover:text-rose-500'
                  }`}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}

        {/* Add Screen Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition active:scale-95"
          >
            <span>+</span> Add Screen
          </button>

          {showAddMenu && (
            <div className="absolute left-0 top-9 z-40 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAdd('birthday')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span>🎂</span>
                <div>
                  <div className="font-semibold text-slate-800">Birthday Surprise</div>
                  <div className="text-[10px] text-slate-400">Gift card flow</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleAdd('quiz')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <span>🎮</span>
                <div>
                  <div className="font-semibold text-slate-800">Quiz Question</div>
                  <div className="text-[10px] text-slate-400">Multiple choice card</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleAdd('winner')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <span>🏆</span>
                <div>
                  <div className="font-semibold text-slate-800">Winner Screen</div>
                  <div className="text-[10px] text-slate-400">Victory score screen</div>
                </div>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => handleAdd('blank')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                <span>📄</span>
                <div>
                  <div className="font-semibold text-slate-800">Blank Screen</div>
                  <div className="text-[10px] text-slate-400">Start from scratch</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function resolveDrop(over, elements, draggedType) {
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