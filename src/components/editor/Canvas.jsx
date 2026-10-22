import { useEffect, useRef, useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import * as T from '../../lib/tree'
import { dropIdFor, ROOT_ID } from '../../lib/dnd'
import { useDragHint } from './EditorDndContext'
import { blockTag, isInlineTextType, renderBlockContent } from './blockRenderers'
import { GripVertical, Copy, X, Plus, MousePointerClick } from 'lucide-react'
import Preview from './Preview'

function widthFor(v) {
  if (v === 'mobile') return '420px'
  if (v === 'tablet') return '860px'
  return '100%'
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

function EditableElement({ element, containerId, depth = 0 }) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectedIds = useEditorStore((s) => s.selectedIds)
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
  const { position: hintPosition, overId: hintId } = useDragHint()

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({
      id: element.id,
      data: { source: 'canvas', containerId, elementId: element.id, depth },
    })

  // Containers get their OWN droppable id. Using the element id here would
  // collide with the droppable that useSortable registers internally.
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: dropIdFor(element.id),
    disabled: !canHaveChildren,
    data: { type: 'container', containerId: element.id, depth },
  })

  const ref = (node) => {
    elementNode.current = node
    setNodeRef(node)
    if (canHaveChildren) setDropRef(node)
  }

  const selected = selectedId === element.id || selectedIds.includes(element.id)
  const hovered = hoveredId === element.id

  const isSection = element.type === 'section'
  const isFree = !isSection && element.style.position === 'absolute'
  const updateStyle = useEditorStore((s) => s.updateStyle)

  const Tag = blockTag(element.type)
  const style = {
    ...element.style,
    ...(interactionStyle || {}),
    position: isSection ? 'relative' : (interactionStyle?.position || element.style.position || 'relative'),
    cursor: element.style.cursor || (selected && isFree ? 'move' : undefined),
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    ...(isDragging ? { opacity: 0.35 } : {}),
  }

  const isTexty = isInlineTextType(element.type)

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
        selectElement(element.id, { additive: e.shiftKey })
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

      {!isTexty && element.type !== 'image' && renderBlockContent(element)}

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
            <EditableElement key={child.id} element={child} containerId={element.id} depth={depth + 1} />
          ))}
          {element.children.length === 0 && (
            <div
              className="flex flex-col items-center justify-center gap-1 rounded-xl text-[11px] transition"
              style={{
                minHeight: 64,
                width: '100%',
                border: isOver ? '2px dashed #e11d33' : '1px dashed #c9c9d4',
                borderRadius: 12,
                color: isOver ? '#e11d33' : '#94a3b8',
                pointerEvents: 'none',
                background: isOver ? 'rgba(225,29,51,0.06)' : 'transparent',
              }}
            >
              <span className="flex items-center gap-1.5 font-semibold">
                <Plus size={12} />
                Drop blocks inside this {def.label.toLowerCase()}
              </span>
              <span className="text-[10px] opacity-70">or pick one from the Blocks panel</span>
            </div>
          )}
        </SortableContext>
      )}

      {element.type === 'image' && style.width === undefined && null}

      {/* Insertion line: shows exactly where a dragged block will land. */}
      {hintPosition === 'before' && hintId === element.id && (
        <div
          className="pointer-events-none absolute z-30 left-0 right-0 -top-0.5 h-1 rounded-full"
          style={{ background: '#e11d33', boxShadow: '0 0 0 3px rgba(225,29,51,0.18)' }}
        />
      )}
      {hintPosition === 'after' && hintId === element.id && (
        <div
          className="pointer-events-none absolute z-30 left-0 right-0 -bottom-0.5 h-1 rounded-full"
          style={{ background: '#e11d33', boxShadow: '0 0 0 3px rgba(225,29,51,0.18)' }}
        />
      )}

      {(selected || hovered || isOver) && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            inset: 0,
            outline: isOver ? '2px dashed #e11d33' : selected ? '2px solid #e11d33' : '1px dashed rgba(244,63,94,0.55)',
            outlineOffset: '-1px',
            borderRadius: 4,
          }}
        />
      )}

      {/* Highlight for "this block will be dropped inside me". */}
      {hintPosition === 'inside' && hintId === element.id && (
        <div
          className="pointer-events-none absolute z-10"
          style={{
            inset: 0,
            outline: '2px dashed #e11d33',
            outlineOffset: '-1px',
            borderRadius: 4,
            background: 'rgba(225,29,51,0.05)',
          }}
        />
      )}

      {selected && !isDragging && (
        <div className="absolute -top-7 left-0 z-20 flex items-center gap-0.5 rounded-full bg-[#e11d33] px-1.5 py-1 text-[10px] font-semibold text-white shadow-glow-sm">
          <button
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            title="Drag to move"
            className="cursor-grab rounded-full px-1 py-0.5 hover:bg-white/20 active:cursor-grabbing"
          >
            <GripVertical size={12} />
          </button>
          <span className="max-w-[140px] truncate px-1">{element.name}</span>
          <button
            type="button"
            title="Duplicate"
            className="rounded-full p-1 hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation()
              duplicateElement(element.id)
            }}
          >
            <Copy size={11} />
          </button>
          <button
            type="button"
            title="Delete"
            className="rounded-full p-1 hover:bg-black/30"
            onClick={(e) => {
              e.stopPropagation()
              removeElement(element.id)
            }}
          >
            <X size={11} />
          </button>
        </div>
      )}
      {selected && !isDragging && (
        <button
          type="button"
          title="Drag to resize"
          aria-label="Resize element"
          onPointerDown={onResizePointerDown}
          className="ws-resize-handle absolute -bottom-1.5 -right-1.5 z-30 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-[#e11d33] shadow-md"
        />
      )}
    </Tag>
  )
}

