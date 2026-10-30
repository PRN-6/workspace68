import { useState, useEffect, useRef } from 'react'
import { useEditorStore } from '../../store/editorStore'
import { COMPONENTS } from '../../data/components'
import { STYLE_GROUPS, ANIMATION_OPTIONS, EASING_OPTIONS, ACTION_TYPES } from '../../data/styleControls'
import { TextField, SelectField, ColorField, SliderField, BoxField, RadiusField, AlignField, FontSizeField, ShadowField, Row } from './Field'
import { iconFor } from './componentIcons'
import {
  Copy,
  X,
  MousePointerClick,
  RotateCcw,
  Lock,
  PanelRightClose,
  Check,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Palette,
  Type,
  Plus,
} from 'lucide-react'
import * as T from '../../lib/tree'
import { ANIM_STYLES } from '../../lib/style'

function SectionTitle({ children }) {
  return (
    <div className="ws-label mb-2 mt-1 border-b pb-1.5" style={{ borderColor: 'var(--ws-border)' }}>
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
    case 'radius':
      return <RadiusField label={control.label} value={value} onChange={onChange} />
    case 'align':
      return <AlignField label={control.label} value={value} onChange={onChange} />
    case 'fontSize':
      return <FontSizeField label={control.label} value={value} onChange={onChange} />
    case 'shadow':
      return <ShadowField label={control.label} value={value} onChange={onChange} />
    default:
      return <TextField {...common} placeholder={control.placeholder} />
  }
}

// Content fields per block type: the text an author edits for each part.
const CONTENT_FIELDS = {
  heading: [{ key: 'text', label: 'Text', multiline: true }],
  text: [{ key: 'text', label: 'Text', multiline: true }],
  lead: [{ key: 'text', label: 'Text', multiline: true }],
  quote: [
    { key: 'text', label: 'Quote', multiline: true },
    { key: 'author', label: 'Author' },
  ],
  code: [{ key: 'text', label: 'Code', multiline: true }],
  button: [
    { key: 'text', label: 'Label' },
    { key: 'icon', label: 'Icon' },
  ],
  link: [
    { key: 'text', label: 'Label' },
    { key: 'href', label: 'Link' },
  ],
  iconButton: [
    { key: 'icon', label: 'Icon' },
    { key: 'label', label: 'Accessible label' },
  ],
  fab: [
    { key: 'icon', label: 'Icon' },
    { key: 'label', label: 'Label' },
  ],
  chip: [{ key: 'text', label: 'Label' }],
  badge: [{ key: 'text', label: 'Label' }],
  card: [
    { key: 'title', label: 'Title' },
    { key: 'text', label: 'Text', multiline: true },
  ],
  hero: [
    { key: 'eyebrow', label: 'Eyebrow' },
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle', multiline: true },
    { key: 'cta', label: 'Button label' },
  ],
  featureCard: [
    { key: 'icon', label: 'Icon' },
    { key: 'title', label: 'Title' },
    { key: 'text', label: 'Text', multiline: true },
  ],
  pricingCard: [
    { key: 'plan', label: 'Plan' },
    { key: 'price', label: 'Price' },
    { key: 'period', label: 'Period' },
    { key: 'cta', label: 'Button label' },
  ],
  testimonial: [
    { key: 'quote', label: 'Quote', multiline: true },
    { key: 'author', label: 'Author' },
    { key: 'role', label: 'Role' },
    { key: 'initials', label: 'Initials' },
  ],
  ctaBanner: [
    { key: 'title', label: 'Title' },
    { key: 'text', label: 'Text', multiline: true },
    { key: 'button', label: 'Button label' },
  ],
  navbar: [{ key: 'brand', label: 'Brand' }],
  footer: [
    { key: 'brand', label: 'Brand' },
    { key: 'copyright', label: 'Copyright' },
  ],
  avatar: [
    { key: 'initials', label: 'Initials' },
    { key: 'src', label: 'Image URL' },
  ],
  icon: [{ key: 'glyph', label: 'Glyph' }],
  image: [
    { key: 'src', label: 'Image URL' },
    { key: 'alt', label: 'Alt text' },
  ],
  video: [
    { key: 'url', label: 'Video URL' },
    { key: 'title', label: 'Title' },
  ],
  input: [
    { key: 'label', label: 'Label' },
    { key: 'placeholder', label: 'Placeholder' },
  ],
  textarea: [
    { key: 'label', label: 'Label' },
    { key: 'placeholder', label: 'Placeholder' },
  ],
  select: [{ key: 'label', label: 'Label' }],
  checkbox: [{ key: 'label', label: 'Label' }],
  switch: [{ key: 'label', label: 'Label' }],
  slider: [{ key: 'label', label: 'Label' }],
  form: [
    { key: 'title', label: 'Title' },
    { key: 'buttonText', label: 'Button label' },
  ],
  stat: [
    { key: 'value', label: 'Value' },
    { key: 'label', label: 'Label' },
    { key: 'trend', label: 'Trend' },
  ],
  rating: [{ key: 'caption', label: 'Caption' }],
  progress: [{ key: 'label', label: 'Label' }],
}

