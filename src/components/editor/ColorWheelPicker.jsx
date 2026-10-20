import { useEffect, useRef, useState, useCallback } from 'react'

// Convert HSL (h: 0-360, s: 0-100, l: 0-100) to RGB
function hslToRgb(h, s, l) {
  h = (h % 360 + 360) % 360
  s = Math.max(0, Math.min(100, s)) / 100
  l = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (h < 60) { r = c; g = x; b = 0 }
  else if (h < 120) { r = x; g = c; b = 0 }
  else if (h < 180) { r = 0; g = c; b = x }
  else if (h < 240) { r = 0; g = x; b = c }
  else if (h < 300) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ]
}

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function hslToHex(h, s, l) {
  const [r, g, b] = hslToRgb(h, s, l)
  return rgbToHex(r, g, b)
}

function hexToHsl(hex) {
  if (!hex || hex === 'transparent') return { h: 0, s: 0, l: 50 }
  let c = hex.replace('#', '').trim()
  if (c.length === 3) c = c.split('').map((x) => x + x).join('')
  const num = parseInt(c, 16)
  if (isNaN(num)) return { h: 0, s: 0, l: 50 }

  const r = ((num >> 16) & 255) / 255
  const g = ((num >> 8) & 255) / 255
  const b = (num & 255) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h = Math.round(h * 60)
  }

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

// Fun presets tailored for simple websites (birthday surprises, quizzes, greetings, arcade games)
const PALETTES = [
  {
    name: '🎉 Birthday & Fun',
    colors: ['#ec4899', '#f43f5e', '#a855f7', '#fbbf24', '#06b6d4', '#fb923c'],
  },
  {
    name: '🎮 Quiz & Game',
    colors: ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6'],
  },
  {
    name: '✨ Modern & Clean',
    colors: ['#ffffff', '#f1f5f9', '#64748b', '#0f172a', '#000000', 'transparent'],
  },
]

