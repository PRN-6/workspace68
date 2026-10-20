import { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS, PALETTE_GROUPS } from '../../data/components'
import * as T from '../../lib/tree'

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Flow Screens ({pages.length})
        </span>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition active:scale-95"
          >
            <span>+</span> Add Screen
          </button>
          {showAddMenu && (
            <div className="absolute right-0 top-8 z-40 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                onClick={() => handleAdd('birthday')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition"
              >
                <span className="text-base">🎂</span>
                <div>
                  <div className="font-semibold text-slate-800">Birthday Surprise</div>
                  <div className="text-[10px] text-slate-400">Gift reveal & celebration</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleAdd('quiz')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition"
              >
                <span className="text-base">🎮</span>
                <div>
                  <div className="font-semibold text-slate-800">Quiz Question</div>
                  <div className="text-[10px] text-slate-400">Interactive choice card</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleAdd('winner')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <span className="text-base">🏆</span>
                <div>
                  <div className="font-semibold text-slate-800">Winner Screen</div>
                  <div className="text-[10px] text-slate-400">Score & victory card</div>
                </div>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => handleAdd('blank')}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-100 transition"
              >
                <span className="text-base">📄</span>
                <div>
                  <div className="font-semibold text-slate-800">Blank Screen</div>
                  <div className="text-[10px] text-slate-400">Design from scratch</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-slate-400">
        Build multi-step stories, quiz flows, or surprise reveals. Link buttons to any screen!
      </p>

      {/* Screen Cards List */}
      <div className="flex flex-col gap-2">
        {pages.map((p, idx) => {
          const isCurrent = p.id === currentPageId
          const elCount = p.root?.length || 0
          return (
            <div
              key={p.id}
              onClick={() => setCurrentPage(p.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition ${
                isCurrent
                  ? 'border-indigo-400 bg-indigo-50/60 shadow-xs ring-1 ring-indigo-400/30'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
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
                      className="rounded border border-indigo-300 px-1 py-0.5 text-xs font-semibold text-slate-800 outline-none w-28"
                    />
                  ) : (
                    <div
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        setEditingPageId(p.id)
                      }}
                      title="Double-click to rename"
                      className="truncate text-xs font-semibold text-slate-800"
                    >
                      {p.name}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {p.path} · {elCount} block{elCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <button
                  type="button"
                  title="Duplicate screen"
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicatePage(p.id)
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 text-xs"
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
                    className="rounded p-1 text-slate-400 hover:bg-rose-100 hover:text-rose-600 text-xs"
                  >
                    ✕
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

  const onClick = () => {
    let containerId = 'root'
    let targetIndex = null

    if (type === 'section') {
      containerId = 'root'
      if (selectedId) {
        const info = T.findContainerInfo(root, selectedId)
        if (info?.containerId === 'root') {
          targetIndex = info.index + 1
        }
      }
    } else {
      if (selectedId) {
        const sel = T.findById(root, selectedId)
        if (sel && COMPONENTS[sel.type]?.canHaveChildren) {
          containerId = sel.id
          targetIndex = sel.children?.length ?? 0
        } else {
          const info = T.findContainerInfo(root, selectedId)
          if (info && info.containerId) {
            containerId = info.containerId
            targetIndex = info.index + 1
          }
        }
      }

      if (containerId === 'root' && root.length > 0) {
        const firstSection = root.find((n) => n.type === 'section') || root[0]
        if (firstSection && COMPONENTS[firstSection.type]?.canHaveChildren) {
          const col = firstSection.children?.find((c) => COMPONENTS[c.type]?.canHaveChildren)
          containerId = col ? col.id : firstSection.id
        }
      }
    }

    insertElement(type, containerId, targetIndex)
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...listeners}
      {...attributes}
      onClick={onClick}
      title={def.description}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      className="group flex w-full flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md cursor-grab active:cursor-grabbing select-none"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600">
        {def.icon}
      </span>
      <span className="text-xs font-semibold text-slate-700">{def.label}</span>
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
        style={{ paddingLeft: 8 + depth * 12 }}
        className={`group flex cursor-pointer items-center gap-1.5 rounded-md py-1 pr-1.5 text-xs ${
          selected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <span className="w-4 text-center text-[11px] opacity-70">{def?.icon}</span>
        <span className="flex-1 truncate">{element.name || def?.label}</span>
        <button
          type="button"
          className="hidden text-slate-400 hover:text-rose-500 group-hover:block"
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

export default function LeftSidebar() {
  const leftTab = useEditorStore((s) => s.leftTab)
  const setLeftTab = useEditorStore((s) => s.setLeftTab)
  const root = useEditorStore((s) => s.currentPage().root)

  return (
    <aside className="ws-sidebar flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="flex shrink-0 border-b border-slate-200 bg-white">
        {[
          ['screens', '📱 Screens'],
          ['blocks', '🧩 Blocks'],
          ['layers', '🌳 Layers'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setLeftTab(id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              leftTab === id ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ws-scroll flex-1 overflow-y-auto p-3">
        {leftTab === 'screens' && <ScreensTab />}

        {leftTab === 'blocks' && (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] leading-relaxed text-slate-400">
              Drag a block onto the canvas, or click to append it.
            </p>
            {PALETTE_GROUPS.map((group) => (
              <div key={group.name} className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.name}</span>
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
              <p className="px-1 text-[11px] text-slate-400">This screen is empty.</p>
            ) : (
              root.map((el) => <LayerRow key={el.id} element={el} depth={0} />)
            )}
          </div>
        )}
      </div>
    </aside>
  )
}