// Repeating content — edited as plain text so nobody has to write JSON.
const LIST_FIELDS = {
  list: { key: 'items', label: 'Items — one per line', mode: 'lines' },
  accordion: { key: 'items', label: 'Rows — "Title | Body" per line', mode: 'pipe' },
  tabs: { key: 'items', label: 'Tabs — one per line', mode: 'lines' },
  navbar: { key: 'links', label: 'Links — one per line', mode: 'lines' },
  footer: { key: 'links', label: 'Links — one per line', mode: 'lines' },
  pricingCard: { key: 'features', label: 'Features — one per line', mode: 'lines' },
  select: { key: 'options', label: 'Options — one per line', mode: 'lines' },
  gallery: { key: 'images', label: 'Image URLs — one per line', mode: 'lines' },
  table: { key: 'columns', label: 'Columns — one per line', mode: 'lines' },
}

const NUMBER_FIELDS = {
  rating: [{ key: 'value', label: 'Rating', min: 0, max: 5, step: 1 }],
  progress: [{ key: 'value', label: 'Progress %', min: 0, max: 100, step: 1 }],
  slider: [{ key: 'value', label: 'Value', min: 0, max: 100, step: 1 }],
  grid: [{ key: 'columns', label: 'Columns', min: 1, max: 6, step: 1 }],
}

function listToText(value, mode) {
  if (!Array.isArray(value)) return ''
  if (mode === 'pipe') {
    return value
      .map((item) => (typeof item === 'string' ? item : `${item.title || ''} | ${item.body || ''}`))
      .join('\n')
  }
  return value
    .map((item) => (typeof item === 'string' ? item : item.title || ''))
    .join('\n')
}

function textToList(text, mode) {
  const lines = String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  if (mode === 'pipe') {
    return lines.map((line) => {
      const [title, body] = line.split('|')
      return { title: (title || '').trim(), body: (body || '').trim() }
    })
  }
  return lines
}

function ContentEditor({ element }) {
  const updateProps = useEditorStore((s) => s.updateProps)
  const fields = CONTENT_FIELDS[element.type]
  const listField = LIST_FIELDS[element.type]
  const numberFields = NUMBER_FIELDS[element.type]

  if (!fields && !listField && !numberFields && element.type !== 'heading') return null

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

      {fields?.map((field) =>
        field.multiline ? (
          <Row key={field.key} label={field.label}>
            <textarea
              className="ws-input h-20 resize-y"
              value={element.props[field.key] || ''}
              onChange={(e) => updateProps(element.id, { [field.key]: e.target.value })}
            />
          </Row>
        ) : (
          <TextField
            key={field.key}
            label={field.label}
            value={element.props[field.key] || ''}
            onChange={(v) => updateProps(element.id, { [field.key]: v })}
          />
        )
      )}

      {numberFields?.map((field) => (
        <Row key={field.key} label={field.label}>
          <input
            type="number"
            min={field.min}
            max={field.max}
            step={field.step}
            className="ws-input"
            value={element.props[field.key] ?? 0}
            onChange={(e) => updateProps(element.id, { [field.key]: Number(e.target.value) })}
          />
        </Row>
      ))}

      {listField && (
        <Row label={listField.label}>
          <textarea
            className="ws-input h-24 resize-y"
            value={listToText(element.props[listField.key], listField.mode)}
            onChange={(e) =>
              updateProps(element.id, { [listField.key]: textToList(e.target.value, listField.mode) })
            }
          />
        </Row>
      )}
    </div>
  )
}