function RootList({ page }) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropIdFor(ROOT_ID),
    data: { type: 'container', containerId: ROOT_ID, depth: -1 },
  })
  const ids = page.root.map((e) => e.id)
  return (
    <div
      ref={setNodeRef}
      className="relative min-h-full"
      style={{ outline: isOver ? '2px dashed #e11d33' : 'none', outlineOffset: -2 }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {page.root.map((el) => (
          <EditableElement key={el.id} element={el} containerId={ROOT_ID} depth={0} />
        ))}
      </SortableContext>
      {page.root.length === 0 && (
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#fff1f2] text-[#e11d33] shadow-glow-sm">
            <MousePointerClick size={26} />
          </div>
          <div>
            <p className="font-display text-base font-bold text-slate-700">Drag blocks here from the left panel</p>
            <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-slate-400">
              Start with a <b>Section</b>, then drop headings, text, buttons and images inside it.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1">
              <GripVertical size={11} /> drag
            </span>
            <span className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1">
              <Plus size={11} /> click to add
            </span>
          </div>
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
    <div
      className="ws-pages-bar flex shrink-0 items-center justify-between border-b px-4 py-2 backdrop-blur"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      <div className="ws-scroll flex items-center gap-1.5 overflow-x-auto py-0.5">
        <span className="ws-label mr-1">Screens</span>
        {pages.map((p, idx) => {
          const isCurrent = p.id === currentPageId
          return (
            <div
              key={p.id}
              className="group flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: isCurrent ? 'var(--ws-accent)' : 'var(--ws-panel-3)',
                color: isCurrent ? 'var(--ws-accent-text)' : 'var(--ws-text-2)',
                boxShadow: isCurrent ? '0 6px 18px -6px var(--ws-accent-ring)' : 'none',
              }}
            >
              <button
                type="button"
                onClick={() => setCurrentPage(p.id)}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${isCurrent ? 'bg-white animate-pulse-dot' : 'bg-[var(--ws-text-3)]'}`} />
                <span>{idx + 1}. {p.name}</span>
              </button>

              <button
                type="button"
                title="Duplicate screen"
                onClick={(e) => {
                  e.stopPropagation()
                  duplicatePage(p.id)
                }}
                className={`hidden rounded p-0.5 group-hover:inline-flex ${
                  isCurrent ? 'text-white/80 hover:text-white' : 'text-[var(--ws-text-3)] hover:text-[var(--ws-text)]'
                }`}
              >
                <Copy size={11} />
              </button>

              {pages.length > 1 && (
                <button
                  type="button"
                  title="Delete screen"
                  onClick={(e) => {
                    e.stopPropagation()
                    removePage(p.id)
                  }}
                  className={`hidden rounded p-0.5 group-hover:inline-flex ${
                  isCurrent ? 'text-white/80 hover:text-white' : 'text-[var(--ws-text-3)] hover:text-[var(--ws-accent)]'
                }`}
              >
                <X size={11} />
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
            className="flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1.5 text-xs font-semibold transition active:scale-95"
            style={{ borderColor: 'var(--ws-accent)', color: 'var(--ws-accent)', background: 'var(--ws-accent-soft)' }}
          >
            <span>+</span> Add Screen
          </button>

          {showAddMenu && (
            <div
              className="absolute left-0 top-9 z-40 w-52 animate-scale-in rounded-2xl border p-1.5 shadow-lift"
              style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
            >
              {[
                { type: 'birthday', emoji: '🎂', name: 'Birthday Surprise', desc: 'Gift card flow' },
                { type: 'quiz', emoji: '🎮', name: 'Quiz Question', desc: 'Multiple choice card' },
                { type: 'winner', emoji: '🏆', name: 'Winner Screen', desc: 'Victory score screen' },
                { type: 'blank', emoji: '📄', name: 'Blank Screen', desc: 'Start from scratch', divider: true },
              ].map((opt) => (
                <div key={opt.type}>
                  {opt.divider && <div className="my-1 h-px" style={{ background: 'var(--ws-border)' }} />}
                  <button
                    type="button"
                    onClick={() => handleAdd(opt.type)}
                    className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition hover:bg-[var(--ws-accent-soft)]"
                  >
                    <span>{opt.emoji}</span>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--ws-text)' }}>{opt.name}</div>
                      <div className="text-[10px]" style={{ color: 'var(--ws-text-3)' }}>{opt.desc}</div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EditCanvas() {
  const page = useEditorStore((s) => s.currentPage())
  const viewport = useEditorStore((s) => s.viewport)
  const zoom = useEditorStore((s) => s.zoom)
  const selectElement = useEditorStore((s) => s.selectElement)
  const setHovered = useEditorStore((s) => s.setHovered)

  return (
    <main className="ws-editor-canvas flex min-w-0 flex-1 flex-col">
      <PagesBar />
      <div
        className="ws-canvas-workspace ws-canvas-grid ws-scroll flex-1 overflow-y-auto p-8"
        onClick={() => {
          selectElement(null)
          setHovered(null)
        }}
      >
        <div
          className="mx-auto min-h-[70vh] overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-black/5"
          style={{ width: widthFor(viewport), maxWidth: '100%', zoom }}
        >
          <RootList page={page} />
        </div>
      </div>
    </main>
  )
}

export default function Canvas() {
  const previewMode = useEditorStore((s) => s.previewMode)
  return previewMode ? <Preview /> : <EditCanvas />
}