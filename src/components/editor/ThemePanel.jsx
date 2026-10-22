import { useEditorStore, DEFAULT_THEME } from '../../store/editorStore'
import { Palette, Type, Ruler, Moon, Sun, Wand2 } from 'lucide-react'

const SEEDS = [
  { name: 'Crimson', value: '#e11d33' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Teal', value: '#0d9488' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Graphite', value: '#111827' },
]

const RADII = [
  { label: 'Sharp', value: '0px' },
  { label: 'Soft', value: '8px' },
  { label: 'Round', value: '16px' },
  { label: 'Pill', value: '9999px' },
]

const FONTS = [
  { label: 'Inter', value: 'Inter' },
  { label: 'System', value: 'system-ui, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
]

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Icon size={12} style={{ color: 'var(--ws-text-3)' }} />
        <span className="ws-label">{label}</span>
      </div>
      {children}
    </div>
  )
}

export default function ThemePanel() {
  const theme = useEditorStore((s) => s.project.theme) || DEFAULT_THEME
  const setTheme = useEditorStore((s) => s.setTheme)
  const applyThemeToProject = useEditorStore((s) => s.applyThemeToProject)

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--ws-text-3)' }}>
        Theme tokens apply to new blocks instantly. Push them across the whole project when you are happy.
      </p>

      <Row icon={Palette} label="Accent colour">
        <div className="grid grid-cols-3 gap-1.5">
          {SEEDS.map((seed) => {
            const active = theme.seed === seed.value
            return (
              <button
                key={seed.value}
                type="button"
                title={seed.name}
                onClick={() => setTheme({ seed: seed.value })}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border text-[10px] font-semibold transition"
                style={{
                  borderColor: active ? 'var(--ws-accent)' : 'var(--ws-border)',
                  background: active ? 'var(--ws-accent-soft)' : 'var(--ws-panel-2)',
                  color: active ? 'var(--ws-accent)' : 'var(--ws-text-2)',
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: seed.value }}
                />
                {seed.name}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={theme.seed || '#e11d33'}
            onChange={(e) => setTheme({ seed: e.target.value })}
            className="h-8 w-10 cursor-pointer rounded-lg border"
            style={{ borderColor: 'var(--ws-border)', background: 'var(--ws-panel-2)' }}
          />
          <input
            className="ws-input !py-1.5 !text-[11px]"
            value={theme.seed || ''}
            onChange={(e) => setTheme({ seed: e.target.value })}
            placeholder="#e11d33"
          />
        </div>
      </Row>

      <Row icon={Ruler} label="Corner style">
        <div className="grid grid-cols-4 gap-1.5">
          {RADII.map((radius) => {
            const active = theme.radius === radius.value
            return (
              <button
                key={radius.value}
                type="button"
                onClick={() => setTheme({ radius: radius.value })}
                className="rounded-xl border py-2 text-[10px] font-semibold transition"
                style={{
                  borderColor: active ? 'var(--ws-accent)' : 'var(--ws-border)',
                  background: active ? 'var(--ws-accent-soft)' : 'var(--ws-panel-2)',
                  color: active ? 'var(--ws-accent)' : 'var(--ws-text-2)',
                }}
              >
                {radius.label}
              </button>
            )
          })}
        </div>
      </Row>

      <Row icon={Type} label="Typography">
        <select
          className="ws-input !py-1.5 !text-[11px]"
          value={theme.font || 'Inter'}
          onChange={(e) => setTheme({ font: e.target.value })}
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </Row>

      <Row icon={theme.scheme === 'dark' ? Moon : Sun} label="Mode">
        <div className="ws-seg">
          {[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setTheme({ scheme: mode.id })}
              data-active={theme.scheme === mode.id ? 'true' : 'false'}
              className="ws-seg-btn"
            >
              {mode.label}
            </button>
          ))}
        </div>
      </Row>

      <button
        type="button"
        onClick={applyThemeToProject}
        className="ws-btn ws-btn-primary w-full"
      >
        <Wand2 size={13} />
        Apply theme to every block
      </button>
    </div>
  )
}