function StyleTab({ element }) {
  const updateStyle = useEditorStore((s) => s.updateStyle)
  const setElementLayout = useEditorStore((s) => s.setElementLayout)
  const restoreElementFlow = useEditorStore((s) => s.restoreElementFlow)
  const isSection = element.type === 'section'
  const isFree = !isSection && element.style.position === 'absolute'

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

  const QUICK_THEMES = [
    {
      name: '🎉 Birthday Party',
      style: {
        backgroundColor: '#ec4899',
        color: '#ffffff',
        borderRadius: '9999px',
        boxShadow: '0 0 20px rgba(236,72,153,0.45)',
        fontWeight: '700',
        padding: '12px 24px',
        borderWidth: '0px',
      },
    },
    {
      name: '🎮 Quiz Choice',
      style: {
        backgroundColor: '#6366f1',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
        fontWeight: '600',
        padding: '12px 20px',
        borderWidth: '0px',
      },
    },
    {
      name: '⚡ Neon Arcade',
      style: {
        backgroundColor: '#09090b',
        color: '#06b6d4',
        borderRadius: '8px',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#06b6d4',
        boxShadow: '0 0 16px rgba(6,182,212,0.4)',
        fontWeight: '700',
        padding: '10px 20px',
      },
    },
    {
      name: '⭐ Golden Winner',
      style: {
        backgroundColor: '#f59e0b',
        color: '#0f172a',
        borderRadius: '12px',
        boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
        fontWeight: '700',
        padding: '12px 24px',
        borderWidth: '0px',
      },
    },
  ]

  return (
    <div>
      {/* Quick Fun Themes for buttons, cards, headings */}
      {['button', 'heading', 'text', 'container'].includes(element.type) && (
        <div className="mb-4">
          <SectionTitle>Quick Fun Themes</SectionTitle>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_THEMES.map((theme) => (
              <button
                key={theme.name}
                type="button"
                onClick={() => updateStyle(element.id, theme.style)}
                className="rounded-2xl border p-2 text-left text-xs font-semibold transition hover:-translate-y-0.5 active:scale-95"
                style={{ background: 'var(--ws-panel-2)', borderColor: 'var(--ws-border)', color: 'var(--ws-text-2)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--ws-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--ws-border)')}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isSection && (
        <div className="mb-4">
          <SectionTitle>Position & Placement</SectionTitle>
          <div className="ws-seg mb-2.5">
            <button
              type="button"
              onClick={() => {
                if (isFree) restoreElementFlow(element.id)
              }}
              data-active={!isFree ? 'true' : 'false'}
              className="ws-seg-btn"
            >
              📌 In-Flow (Stack)
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isFree) enableFreePosition()
              }}
              data-active={isFree ? 'true' : 'false'}
              className="ws-seg-btn"
            >
              🎯 Free Place
            </button>
          </div>

          {isFree ? (
            <div className="rounded-2xl border p-2.5" style={{ borderColor: 'var(--ws-accent)', background: 'var(--ws-accent-soft)' }}>
              <p className="mb-2 text-[11px] leading-snug" style={{ color: 'var(--ws-text-2)' }}>
                Drag this block anywhere on the page, or tap quick alignment:
              </p>
              <div className="mb-3 flex items-center gap-1.5">
                {[
                  ['⬅ Left', { left: '24px' }],
                  ['↔ Center', { left: 'calc(50% - 80px)' }],
                  ['⬆ Top', { top: '24px' }],
                ].map(([label, style]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateStyle(element.id, style)}
                    className="flex-1 rounded-xl border py-1 text-[11px] font-medium transition hover:-translate-y-px"
                    style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)', color: 'var(--ws-accent)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ['X (px)', 'left'],
                  ['Y (px)', 'top'],
                  ['Width', 'width'],
                  ['Height', 'height'],
                ].map(([label, key]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--ws-text-3)' }}>{label}</span>
                    <input
                      type="number"
                      className="ws-input text-xs"
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
            </div>
          ) : (
            <p className="text-[11px]" style={{ color: 'var(--ws-text-3)' }}>
              Element stays in normal responsive flow. Switch to <b>Free Place</b> to position anywhere.
            </p>
          )}
        </div>
      )}
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
      <p className="rounded-2xl p-2 text-[11px] leading-relaxed" style={{ background: 'var(--ws-panel-2)', color: 'var(--ws-text-3)' }}>
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
          <label className="flex items-center gap-2 text-xs text-[var(--ws-text-2)]">
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
          label="Target Screen / Step"
          value={action.value}
          options={[
            { value: '', label: 'Choose a screen…' },
            ...project.pages.map((p, idx) => ({
              value: p.path,
              label: `Screen ${idx + 1}: ${p.name}`,
            })),
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

  const [playing, setPlaying] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const replayTimer = useRef(null)

  const replay = () => {
    setPlaying(false)
    setPreviewKey((k) => k + 1)
    clearTimeout(replayTimer.current)
    replayTimer.current = setTimeout(() => setPlaying(true), 40)
  }

  // Clear the pending timer on unmount so it does not fire against a dead
  // component.
  useEffect(() => () => clearTimeout(replayTimer.current), [])

  useEffect(() => {
    if (anim.type && anim.type !== 'none') {
      replay()
    }
  }, [anim.type, anim.duration, anim.easing, anim.delay])

  const hidden = ANIM_STYLES[anim.type] || {}
  const dur = Number(anim.duration) || 0.6
  const delay = Number(anim.delay) || 0
  const easing = anim.easing || 'ease-out'
  const testStyle = {
    ...(playing ? {} : hidden),
    transition: `opacity ${dur}s ${easing} ${delay}s, transform ${dur}s ${easing} ${delay}s`,
  }

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

          {/* Interactive Live Animation Preview */}
          <div className="mt-2 rounded-2xl border p-3" style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}>
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold" style={{ color: 'var(--ws-text-3)' }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-emerald-500" />
                Live Preview
              </span>
              <button
                type="button"
                onClick={replay}
                className="ws-btn !px-2.5 !py-1 !text-[11px]"
              >
                <RotateCcw size={11} /> Replay
              </button>
            </div>
            <div className="flex h-16 items-center justify-center overflow-hidden rounded-xl border border-dashed" style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border-strong)' }}>
              <div
                key={previewKey}
                style={testStyle}
                className="rounded-xl bg-[#e11d33] px-4 py-2 text-xs font-semibold text-white shadow-glow-sm"
              >
                {element.type === 'button' ? (element.props?.text || 'Button') : `${element.name || 'Block'}`}
              </div>
            </div>
          </div>
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
      <p className="flex gap-2 rounded-2xl border p-2.5 text-[11px] leading-relaxed" style={{ borderColor: 'var(--ws-accent)', background: 'var(--ws-accent-soft)', color: 'var(--ws-text-2)' }}>
        <MousePointerClick size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--ws-accent)' }} />
        <span>
          Select any block on the canvas to edit its style, actions and animations. Drag blocks from the left panel to
          build your page.
        </span>
      </p>
    </div>
  )
}

