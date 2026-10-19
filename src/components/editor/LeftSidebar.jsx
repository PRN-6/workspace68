import { useDraggable } from '@dnd-kit/core'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS, PALETTE_GROUPS } from '../../data/components'
import * as T from '../../lib/tree'

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
          ['blocks', 'Blocks'],
          ['layers', 'Layers'],
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
        {leftTab === 'blocks' ? (
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
        ) : (
          <div className="flex flex-col gap-0.5">
            {root.length === 0 ? (
              <p className="px-1 text-[11px] text-slate-400">This page is empty.</p>
            ) : (
              root.map((el) => <LayerRow key={el.id} element={el} depth={0} />)
            )}
          </div>
        )}
      </div>
    </aside>
  )
}