import { useState } from 'react'
import { parseBox, boxToCss, animTransition } from '../../lib/style'
import ColorWheelPicker from './ColorWheelPicker'

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

export function ColorField({ label, value = '', onChange }) {
  return (
    <Row label={label}>
      <ColorWheelPicker label={label} value={value} onChange={onChange} />
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
      className="ws-input text-center text-xs"
      value={value}
      placeholder="0px"
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function BoxField({ label, value = '', onChange }) {
  const [showCustom, setShowCustom] = useState(false)
  const box = parseBox(value)
  const update = (side) => (v) => onChange(boxToCss({ ...box, [side]: v }))

  const presets = [
    { label: 'None', val: '0px' },
    { label: 'Small', val: '8px 16px' },
    { label: 'Medium', val: '14px 28px' },
    { label: 'Large', val: '24px 36px' },
  ]

  const sides = [
    ['top', 'Top'],
    ['right', 'Right'],
    ['bottom', 'Bottom'],
    ['left', 'Left'],
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-[10px] font-semibold text-indigo-600 hover:underline"
        >
          {showCustom ? 'Presets' : 'Custom'}
        </button>
      </div>

      {!showCustom ? (
        <div className="grid grid-cols-4 gap-1">
          {presets.map((p) => {
            const active = value === p.val
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange(p.val)}
                className={`rounded-md py-1 text-[11px] font-medium border transition ${
                  active
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1">
          {sides.map(([side, tag]) => (
            <div key={side} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-slate-400">{tag}</span>
              {unitInput(box[side], update(side))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function RadiusField({ label = 'Corner Radius', value = '', onChange }) {
  const presets = [
    { label: 'Sharp', val: '0px' },
    { label: 'Soft', val: '8px' },
    { label: 'Curved', val: '16px' },
    { label: 'Pill', val: '9999px' },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-[10px] text-slate-400 font-mono">{value || '0px'}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {presets.map((p) => {
          const active = value === p.val
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.val)}
              className={`rounded-md py-1.5 text-[11px] font-medium border transition ${
                active
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AlignField({ label = 'Alignment', value = 'left', onChange }) {
  const options = [
    { label: 'Left', val: 'left', icon: '⯇' },
    { label: 'Center', val: 'center', icon: '☰' },
    { label: 'Right', val: 'right', icon: '⯈' },
  ]
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-1">
        {options.map((o) => {
          const active = value === o.val
          return (
            <button
              key={o.val}
              type="button"
              onClick={() => onChange(o.val)}
              className={`rounded-md py-1.5 text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                active
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{o.icon}</span>
              <span>{o.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FontSizeField({ label = 'Font Size', value = '16px', onChange }) {
  const presets = [
    { label: 'S', val: '14px' },
    { label: 'M', val: '18px' },
    { label: 'L', val: '32px' },
    { label: 'XL', val: '48px' },
    { label: 'Huge', val: '64px' },
  ]
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-[10px] text-slate-400 font-mono">{value || '16px'}</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {presets.map((p) => {
          const active = value === p.val
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange(p.val)}
              className={`rounded-md py-1 text-xs font-medium border transition ${
                active
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ShadowField({ label, value = '', onChange }) {
  const options = [
    { label: 'None', val: '' },
    { label: 'Soft', val: '0 1px 3px rgba(15,23,42,0.1)' },
    { label: 'Pop', val: '0 8px 20px rgba(15,23,42,0.14)' },
    { label: 'Glow ✨', val: '0 0 24px rgba(236,72,153,0.45)' },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="grid grid-cols-4 gap-1">
        {options.map((o) => {
          const active = (value || '') === o.val || (o.val === '' && !value)
          return (
            <button
              key={o.label}
              type="button"
              onClick={() => onChange(o.val)}
              className={`rounded-md py-1.5 text-[11px] font-medium border transition ${
                active
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-semibold shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
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