const TABS = [
  ['style', 'Design'],
  ['action', 'Trigger'],
  ['animation', 'Animation'],
]

export default function PropertiesPanel() {
  const selectedId = useEditorStore((s) => s.selectedId)
  const rightTab = useEditorStore((s) => s.rightTab)
  const setRightTab = useEditorStore((s) => s.setRightTab)
  const updateElement = useEditorStore((s) => s.updateElement)
  const removeElement = useEditorStore((s) => s.removeElement)
  const duplicateElement = useEditorStore((s) => s.duplicateElement)
  const toggleRightSidebar = useEditorStore((s) => s.toggleRightSidebar)
  const root = useEditorStore((s) => s.currentPage().root)

  const element = selectedId ? T.findById(root, selectedId) : null

  return (
    <aside
      className="ws-properties flex w-full h-full min-h-0 shrink-0 flex-col border-l"
      style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
    >
      {!element ? (
        <div className="ws-scroll flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--ws-border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--ws-text)' }}>Page & Project</span>
            <button
              type="button"
              onClick={toggleRightSidebar}
              title="Collapse panel"
              className="ws-icon-btn shrink-0"
            >
              <PanelRightClose size={15} />
            </button>
          </div>
          <PageSettings />
        </div>
      ) : (
        <>
          <div className="shrink-0 border-b p-3" style={{ borderColor: 'var(--ws-border)' }}>
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-2xl"
                style={{ background: 'var(--ws-accent-soft)', color: 'var(--ws-accent)' }}
              >
                {(() => {
                  const Icon = iconFor(element.type)
                  return <Icon size={15} />
                })()}
              </span>
              <input
                value={element.name}
                onChange={(e) => updateElement(element.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-xl border border-transparent px-2 py-1 text-sm font-semibold transition"
                style={{ color: 'var(--ws-text)' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ws-accent)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--ws-accent-soft)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'transparent'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
              <button
                type="button"
                title={element.locked ? 'Unlock' : 'Lock'}
                onClick={() => updateElement(element.id, { locked: !element.locked })}
                className="ws-icon-btn !h-7 !min-w-7 !p-0"
                style={{ color: element.locked ? 'var(--ws-accent)' : undefined }}
              >
                <Lock size={13} />
              </button>
              <button
                type="button"
                title="Duplicate"
                onClick={() => duplicateElement(element.id)}
                className="ws-icon-btn !h-7 !min-w-7 !p-0"
              >
                <Copy size={13} />
              </button>
              <button
                type="button"
                title="Delete"
                onClick={() => removeElement(element.id)}
                className="ws-icon-btn !h-7 !min-w-7 !p-0 hover:!text-crimson-400"
              >
                <X size={13} />
              </button>
              <button
                type="button"
                title="Collapse panel"
                onClick={toggleRightSidebar}
                className="ws-icon-btn !h-7 !min-w-7 !p-0"
              >
                <PanelRightClose size={14} />
              </button>
            </div>
            <div className="ws-seg">
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRightTab(id)}
                  data-active={rightTab === id ? 'true' : 'false'}
                  className="ws-seg-btn"
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