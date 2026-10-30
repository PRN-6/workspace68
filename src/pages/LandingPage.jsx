import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Boxes,
  Check,
  ChevronRight,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Hand,
  Keyboard,
  Layers,
  LayoutTemplate,
  Link2,
  Monitor,
  MousePointer2,
  Palette,
  Sparkles,
  Type,
  Wand2,
  Zap,
} from 'lucide-react'

function GithubIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  )
}

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'shortcuts', label: 'Shortcuts' },
]

const STEPS = [
  {
    title: 'Sketch',
    body: 'Drag parts onto a screen. Every block is a real component with real props — no magic, no guesswork.',
    icon: Boxes,
  },
  {
    title: 'Link',
    body: 'Connect screens together, then tap through the flow in Preview exactly like a visitor would.',
    icon: Link2,
  },
  {
    title: 'Export',
    body: 'Copy the prompt for your coding agent, or download a genuine React source project you own.',
    icon: Download,
  },
]

const FEATURES = [
  {
    title: 'Parts library',
    body: 'Sections, containers, text, buttons, images and forms — a growing catalogue of composable blocks you drag in.',
    icon: Boxes,
  },
  {
    title: 'Screens & flow',
    body: 'Add as many screens as you like, set their paths, and wire buttons to navigate between them.',
    icon: LayoutTemplate,
  },
  {
    title: 'Theme in one place',
    body: 'Colour, shape, typography and motion tokens are edited once and applied everywhere they are used.',
    icon: Palette,
  },
  {
    title: 'AI help',
    body: 'Stuck on a layout? Ask the assistant for a section, a palette, or a starting point you can keep.',
    icon: Sparkles,
  },
]

const SHORTCUTS = [
  { keys: ['V'], action: 'Select tool' },
  { keys: ['H'], action: 'Hand / pan the canvas' },
  { keys: ['Wheel'], action: 'Pan the canvas' },
  { keys: ['+', '-'], action: 'Zoom in / zoom out' },
  { keys: ['0'], action: 'Reset zoom to 100%' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'C'], action: 'Copy selection' },
  { keys: ['Ctrl', 'V'], action: 'Paste selection' },
  { keys: ['Ctrl', 'D'], action: 'Duplicate selection' },
  { keys: ['Ctrl', 'G'], action: 'Group selection' },
  { keys: ['Shift', 'Click'], action: 'Multi-select' },
  { keys: ['↑', '↓', '←', '→'], action: 'Nudge selection' },
  { keys: ['Delete'], action: 'Remove selection' },
  { keys: ['P'], action: 'Toggle preview' },
]

const STACK = [
  { name: 'React', note: '18' },
  { name: 'Vite', note: '6' },
  { name: 'Tailwind', note: 'CSS' },
  { name: 'Zustand', note: 'state' },
  { name: 'dnd-kit', note: 'drag & drop' },
  { name: 'Supabase', note: 'sync' },
]

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ------------------------------------------------------------------ */
/* Editor mock — pure CSS, no images                                    */
/* ------------------------------------------------------------------ */

