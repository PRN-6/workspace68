import { useEffect, useMemo, useRef, useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS, PALETTE_GROUPS } from '../../data/components'
import * as T from '../../lib/tree'
import { getInsertTarget } from '../../lib/dnd'
import { iconFor } from './componentIcons'
import FlowMap from './FlowMap'
import ThemePanel from './ThemePanel'
import {
  Smartphone,
  Blocks,
  FolderTree,
  Plus,
  Copy,
  Trash2,
  PanelLeftClose,
  Search,
  GripVertical,
  X,
  MousePointerClick,
  GitBranch,
  Palette,
  ChevronDown,
} from 'lucide-react'

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
        <span className="ws-label">Screens ({pages.length})</span>
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
        The <b>Flow</b> tab maps where each tap leads.
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

              <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
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
  const Icon = iconFor(type)
  const insertElement = useEditorStore((s) => s.insertElement)
  const selectedId = useEditorStore((s) => s.selectedId)
  const root = useEditorStore((s) => s.currentPage().root)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: 'palette', elementType: type },
  })

  // A drag ends with a click event too. Track the pointer so we can tell a
  // real click from the tail of a drag, and only insert on the former.
  const pointerStart = useRef(null)
  const draggedRef = useRef(false)

  // dnd-kit activates the drag from its own pointerdown handler. Chain onto
  // it rather than replacing it, or the block stops being draggable.
  const dndPointerDown = listeners.onPointerDown

  // When a drag ends, dnd-kit still delivers a click to the source element.
  // Flag it so we do not also insert the block at the click target.
  useEffect(() => {
    if (isDragging) draggedRef.current = true
  }, [isDragging])

  const insertHere = () => {
    const target = getInsertTarget({ root }, selectedId, type)
    insertElement(type, target.containerId, target.index)
  }

  // Click-to-insert uses the same targeting rules as a drop, so the two
  // interactions always agree on where a block lands.
  const onClick = (event) => {
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    const start = pointerStart.current
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4) {
      return
    }
    insertHere()
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="button"
      tabIndex={0}
      title={def.description}
      onPointerDown={(e) => {
        pointerStart.current = { x: e.clientX, y: e.clientY }
        dndPointerDown?.(e)
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          insertHere()
        }
      }}
      style={{ opacity: isDragging ? 0.35 : 1, borderColor: 'var(--ws-border)' }}
      className="ws-palette-card group relative flex w-full cursor-grab select-none items-center gap-2 rounded-xl border p-2 text-left transition hover:-translate-y-0.5 hover:shadow-glow-sm active:cursor-grabbing"
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ws-accent)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ws-border)')}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition group-hover:bg-[var(--ws-accent-soft)] group-hover:text-[var(--ws-accent)]"
        style={{ color: 'var(--ws-text-2)' }}
      >
        <Icon size={20} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-semibold" style={{ color: 'var(--ws-text-2)' }}>
          {def.label}
        </span>
        <span className="block truncate text-[10px] leading-tight" style={{ color: 'var(--ws-text-3)' }}>
          {def.description}
        </span>
      </span>

      {/* The grip only lights up on hover, so the drag affordance is clear
          without making the panel look busy at rest. */}
      <GripVertical
        size={13}
        className="shrink-0 opacity-0 transition group-hover:opacity-70"
        style={{ color: 'var(--ws-text-3)' }}
      />

      {/* A visible "add" button so click-to-insert is discoverable. The card
          itself is also clickable; stopPropagation keeps that from
          inserting the block twice. */}
      <button
        type="button"
        title={`Add ${def.label}`}
        onClick={(e) => {
          e.stopPropagation()
          insertHere()
        }}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border opacity-0 transition hover:scale-110 focus-visible:opacity-100 group-hover:opacity-100"
        style={{
          background: 'var(--ws-accent)',
          borderColor: 'var(--ws-panel)',
          color: 'var(--ws-accent-text)',
        }}
      >
        <Plus size={11} strokeWidth={3} />
      </button>
    </div>
  )
}

function LayerRow({ element, depth }) {
  const selectedId = useEditorStore((s) => s.selectedId)
  const selectElement = useEditorStore((s) => s.selectElement)
  const removeElement = useEditorStore((s) => s.removeElement)
  const def = COMPONENTS[element.type]
  const Icon = iconFor(element.type)
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
        <span className="flex w-4 shrink-0 justify-center">
          <Icon size={12} />
        </span>
        <span className="flex-1 truncate">{element.name || def?.label}</span>
        <button
          type="button"
          className="hidden text-[var(--ws-text-3)] hover:text-crimson-400 group-hover:inline-flex"
          onClick={(e) => {
            e.stopPropagation()
            removeElement(element.id)
          }}
          title="Delete"
        >
          <X size={12} />
        </button>
      </div>
      {element.children?.map((c) => (
        <LayerRow key={c.id} element={c} depth={depth + 1} />
      ))}
    </div>
  )
}

