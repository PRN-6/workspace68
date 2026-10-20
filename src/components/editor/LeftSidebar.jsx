import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS, PALETTE_GROUPS } from '../../data/components'
import * as T from '../../lib/tree'
import { getInsertTarget } from '../../lib/dnd'
import { Smartphone, Blocks, FolderTree, Plus, Copy, Trash2, PanelLeftClose } from 'lucide-react'

function ScreensTab() {
  const pages = useEditorStore((s) => s.project.pages)
  const currentPageId = useEditorStore((s) => s.currentPageId)
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage)
  const addPage = useEditorStore((s) => s.addPage)
  const duplicatePage = useEditorStore((s) => s.duplicatePage)
  const removePage = useEditorStore((s) => s.removePage)
  const setPageName = useEditorStore((s) => s.setPageName)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [editingPageId, setEditingPageId] = useState(null)

  const handleAdd = (type) => {
    addPage(type)
    setShowAddMenu(false)
  }

  const screenOptions = [
    { type: 'birthday', emoji: '🎂', name: 'Birthday Surprise', desc: 'Gift reveal & celebration' },
    { type: 'quiz', emoji: '🎮', name: 'Quiz Question', desc: 'Interactive choice card' },
    { type: 'winner', emoji: '🏆', name: 'Winner Screen', desc: 'Score & victory card' },
    { type: 'blank', emoji: '📄', name: 'Blank Screen', desc: 'Design from scratch', divider: true },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="ws-label">Flow Screens ({pages.length})</span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="ws-btn ws-btn-primary !px-3 !py-1.5 !text-[11px]"
          >
            <Plus size={12} /> Add
          </button>
          {showAddMenu && (
            <div
              className="absolute right-0 top-9 z-40 w-56 animate-scale-in rounded-2xl border p-1.5 shadow-lift"
              style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
            >
              {screenOptions.map((opt) => (
                <div key={opt.type}>
                  {opt.divider && <div className="my-1 h-px" style={{ background: 'var(--ws-border)' }} />}
                  <button
                    type="button"
                    onClick={() => handleAdd(opt.type)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-xs transition hover:bg-[var(--ws-accent-soft)]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl text-base" style={{ background: 'var(--ws-panel-3)' }}>
                      {opt.emoji}
                    </span>
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

      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
        Build multi-step stories, quiz flows, or surprise reveals. Link buttons to any screen!
      </p>

      <div className="flex flex-col gap-2">
        {pages.map((p, idx) => {
          const isCurrent = p.id === currentPageId
          const elCount = p.root?.length || 0
          return (
            <div
              key={p.id}
              onClick={() => setCurrentPage(p.id)}
              className="group flex cursor-pointer items-center justify-between rounded-2xl border p-2.5 transition hover:-translate-y-0.5"
              style={{
                borderColor: isCurrent ? 'var(--ws-accent)' : 'var(--ws-border)',
                background: isCurrent ? 'var(--ws-accent-soft)' : 'var(--ws-panel)',
                boxShadow: isCurrent ? '0 0 0 3px var(--ws-accent-soft)' : 'none',
              }}
            >
              <div className="mr-2 flex min-w-0 flex-1 items-center gap-2">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                  style={{
                    background: isCurrent ? 'var(--ws-accent)' : 'var(--ws-panel-3)',
                    color: isCurrent ? 'var(--ws-accent-text)' : 'var(--ws-text-2)',
                  }}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  {editingPageId === p.id ? (
                    <input
                      autoFocus
                      defaultValue={p.name}
                      onBlur={(e) => {
                        setPageName(p.id, e.target.value.trim() || p.name)
                        setEditingPageId(null)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') e.currentTarget.blur()
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="ws-input !rounded-lg !px-1.5 !py-0.5 !text-xs w-28"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingPageId(p.id)
                      }}
                      title="Double-click to rename"
                      className="truncate text-xs font-semibold"
                      style={{ color: 'var(--ws-text)' }}
                    >
                      {p.name}
                    </div>
                  )}
                  <span className="font-mono text-[10px]" style={{ color: 'var(--ws-text-3)' }}>
                    {p.path} · {elCount} block{elCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                <button
                  type="button"
                  title="Duplicate screen"
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicatePage(p.id)
                  }}
                  className="ws-icon-btn !h-7 !min-w-7 !p-0"
                >
                  <Copy size={12} />
                </button>
                {pages.length > 1 && (
                  <button
                    type="button"
                    title="Delete screen"
                    onClick={(e) => {
                      e.stopPropagation()
                      removePage(p.id)
                    }}
                    className="ws-icon-btn !h-7 !min-w-7 !p-0 hover:!text-crimson-400"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PaletteCard({ type }) {
  const def = COMPONENTS[type]
  const insertElement = useEditorStore((s) => s.insertElement)
  const selectedId = useEditorStore((s) => s.selectedId)
  const root = useEditorStore((s) => s.currentPage().root)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: 'palette', elementType: type },
  })

  // Click-to-insert uses the same targeting rules as a drop, so the two
  // interactions always agree on where a block lands.
  const onClick = () => {
    const target = getInsertTarget({ root }, selectedId, type)
    insertElement(type, target.containerId, target.index)
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={onClick}
      title={def.description}
      style={{ opacity: isDragging ? 0.35 : 1 }}
      className="group relative flex w-full cursor-grab select-none flex-col items-start gap-1.5 rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-glow-sm active:cursor-grabbing"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ws-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ws-border)')}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl text-sm transition group-hover:bg-[var(--ws-accent-soft)]"
        style={{ color: 'var(--ws-text-2)' }}
      >
        {def.icon}
      </span>
      <span className="text-xs font-semibold" style={{ color: 'var(--ws-text-2)' }}>
        {def.label}
      </span>
      <span
        className="pointer-events-none absolute right-2 top-2 text-[10px] opacity-0 transition group-hover:opacity-60"
        style={{ color: 'var(--ws-text-3)' }}
        aria-hidden="true"
      >
        ⠿
      </span>
    </button>
  )
}

function LayerRow({ element, depth }) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const removeElement = useEditorStore((s) => s.removeElement)
  const def = COMPONENTS[element.type]
  const selected = selectedId === element.id

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => selectElement(element.id)}
        onKeyDown={(e) => e.key === 'Enter' && selectElement(element.id)}
        style={{
          paddingLeft: 8 + depth * 12,
          background: selected ? 'var(--ws-accent-soft)' : 'transparent',
          color: selected ? 'var(--ws-accent)' : 'var(--ws-text-2)',
        }}
        className="group flex cursor-pointer items-center gap-1.5 rounded-xl py-1 pr-1.5 text-xs transition hover:bg-[var(--ws-panel-3)]"
      >
        <span className="w-4 text-center text-[11px] opacity-70">{def?.icon}</span>
        <span className="flex-1 truncate">{element.name || def?.label}</span>
        <button
          type="button"
          className="hidden text-[var(--ws-text-3)] hover:text-crimson-400 group-hover:block"
          onClick={(e) => {
            e.stopPropagation()
            removeElement(element.id)
          }}
          title="Delete"
        >
          ✕
        </button>
      </div>
      {element.children?.map((c) => (
        <LayerRow key={c.id} element={c} depth={depth + 1} />
      ))}
    </div>
  )
}

const TABS = [
  { id: 'screens', icon: Smartphone, label: 'Screens' },
  { id: 'blocks', icon: Blocks, label: 'Blocks' },
  { id: 'layers', icon: FolderTree, label: 'Layers' },
]

export default function LeftSidebar() {
  const leftTab = useEditorStore((s) => s.leftTab)
  const setLeftTab = useEditorStore((s) => s.setLeftTab)
  const root = useEditorStore((s) => s.currentPage().root)
  const toggleLeftSidebar = useEditorStore((s) => s.toggleLeftSidebar)

  return (
    <aside
      className="ws-sidebar flex w-64 shrink-0 flex-col border-r"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      <div className="flex shrink-0 items-center gap-1 border-b p-2" style={{ borderColor: 'var(--ws-border)' }}>
        <div className="ws-seg flex-1">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setLeftTab(t.id)}
                data-active={leftTab === t.id ? 'true' : 'false'}
                className="ws-seg-btn flex items-center justify-center gap-1.5"
                title={t.label}
              >
                <Icon size={13} />
                <span className="hidden lg:inline">{t.label}</span>
              </button>
            )
          })}
        </div>
        <button
          type="button"
          onClick={toggleLeftSidebar}
          title="Collapse panel"
          className="ws-icon-btn shrink-0"
        >
          <PanelLeftClose size={15} />
        </button>
      </div>

      <div className="ws-scroll flex-1 overflow-y-auto p-3">
        {leftTab === 'screens' && <ScreensTab />}

        {leftTab === 'blocks' && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
              Drag a block onto the canvas, or click to append it.
            </p>
            {PALETTE_GROUPS.map((group) => (
              <div key={group.name} className="flex flex-col gap-2">
                <span className="ws-label">{group.name}</span>
                <div className="grid grid-cols-2 gap-2">
                  {group.types.map((t) => (
                    <PaletteCard key={t} type={t} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {leftTab === 'layers' && (
          <div className="flex flex-col gap-0.5">
            {root.length === 0 ? (
              <p className="px-1 text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
                This screen is empty.
              </p>
            ) : (
              root.map((el) => <LayerRow key={el.id} element={el} depth={0} />)
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