export default function ColorWheelPicker({ value = '', onChange, label }) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)
  const canvasRef = useRef(null)
  const isDraggingRef = useRef(false)

  const isTransparent = value === 'transparent' || !value
  const initialHsl = hexToHsl(value)
  const [hue, setHue] = useState(initialHsl.h)
  const [saturation, setSaturation] = useState(initialHsl.s || 100)
  const [lightness, setLightness] = useState(initialHsl.l || 50)

  // Sync state if external value changes
  useEffect(() => {
    if (value && value !== 'transparent') {
      const parsed = hexToHsl(value)
      setHue(parsed.h)
      setSaturation(parsed.s)
      setLightness(parsed.l)
    }
  }, [value])

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  // Draw circular color wheel
  const WHEEL_SIZE = 160
  const RADIUS = WHEEL_SIZE / 2

  useEffect(() => {
    if (!open) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const imgData = ctx.createImageData(WHEEL_SIZE, WHEEL_SIZE)
    const data = imgData.data

    for (let y = 0; y < WHEEL_SIZE; y++) {
      for (let x = 0; x < WHEEL_SIZE; x++) {
        const dx = x - RADIUS
        const dy = y - RADIUS
        const dist = Math.sqrt(dx * dx + dy * dy)
        const idx = (y * WHEEL_SIZE + x) * 4

        if (dist <= RADIUS) {
          let angle = Math.atan2(dy, dx) * (180 / Math.PI)
          if (angle < 0) angle += 360
          const sat = Math.min(100, (dist / RADIUS) * 100)
          const [r, g, b] = hslToRgb(angle, sat, lightness)
          data[idx] = r
          data[idx + 1] = g
          data[idx + 2] = b
          data[idx + 3] = 255
        } else {
          data[idx + 3] = 0 // Transparent outside circle
        }
      }
    }
    ctx.putImageData(imgData, 0, 0)
  }, [open, lightness])

  // Handle color wheel click/drag
  const handleWheelPointer = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - RADIUS
    const y = e.clientY - rect.top - RADIUS
    const dist = Math.min(RADIUS, Math.sqrt(x * x + y * y))

    let angle = Math.atan2(y, x) * (180 / Math.PI)
    if (angle < 0) angle += 360

    const newHue = Math.round(angle)
    const newSat = Math.round((dist / RADIUS) * 100)
    setHue(newHue)
    setSaturation(newSat)

    const hex = hslToHex(newHue, newSat, lightness)
    onChange(hex)
  }, [lightness, onChange])

  const onPointerDown = (e) => {
    isDraggingRef.current = true
    handleWheelPointer(e)
  }

  const onPointerMove = (e) => {
    if (isDraggingRef.current) {
      handleWheelPointer(e)
    }
  }

  const onPointerUp = () => {
    isDraggingRef.current = false
  }

  // Calculate indicator position
  const indicatorDist = (saturation / 100) * RADIUS
  const rad = (hue * Math.PI) / 180
  const indicatorX = RADIUS + indicatorDist * Math.cos(rad)
  const indicatorY = RADIUS + indicatorDist * Math.sin(rad)

  const handleLightnessChange = (e) => {
    const newL = Number(e.target.value)
    setLightness(newL)
    const hex = hslToHex(hue, saturation, newL)
    onChange(hex)
  }

  const handleSelectSwatch = (color) => {
    onChange(color)
    if (color !== 'transparent') {
      const parsed = hexToHsl(color)
      setHue(parsed.h)
      setSaturation(parsed.s)
      setLightness(parsed.l)
    }
  }

  const currentColorHex = isTransparent ? 'transparent' : (value || '#ffffff')

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Visual Clickable Color Wheel Swatch */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          title="Click to open Color Wheel"
          aria-label={`Pick color for ${label}`}
          className="relative flex h-8 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 transition hover:scale-105 active:scale-95"
          style={{
            borderColor: 'var(--ws-border-strong)',
            backgroundColor: isTransparent ? '#ffffff' : currentColorHex,
            backgroundImage: isTransparent
              ? 'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)'
              : 'none',
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        >
          {isTransparent && <span className="text-[10px] font-bold text-rose-500">✕</span>}
        </button>

        {/* Friendly Quick-Color Picker Trigger */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center justify-between rounded-xl border px-2.5 py-1.5 text-xs transition"
          style={{ background: 'var(--ws-panel-2)', borderColor: 'var(--ws-border)', color: 'var(--ws-text-2)' }}
        >
          <span className="font-medium truncate">
            {isTransparent ? 'Transparent' : currentColorHex}
          </span>
          <span style={{ color: 'var(--ws-text-3)' }}>🎨 Wheel</span>
        </button>
      </div>

      {/* Popover Wheel Modal */}
      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-10 z-50 w-72 animate-scale-in rounded-3xl border p-4 shadow-lift"
          style={{ background: 'var(--ws-panel)', borderColor: 'var(--ws-border)', color: 'var(--ws-text)' }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--ws-border)' }}>
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--ws-text)' }}>
              <span>🎡</span> Color Wheel
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSelectSwatch('transparent')}
                className="rounded-full bg-crimson-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-crimson-500 transition hover:bg-crimson-500/25"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ws-icon-btn !h-7 !min-w-7 !p-0"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Color Wheel Canvas */}
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-crosshair select-none rounded-full shadow-md"
              style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <canvas
                ref={canvasRef}
                width={WHEEL_SIZE}
                height={WHEEL_SIZE}
                className="rounded-full"
              />
              {/* Selection Indicator Ring */}
              <div
                className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: indicatorX,
                  top: indicatorY,
                  backgroundColor: hslToHex(hue, saturation, lightness),
                }}
              />
            </div>

            {/* Brightness / Lightness slider */}
            <div className="mt-3 w-full">
              <div className="mb-1 flex justify-between text-[10px] font-semibold" style={{ color: 'var(--ws-text-3)' }}>
                <span>Dark</span>
                <span>Brightness</span>
                <span>Light</span>
              </div>
              <input
                type="range"
                min={5}
                max={95}
                value={lightness}
                onChange={handleLightnessChange}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #000000, ${hslToHex(hue, saturation, 50)}, #ffffff)`,
                }}
              />
            </div>
          </div>

          {/* Curated Fun Swatches for Non-Programmers */}
          <div className="mt-3.5 border-t pt-3" style={{ borderColor: 'var(--ws-border)' }}>
            <span className="ws-label">Quick Fun Colors</span>
            <div className="mt-2 flex flex-col gap-2">
              {PALETTES.map((palette) => (
                <div key={palette.name} className="flex items-center justify-between gap-1">
                  <span className="w-24 truncate text-[10px] font-medium" style={{ color: 'var(--ws-text-3)' }}>
                    {palette.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {palette.colors.map((color) => {
                      const isClear = color === 'transparent'
                      const isSelected = value === color
                      return (
                        <button
                          key={color}
                          type="button"
                          title={color}
                          onClick={() => handleSelectSwatch(color)}
                          className={`h-5 w-5 rounded-full border transition hover:scale-125 ${
                            isSelected ? 'ring-2 ring-[#e11d33] ring-offset-1' : ''
                          }`}
                          style={{
                            backgroundColor: isClear ? '#fff' : color,
                            borderColor: isSelected ? '#e11d33' : 'var(--ws-border)',
                            position: 'relative',
                          }}
                        >
                          {isClear && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-crimson-500">
                              /
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