const TABS = [
  { id: 'blocks', icon: Plus, label: 'Parts' },
  { id: 'layers', icon: FolderTree, label: 'Layers' },
  { id: 'theme', icon: Palette, label: 'Colors & Theme' },
  { id: 'screens', icon: Smartphone, label: 'Screens' },
  { id: 'flow', icon: GitBranch, label: 'Flow' },
]

function BlocksTab() {
  const [query, setQuery] = useState('')
  const [collapsedGroups, setCollapsedGroups] = useState([])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return PALETTE_GROUPS
    return PALETTE_GROUPS.map((group) => ({
      ...group,
      types: group.types.filter((type) => {
        const def = COMPONENTS[type]
        return (
          def.label.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          type.includes(q)
        )
      }),
    })).filter((group) => group.types.length > 0)
  }, [query])

  const matchCount = groups.reduce((n, g) => n + g.types.length, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--ws-text-3)' }}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blocks…"
          className="ws-input !rounded-full !py-2 !pl-9 !pr-7 !text-xs !bg-[#F0F0F5] !border-transparent focus:!border-[#6750A4] focus:!bg-white"
          style={{ paddingLeft: 30 }}
        />
        {query && (
          <button
            type="button"
            title="Clear search"
            onClick={() => setQuery('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 transition hover:bg-[var(--ws-panel-3)]"
            style={{ color: 'var(--ws-text-3)' }}
          >
            <X size={11} />
          </button>
        )}
      </div>

      {matchCount === 0 ? (
        <div
          className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-3 py-8 text-center"
          style={{ borderColor: 'var(--ws-border)' }}
        >
          <Search size={18} style={{ color: 'var(--ws-text-3)' }} />
          <p className="text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
            No blocks match “{query}”.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.name} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCollapsedGroups((current) => (
                current.includes(group.name)
                  ? current.filter((name) => name !== group.name)
                  : [...current, group.name]
              ))}
              className="flex items-center justify-between px-1 py-0.5 text-left"
              aria-expanded={!collapsedGroups.includes(group.name)}
            >
              <span className="ws-label">{group.name}</span>
              <ChevronDown
                size={13}
                className={`transition-transform ${collapsedGroups.includes(group.name) ? '-rotate-90' : ''}`}
                style={{ color: 'var(--ws-text-3)' }}
              />
            </button>
            {!collapsedGroups.includes(group.name) && <div className="ws-palette-grid">
              {group.types.map((t) => (
                <PaletteCard key={t} type={t} />
              ))}
            </div>}
          </div>
        ))
      )}
    </div>
  )
}

export default function LeftSidebar() {
  const leftTab = useEditorStore((s) => s.leftTab)
  const setLeftTab = useEditorStore((s) => s.setLeftTab)
  const root = useEditorStore((s) => s.currentPage().root)
  const toggleLeftSidebar = useEditorStore((s) => s.toggleLeftSidebar)
  const activeTab = TABS.find((tab) => tab.id === leftTab)
  const panelTitle = leftTab === 'blocks' ? 'Parts' : activeTab?.label || 'Parts'

  return (
    <aside
      className="ws-sidebar flex shrink-0 flex-row border-r"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      <nav className="ws-sidebar-rail flex shrink-0 flex-col items-center gap-2 py-3">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-[#6750A4] text-sm font-bold text-white shadow-sm">
          W
        </div>
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setLeftTab(t.id)}
              data-active={leftTab === t.id ? 'true' : 'false'}
              className="ws-icon-btn !h-9 !min-w-9"
              title={t.label}
              aria-label={t.label}
            >
              <Icon size={17} />
            </button>
          )
        })}
      </nav>

      <div className="ws-sidebar-content flex min-h-0 flex-1 flex-col">
        <div className="flex h-[54px] shrink-0 items-center justify-between border-b px-3" style={{ borderColor: 'var(--ws-border)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--ws-text)' }}>
            {panelTitle}
          </span>
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

          {leftTab === 'blocks' && <BlocksTab />}

          {leftTab === 'flow' && <FlowMap />}

          {leftTab === 'theme' && <ThemePanel />}

          {leftTab === 'layers' && (
            <div className="flex flex-col gap-0.5">
              <span className="ws-label mb-1.5">Layers</span>
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
      </div>
    </aside>
  )
}
