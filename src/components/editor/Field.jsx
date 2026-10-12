import { useState } from 'react'
import { parseBox, boxToCss, SHADOW_PRESETS, animTransition } from '../../lib/style'

function Label({ children }) {
  return <span className="text-[11px] font-medium text-slate-500">{children}</span>
}

export function Row({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </label>
  )
}

export function TextField({ label, value = '', placeholder, onChange }) {
  return (
    <Row label={label}>
      <input
        className="ws-input"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Row>
  )
}

export function SelectField({ label, value = '', options = [], onChange }) {
  return (
    <Row label={label}>
      <select className="ws-input cursor-pointer" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        })}
      </select>
    </Row>
  )
}

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

export function ColorField({ label, value = '', onChange }) {
  const safe = HEX_RE.test(value) ? value : '#ffffff'
  return (
    <Row label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-9 cursor-pointer rounded-md border border-slate-200 bg-white p-0.5"
        />
        <input
          className="ws-input"
          value={value}
          placeholder="#ffffff / transparent"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </Row>
  )
}

export function SliderField({ label, value = 0, min = 0, max = 1, step = 0.05, onChange }) {
  const num = value === '' || value == null ? min : Number(value)
  return (
    <Row label={`${label} · ${num}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(num) ? num : min}
        onChange={(e) => onChange(e.target.value)}
        className="w-full accent-indigo-600"
      />
    </Row>
  )
}

function unitInput(value, onChange) {
  return (
    <input
      className="ws-input text-center"
      value={value}
      placeholder="0"
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function BoxField({ label, value = '', onChange }) {
  const box = parseBox(value)
  const update = (side) => (v) => onChange(boxToCss({ ...box, [side]: v }))
  const sides = [
    ['top', 'T'],
    ['right', 'R'],
    ['bottom', 'B'],
    ['left', 'L'],
  ]
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {sides.map(([side, tag]) => (
          <div key={side} className="flex flex-col items-center gap-0.5">
            <span className="text-[9px] text-slate-400">{tag}</span>
            {unitInput(box[side], update(side))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function ShadowField({ label, value = '', onChange }) {
  const [custom, setCustom] = useState(false)
  const isPreset = SHADOW_PRESETS.some((p) => p.value === value) || !value || value === 'none'
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {!custom ? (
        <div className="flex flex-col gap-1">
          <select
            className="ws-input cursor-pointer"
            value={isPreset ? value : '__custom'}
            onChange={(e) => {
              if (e.target.value === '__custom') setCustom(true)
              else onChange(e.target.value)
            }}
          >
            <option value="">None</option>
            {SHADOW_PRESETS.map((p) => (
              <option key={p.label} value={p.value}>
                {p.label}
              </option>
            ))}
            <option value="__custom">Custom…</option>
          </select>
          <button
            type="button"
            className="text-left text-[10px] text-indigo-600 hover:underline"
            onClick={() => setCustom(true)}
          >
            Edit as CSS…
          </button>
        </div>
      ) : (
        <input
          className="ws-input"
          value={value}
          placeholder="0 4px 12px rgba(0,0,0,.1)"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

export function AnimPreview({ animation }) {
  if (!animation || animation.type === 'none') return null
  return (
    <span className="text-[10px] text-slate-400">
      preview: {animation.type} · {animTransition(animation)}
    </span>
  )
}