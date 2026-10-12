import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import { STYLE_GROUPS, ANIMATION_OPTIONS, EASING_OPTIONS, ACTION_TYPES } from '../../data/styleControls'
import { TextField, SelectField, ColorField, SliderField, BoxField, ShadowField, Row } from './Field'
import * as T from '../../lib/tree'

function SectionTitle({ children }) {
  return (
    <div className="mb-2 mt-1 border-b border-slate-100 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {children}
    </div>
  )
}

function ControlFor({ control, element, updateStyle }) {
  const value = element.style[control.key] ?? ''
  const onChange = (v) => updateStyle(element.id, { [control.key]: v })
  const common = { label: control.label, value, onChange }

  switch (control.type) {
    case 'select':
      return <SelectField {...common} options={control.options} />
    case 'color':
      return <ColorField {...common} />
    case 'slider':
      return <SliderField {...common} min={control.min} max={control.max} step={control.step} />
    case 'box':
      return <BoxField label={control.label} value={value} onChange={onChange} />
    case 'shadow':
      return <ShadowField label={control.label} value={value} onChange={onChange} />
    default:
      return <TextField {...common} placeholder={control.placeholder} />
  }
}

function ContentEditor({ element }) {
  const updateProps = useEditorStore((s) => s.updateProps)
  if (!['heading', 'text', 'button', 'image'].includes(element.type)) return null

  return (
    <div className="mb-4 flex flex-col gap-2.5">
      <SectionTitle>Content</SectionTitle>
      {element.type === 'heading' && (
        <SelectField
          label="Heading level"
          value={String(element.props.level || 1)}
          options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` }))}
          onChange={(v) => updateProps(element.id, { level: Number(v) })}
        />
      )}
      {(element.type === 'heading' || element.type === 'text') && (
        <Row label="Text">
          <textarea
            className="ws-input h-20 resize-y"
            value={element.props.text || ''}
            onChange={(e) => updateProps(element.id, { text: e.target.value })}
          />
        </Row>
      )}
      {element.type === 'button' && (
        <TextField
          label="Label"
          value={element.props.text || ''}
          onChange={(v) => updateProps(element.id, { text: v })}
        />
      )}
      {element.type === 'image' && (
        <>
          <TextField
            label="Image URL"
            value={element.props.src || ''}
            onChange={(v) => updateProps(element.id, { src: v })}
          />
          <TextField
            label="Alt text"
            value={element.props.alt || ''}
            onChange={(v) => updateProps(element.id, { alt: v })}
          />
        </>
      )}
    </div>
  )
}

function StyleTab({ element }) {
  const updateStyle = useEditorStore((s) => s.updateStyle)
  const setElementLayout = useEditorStore((s) => s.setElementLayout)
  const restoreElementFlow = useEditorStore((s) => s.restoreElementFlow)
  const isFree = element.style.position === 'absolute'

  const enableFreePosition = () => {
    const node = document.getElementById(element.id)
    const parent = node?.parentElement
    if (!node || !parent) return
    const rect = node.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    const flowStyle = Object.fromEntries(
      ['position', 'left', 'top', 'right', 'bottom', 'width', 'height', 'margin']
        .filter((key) => Object.hasOwn(element.style, key))
        .map((key) => [key, element.style[key]])
    )
    setElementLayout(
      element.id,
      {
        position: 'absolute',
        left: `${Math.round(rect.left - parentRect.left - parent.clientLeft + parent.scrollLeft)}px`,
        top: `${Math.round(rect.top - parentRect.top - parent.clientTop + parent.scrollTop)}px`,
        width: `${Math.round(rect.width)}px`,
        height: `${Math.round(rect.height)}px`,
        margin: '0px',
      },
      { mode: 'free', flowStyle }
    )
  }

  return (
    <div>
      <div className="mb-4">
        <SectionTitle>Position</SectionTitle>
        {!isFree ? (
          <button
            type="button"
            onClick={enableFreePosition}
            className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Enable free positioning
          </button>
        ) : (
          <>
            <div className="mb-2 grid grid-cols-2 gap-2">
              {[
                ['X', 'left'],
                ['Y', 'top'],
                ['Width', 'width'],
                ['Height', 'height'],
              ].map(([label, key]) => (
                <label key={key} className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium text-slate-500">{label}</span>
                  <input
                    type="number"
                    className="ws-input"
                    value={Number.parseFloat(element.style[key]) || 0}
                    min={key === 'width' || key === 'height' ? 24 : undefined}
                    onChange={(event) => {
                      const value = Number(event.target.value)
                      if (Number.isFinite(value)) updateStyle(element.id, { [key]: `${value}px` })
                    }}
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => restoreElementFlow(element.id)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Return to responsive layout
            </button>
          </>
        )}
      </div>
      <ContentEditor element={element} />
      {STYLE_GROUPS.filter((g) => !g.when || g.when(element)).map((group) => (
        <div key={group.title} className="mb-4">
          <SectionTitle>{group.title}</SectionTitle>
          <div className="flex flex-col gap-2.5">
            {group.controls
              .filter((c) => !c.when || c.when(element))
              .map((c) => (
                <ControlFor key={c.key} control={c} element={element} updateStyle={updateStyle} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ActionTab({ element }) {
  const project = useEditorStore((s) => s.project)
  const updateAction = useEditorStore((s) => s.updateAction)
  const root = useEditorStore((s) => s.currentPage().root)
  const action = element.action || { type: 'none', value: '', newTab: true }
  const sections = T.collectByType(root, 'section')

  return (
    <div className="flex flex-col gap-3">
      <p className="rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-500">
        Define what happens when a visitor clicks this block.
      </p>
      <SelectField
        label="Action"
        value={action.type}
        options={ACTION_TYPES}
        onChange={(v) => updateAction(element.id, { type: v })}
      />
      {action.type === 'url' && (
        <>
          <TextField
            label="URL"
            value={action.value}
            placeholder="https://example.com"
            onChange={(v) => updateAction(element.id, { value: v })}
          />
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={action.newTab !== false}
              onChange={(e) => updateAction(element.id, { newTab: e.target.checked })}
            />
            Open in new tab
          </label>
        </>
      )}
      {action.type === 'page' && (
        <SelectField
          label="Target page"
          value={action.value}
          options={[
            { value: '', label: 'Choose a page…' },
            ...project.pages.map((p) => ({ value: p.path, label: `${p.name} (${p.path})` })),
          ]}
          onChange={(v) => updateAction(element.id, { value: v })}
        />
      )}
      {action.type === 'scroll' && (
        <SelectField
          label="Scroll to section"
          value={action.value}
          options={[
            { value: '', label: 'Choose a section…' },
            ...sections.map((s) => ({ value: s.id, label: s.name || 'Section' })),
          ]}
          onChange={(v) => updateAction(element.id, { value: v })}
        />
      )}
      {action.type === 'scroll' && sections.length === 0 && (
        <p className="text-[11px] text-amber-600">Add a Section to the page to use scroll actions.</p>
      )}
    </div>
  )
}

function AnimationTab({ element }) {
  const updateAnimation = useEditorStore((s) => s.updateAnimation)
  const anim = element.animation || {}

  return (
    <div className="flex flex-col gap-3">
      <SelectField
        label="Animation"
        value={anim.type || 'none'}
        options={ANIMATION_OPTIONS}
        onChange={(v) => updateAnimation(element.id, { type: v })}
      />
      {anim.type !== 'none' && (
        <>
          <SelectField
            label="Trigger"
            value={anim.trigger || 'scroll'}
            options={[
              { value: 'scroll', label: 'On scroll into view' },
              { value: 'load', label: 'On page load' },
            ]}
            onChange={(v) => updateAnimation(element.id, { trigger: v })}
          />
          <SliderField
            label="Duration (s)"
            value={anim.duration ?? 0.6}
            min={0.1}
            max={2}
            step={0.1}
            onChange={(v) => updateAnimation(element.id, { duration: Number(v) })}
          />
          <SliderField
            label="Delay (s)"
            value={anim.delay ?? 0}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => updateAnimation(element.id, { delay: Number(v) })}
          />
          <SelectField
            label="Easing"
            value={anim.easing || 'ease-out'}
            options={EASING_OPTIONS}
            onChange={(v) => updateAnimation(element.id, { easing: v })}
          />
        </>
      )}
    </div>
  )
}

function PageSettings() {
  const page = useEditorStore((s) => s.currentPage())
  const project = useEditorStore((s) => s.project)
  const renameProject = useEditorStore((s) => s.renameProject)
  const setPageName = useEditorStore((s) => s.setPageName)
  const setPagePath = useEditorStore((s) => s.setPagePath)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionTitle>Project</SectionTitle>
        <TextField label="Project name" value={project.name} onChange={renameProject} />
      </div>
      <div>
        <SectionTitle>Current page</SectionTitle>
        <div className="flex flex-col gap-2.5">
          <TextField label="Page name" value={page.name} onChange={(v) => setPageName(page.id, v)} />
          <TextField label="Route path" value={page.path} onChange={(v) => setPagePath(page.id, v)} placeholder="/about" />
        </div>
      </div>
      <p className="rounded-lg bg-indigo-50 p-2.5 text-[11px] leading-relaxed text-indigo-700">
        Select any block on the canvas to edit its style, actions and animations. Drag blocks from the left panel to
        build your page.
      </p>
    </div>
  )
}

const TABS = [
  ['style', 'Style'],
  ['action', 'Action'],
  ['animation', 'Animation'],
]

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const rightTab = useEditorStore((s) => s.rightTab)
  const setRightTab = useEditorStore((s) => s.setRightTab)
  const updateElement = useEditorStore((s) => s.updateElement)
  const removeElement = useEditorStore((s) => s.removeElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const root = useEditorStore((s) => s.currentPage().root)

  const element = selectedId ? T.findById(root, selectedId) : null

  return (
    <aside className="ws-properties flex w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      {!element ? (
        <div className="ws-scroll flex-1 overflow-y-auto p-4">
          <PageSettings />
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-sm">
                {COMPONENTS[element.type]?.icon}
              </span>
              <input
                value={element.name}
                onChange={(e) => updateElement(element.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-md border border-transparent px-1.5 py-1 text-sm font-semibold text-slate-700 hover:border-slate-200 focus:border-indigo-400 focus:outline-none"
              />
              <button
                type="button"
                title="Duplicate"
                onClick={() => duplicateElement(element.id)}
                className="rounded-md px-1.5 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ⧉
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() => removeElement(element.id)}
                className="rounded-md px-1.5 py-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
              >
                ✕
              </button>
            </div>
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRightTab(id)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition ${
                    rightTab === id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="ws-scroll flex-1 overflow-y-auto p-4">
            {rightTab === 'style' && <StyleTab element={element} />}
            {rightTab === 'action' && <ActionTab element={element} />}
            {rightTab === 'animation' && <AnimationTab element={element} />}
          </div>
        </>
      )}
    </aside>
  )
}