function EditorMock() {
  return (
    <div className="animate-fade-up w-full" style={{ animationDelay: '200ms' }}>
      <div className="overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 shadow-lift">
        {/* window chrome */}
        <div className="flex items-center justify-between border-b border-ink-700/80 bg-ink-900/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-crimson-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-600" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-500" />
            <span className="ml-3 hidden text-[11px] font-medium text-zinc-500 sm:inline">
              workspace68 — My Portfolio
            </span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="rounded-md bg-ink-800 px-2 py-1 text-[10px] font-semibold text-zinc-400">Desktop</span>
            <span className="rounded-md bg-ink-800 px-2 py-1 text-[10px] font-semibold text-zinc-400">Tablet</span>
            <span className="rounded-md bg-ink-800 px-2 py-1 text-[10px] font-semibold text-zinc-400">Mobile</span>
          </div>
        </div>

        {/* body */}
        <div className="flex h-[300px] sm:h-[340px]">
          {/* left: parts panel */}
          <div className="hidden w-40 shrink-0 flex-col gap-2 border-r border-ink-700/80 bg-ink-900/60 p-3 sm:flex">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">Parts</span>
            {[
              { label: 'Section', icon: LayoutTemplate },
              { label: 'Text', icon: Type },
              { label: 'Button', icon: MousePointer2 },
              { label: 'Container', icon: Layers },
            ].map((part) => (
              <div
                key={part.label}
                className="flex items-center gap-2 rounded-lg border border-ink-700/70 bg-ink-850 px-2 py-1.5 text-[11px] font-medium text-zinc-400"
              >
                <part.icon className="h-3 w-3 text-crimson-500" />
                {part.label}
              </div>
            ))}
            <div className="mt-1 h-px w-full bg-ink-700/70" />
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">Screens</span>
            <div className="rounded-lg border border-crimson-600/40 bg-crimson-600/10 px-2 py-1.5 text-[11px] font-semibold text-crimson-400">
              Home
            </div>
            <div className="rounded-lg border border-ink-700/70 bg-ink-850 px-2 py-1.5 text-[11px] font-medium text-zinc-500">
              About
            </div>
          </div>

          {/* centre: canvas */}
          <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-ink-950 p-5">
            <div className="absolute inset-0 opacity-[0.55] [background-image:radial-gradient(#2a2a31_1px,transparent_1px)] [background-size:18px_18px]" />
            {/* artboard */}
            <div className="relative w-full max-w-[290px] rounded-lg border border-ink-600 bg-white p-3 shadow-panel">
              <div className="flex items-center justify-between">
                <span className="h-1.5 w-10 rounded-full bg-ink-950/80" />
                <span className="h-4 w-10 rounded-full bg-crimson-600" />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-4/5 rounded-full bg-ink-950/85" />
                <div className="h-2.5 w-3/5 rounded-full bg-ink-950/40" />
                <div className="h-2.5 w-2/3 rounded-full bg-ink-950/25" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-12 rounded-md border border-ink-950/10 bg-ink-950/[0.04]" />
                <div className="h-12 rounded-md border border-ink-950/10 bg-ink-950/[0.04]" />
              </div>
              {/* selection outline */}
              <div className="pointer-events-none absolute -inset-1 rounded-[10px] border border-crimson-500/70">
                <span className="absolute -top-2 left-2 rounded bg-crimson-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                  Hero
                </span>
              </div>
            </div>
            {/* zoom pill */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/90 px-2.5 py-1 text-[10px] font-semibold text-zinc-400">
              <Monitor className="h-3 w-3" />
              100%
            </div>
          </div>

          {/* right: properties */}
          <div className="hidden w-40 shrink-0 flex-col gap-2 border-l border-ink-700/80 bg-ink-900/60 p-3 md:flex">
            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">Properties</span>
            {[
              ['Display', 'Flex'],
              ['Gap', '24px'],
              ['Padding', '48px'],
              ['Radius', '16px'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-ink-700/70 bg-ink-850 px-2 py-1.5 text-[10px]">
                <span className="text-zinc-500">{label}</span>
                <span className="font-semibold text-zinc-200">{value}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center gap-1.5 rounded-lg border border-crimson-600/30 bg-crimson-600/10 px-2 py-1.5 text-[10px] font-semibold text-crimson-400">
              <Wand2 className="h-3 w-3" />
              Suggest section
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink-950 text-zinc-200 selection:bg-crimson-600 selection:text-white">
      {/* Ambient glow field */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-crimson-700/15 blur-[150px]" />
        <div className="absolute top-[40%] -right-40 h-[420px] w-[420px] rounded-full bg-crimson-500/10 blur-[140px]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/85 px-6 py-3.5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-sm font-bold text-white shadow-glow-sm">
                W
              </span>
              <span className="font-display text-base font-bold tracking-tight text-white">workspace68</span>
            </Link>
          </div>

          <div className="hidden items-center gap-1 text-xs font-medium text-zinc-300 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(link.id)
                }}
                className="rounded-full px-3 py-1.5 transition hover:bg-ink-800 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://github.com/PRN-6/workspace68"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-ink-800 hover:text-white"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
            <a
              href="https://prinson.is-a.dev/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-ink-800 hover:text-white"
            >
              Portfolio
              <ExternalLink className="h-3 w-3 text-zinc-500" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-ink-800 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-200 active:scale-95"
            >
              Start designing
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative mx-auto max-w-[1200px] px-6 pb-16 pt-14 sm:pt-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-crimson-600/30 bg-crimson-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-crimson-400">
              <Zap className="h-3 w-3" />
              Open source · MIT licensed
            </p>

            <h1
              className="animate-fade-up mt-5 font-display text-4xl font-bold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ animationDelay: '60ms' }}
            >
              Design a website by{' '}
              <span className="bg-gradient-to-r from-crimson-400 via-crimson-500 to-crimson-700 bg-clip-text text-transparent">
                dragging
              </span>{' '}
              things.
            </h1>

            <p
              className="animate-fade-up mt-5 max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base"
              style={{ animationDelay: '120ms' }}
            >
              workspace68 is a visual website builder that lives entirely in your browser — sketch a layout, link the
              screens together, then export real React source you actually own.
            </p>

            <div
              className="animate-fade-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black shadow-lift transition hover:-translate-y-0.5 hover:bg-zinc-200 active:scale-95"
              >
                Start designing — no account needed
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-5 py-3 text-sm font-medium text-zinc-200 transition hover:-translate-y-0.5 hover:border-crimson-600/50 hover:text-white"
              >
                <Monitor className="h-4 w-4 text-crimson-500" />
                View a live demo
              </Link>
            </div>

            <p
              className="animate-fade-up mt-5 flex items-center gap-2 text-xs text-zinc-500"
              style={{ animationDelay: '220ms' }}
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
              Runs entirely in your browser. No account, no server, nothing to install.
            </p>
          </div>

          <EditorMock />
        </div>
      </header>

      {/* How it works */}
      <section id="how-it-works" className="relative scroll-mt-20 border-t border-ink-700/70 bg-ink-900 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-crimson-500">Workflow</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">How it works</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Three steps from a blank page to something you can ship.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="animate-fade-up relative rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel transition hover:-translate-y-1 hover:border-crimson-600/40 hover:shadow-lift"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10">
                    <step.icon className="h-5 w-5 text-crimson-500" />
                  </div>
                  <span className="font-display text-3xl font-bold text-ink-600">{`0${i + 1}`}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{step.body}</p>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-ink-600 md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section id="features" className="scroll-mt-20 border-t border-ink-700/70 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-crimson-500">Inside the editor</span>
            <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">What's inside</h2>
            <p className="mt-3 text-sm text-zinc-400">
              Everything you need to go from a rough idea to a finished screen — without leaving the canvas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {FEATURES.map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-up group rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel transition hover:-translate-y-1 hover:border-crimson-600/40 hover:shadow-lift"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10 transition group-hover:bg-crimson-600/20">
                  <feature.icon className="h-5 w-5 text-crimson-500" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section id="shortcuts" className="scroll-mt-20 border-t border-ink-700/70 bg-ink-900 py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div>
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-crimson-500">Keyboard</span>
                <h2 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Shortcuts</h2>
                <p className="mt-3 text-sm text-zinc-400">
                  Keep your hands on the keyboard and your momentum in the design.
                </p>
              </div>

              <div className="mt-10 overflow-hidden rounded-3xl border border-ink-700 bg-ink-850 shadow-panel">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-ink-700/80 bg-ink-900/60">
                      <th className="px-5 py-3 font-semibold uppercase tracking-wider text-zinc-500">Key</th>
                      <th className="px-5 py-3 font-semibold uppercase tracking-wider text-zinc-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SHORTCUTS.map((row) => (
                      <tr key={row.action} className="border-b border-ink-700/50 transition last:border-0 hover:bg-ink-900/40">
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="flex flex-wrap items-center gap-1">
                            {row.keys.map((key) => (
                              <kbd
                                key={key}
                                className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-zinc-200 shadow-inner"
                              >
                                {key}
                              </kbd>
                            ))}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-400">{row.action}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* side panel: pointer/hand + stack */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10">
                  <Keyboard className="h-5 w-5 text-crimson-500" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-white">Canvas controls</h3>
                <ul className="mt-4 space-y-3 text-xs text-zinc-400">
                  <li className="flex items-center gap-2.5">
                    <MousePointer2 className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
                    <span className="flex-1">Select and move parts</span>
                    <kbd className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">V</kbd>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Hand className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
                    <span className="flex-1">Pan the canvas</span>
                    <kbd className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">H</kbd>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Copy className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
                    <span className="flex-1">Duplicate what you picked</span>
                    <kbd className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">Ctrl D</kbd>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Code2 className="h-3.5 w-3.5 shrink-0 text-crimson-500" />
                    <span className="flex-1">Export React source</span>
                    <kbd className="rounded-md border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-300">P</kbd>
                  </li>
                </ul>
              </div>

              <div className="rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel">
                <h3 className="font-display text-base font-semibold text-white">Built with</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {STACK.map((item) => (
                    <span
                      key={item.name}
                      className="flex items-center gap-1.5 rounded-full border border-ink-600 bg-ink-800 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-crimson-600/40 hover:text-white"
                    >
                      {item.name}
                      <span className="text-[10px] font-normal text-zinc-500">{item.note}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-ink-700/70 py-20">
        <div className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 className="animate-fade-up font-display text-3xl font-bold text-white sm:text-4xl">
            Open the canvas. It's already yours.
          </h2>
          <p className="animate-fade-up mx-auto mt-3 max-w-xl text-sm text-zinc-400" style={{ animationDelay: '60ms' }}>
            No signup wall, no install, no trial clock. Pick it up, put it down, come back to it later.
          </p>
          <div className="animate-fade-up mt-8 flex justify-center" style={{ animationDelay: '120ms' }}>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-black shadow-lift transition hover:-translate-y-0.5 hover:bg-zinc-200 active:scale-95"
            >
              Start designing — no account needed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-700/70 bg-ink-950 py-12 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-xs font-bold text-white">
              W
            </span>
            <span className="font-display font-semibold tracking-tight text-white">workspace68</span>
            <span>· Released under the MIT License.</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <a
              href="https://github.com/PRN-6/workspace68"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition hover:bg-ink-850 hover:text-white"
            >
              <GithubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
            <span className="text-zinc-600">Made by Prinson R N</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
