import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Copy,
  Check,
  Globe,
  Sparkles,
  Share2,
  Code2,
  CheckCircle2,
  ArrowRight
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

export default function LandingPage() {
  const { user } = useAuth()
  const [copiedAgent, setCopiedAgent] = useState(false)
  const [copiedCli, setCopiedCli] = useState(false)
  const [activeSection, setActiveSection] = useState('setup')

  const agentPrompt = `> Create a modern portfolio with dark mode, interactive hero, and contact section.
✓ Initializing visual canvas with @dnd-kit...
✓ Syncing project to Supabase PostgreSQL database...
✓ Published live at https://workspace68.vercel.app/publishers/myportfolio 🚀`

  const cliCommand = 'npx create-workspace68-site@latest my-portfolio'

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'agent') {
      setCopiedAgent(true)
      setTimeout(() => setCopiedAgent(false), 2000)
    } else {
      setCopiedCli(true)
      setTimeout(() => setCopiedCli(false), 2000)
    }
  }

  const tocItems = [
    { id: 'setup', label: 'Set up Workspace68' },
    { id: 'how-it-works', label: 'How it works' },
    { id: 'visual-builder', label: 'Visual drag & drop' },
    { id: 'publishing', label: 'Instant publishing' },
    { id: 'ai-builder', label: 'AI generation' },
    { id: 'react-export', label: 'React 18 export' },
    { id: 'security', label: 'Security & RLS' },
  ]

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-200 selection:bg-red-600 selection:text-white">
      {/* Top Banner & Header */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#070709]/95 px-6 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-black tracking-tight text-white text-base">WORKSPACE68</span>
            </Link>
            <span className="hidden text-xs text-zinc-400 font-medium md:inline">
              Visual Website Builder & Publishing
            </span>
          </div>

          {/* Center Links */}
          <div className="hidden items-center gap-6 text-xs font-medium text-zinc-300 lg:flex">
            <a href="#setup" onClick={() => scrollToSection('setup')} className="hover:text-red-400 transition">
              Get started
            </a>
            <a href="#how-it-works" onClick={() => scrollToSection('how-it-works')} className="hover:text-red-400 transition">
              How it works
            </a>
            <a href="#publishing" onClick={() => scrollToSection('publishing')} className="hover:text-red-400 transition">
              Publishing
            </a>
            <a href="#visual-builder" onClick={() => scrollToSection('visual-builder')} className="hover:text-red-400 transition">
              Features
            </a>
            <a
              href="https://github.com/PRN-6/workspace68#readme"
              target="_blank"
              rel="noreferrer"
              className="hover:text-red-400 transition"
            >
              Docs
            </a>
          </div>

          {/* Right Tools & Auth */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-300 sm:flex">
              <Globe className="h-3.5 w-3.5 text-zinc-400" />
              <span>English</span>
            </div>

            <a
              href="https://github.com/PRN-6/workspace68"
              target="_blank"
              rel="noreferrer"
              title="GitHub Repository"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              <GithubIcon className="h-4 w-4" />
            </a>

            <a
              href="https://prinson.is-a.dev/"
              target="_blank"
              rel="noreferrer"
              title="Creator Portfolio"
              className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-red-400 transition"
            >
              👨‍💻
            </a>

            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500"
              >
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden text-xs font-medium text-zinc-300 hover:text-white sm:inline"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main 3-Column Hero Section */}
      <div id="setup" className="mx-auto max-w-[1440px] px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left Column: Heading, Pitch & CTAs (5 cols) */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
              Visual web building, with your team & AI
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.1]">
              Find out how <br />
              <span className="text-red-600">websites</span> work.
            </h1>

            <p className="mt-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
              Design visually with responsive drag-and-drop blocks or prompt AI. Workspace68 builds clean
              React layouts and publishes instantly to custom public URLs with zero devops.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={user ? '/dashboard' : '/register'}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/5 transition hover:bg-zinc-200 active:scale-95"
              >
                Get started
              </Link>
              <a
                href="#how-it-works"
                onClick={() => scrollToSection('how-it-works')}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-400"
              >
                See how it works <span aria-hidden="true">↗</span>
              </a>
            </div>

            {/* Sub-links */}
            <div className="mt-10 space-y-2 border-t border-zinc-800/80 pt-6 text-xs text-zinc-400">
              <p>
                <a
                  href="#publishing"
                  onClick={() => scrollToSection('publishing')}
                  className="font-semibold text-zinc-300 hover:text-red-400 underline decoration-zinc-800 underline-offset-4"
                >
                  Publishers →
                </a>{' '}
                — zero-config custom slugs served live at <code className="text-red-400 font-mono">/publishers/:slug</code>.
              </p>
              <p>
                <a
                  href="#react-export"
                  onClick={() => scrollToSection('react-export')}
                  className="font-semibold text-zinc-300 hover:text-red-400 underline decoration-zinc-800 underline-offset-4"
                >
                  React 18 Export →
                </a>{' '}
                — clean Tailwind CSS components and portable workspace ZIP files.
              </p>
            </div>
          </div>

          {/* Center Column: Interactive Setup / Agent Command Card (5 cols) */}
          <div className="lg:col-span-5">
            <div>
              <h2 className="text-xl font-bold text-white">Set up Workspace68</h2>
              <p className="mt-1 text-xs text-zinc-400">Copy this into your coding agent or visual canvas:</p>

              {/* Agent Mock Card */}
              <div className="mt-4 rounded-xl border border-zinc-800 bg-[#0e0e12] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    </div>
                    <span className="ml-2 text-xs font-medium text-zinc-400">Workspace68 Agent</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(agentPrompt, 'agent')}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white"
                  >
                    {copiedAgent ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-500 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Prompt Code Body */}
                <div className="p-4 font-mono text-xs leading-relaxed text-zinc-300">
                  <p className="text-red-400">&gt; Create a modern portfolio with dark mode, interactive hero, and contact section.</p>
                  <p className="mt-2 text-zinc-300">✓ Initializing visual canvas with @dnd-kit...</p>
                  <p className="mt-1 text-zinc-300">✓ Syncing project to Supabase PostgreSQL database...</p>
                  <p className="mt-1 text-red-400 font-semibold">✓ Published live at https://workspace68.vercel.app/publishers/myportfolio 🚀</p>
                </div>
              </div>

              {/* Terminal Box */}
              <div className="mt-6">
                <span className="text-xs text-zinc-400">Or run in your terminal:</span>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-zinc-800 bg-[#0e0e12] px-4 py-3 font-mono text-xs text-zinc-200">
                  <span className="truncate">{cliCommand}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cliCommand, 'cli')}
                    className="ml-3 flex shrink-0 items-center gap-1 text-zinc-400 hover:text-white"
                  >
                    {copiedCli ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-500 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick specs */}
              <div className="mt-6 space-y-2 text-xs text-zinc-400">
                <p>
                  Built for your stack:{' '}
                  <span className="font-semibold text-white">React 18</span> ·{' '}
                  <span className="font-semibold text-white">Tailwind CSS</span> ·{' '}
                  <span className="font-semibold text-white">Supabase RLS</span> ·{' '}
                  <span className="font-semibold text-white">Vercel</span>
                </p>
                <p>
                  First time or want to preview right away?{' '}
                  <Link to="/register" className="text-red-500 underline underline-offset-4 hover:text-red-400">
                    Create account and open visual editor →
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: "On this page" TOC Sidebar (2 cols) */}
          <div className="hidden lg:col-span-2 lg:block">
            <div className="sticky top-24 pl-4">
              <span className="text-xs font-semibold tracking-wider text-zinc-400">On this page</span>
              <ul className="mt-3 space-y-1 text-xs">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={`w-full rounded-md px-2.5 py-1.5 text-left transition ${
                        activeSection === item.id
                          ? 'border-l-2 border-red-600 bg-red-950/30 font-semibold text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: How It Works */}
      <section id="how-it-works" className="border-t border-zinc-800/80 bg-[#0a0a0d] py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-red-500">Workflow</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">How Workspace68 Works</h2>
            <p className="mt-3 text-sm text-zinc-400">
              From visual drag-and-drop to instant production cloud deployment in three straightforward steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-xl transition hover:border-red-600/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 font-bold border border-red-600/20">
                1
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Visual Design Canvas</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Drag sections, containers, responsive typography, and buttons with real-time responsive viewport switches
                (Desktop, Tablet, Mobile).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-xl transition hover:border-red-600/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 font-bold border border-red-600/20">
                2
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Supabase Cloud Sync</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Your visual documents are saved automatically with debounced cloud persistence, Row Level Security, and
                immutable version snapshots.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-xl transition hover:border-red-600/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 text-red-500 font-bold border border-red-600/20">
                3
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">One-Click Publishing</h3>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                Claim your custom slug and publish instantly at <code>/publishers/:slug</code>. Public visitors get lightning-fast
                rendering without authentication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Visual Drag & Drop Features */}
      <section id="visual-builder" className="border-t border-zinc-800/80 py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Precision Visual Controls</span>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Real components. <br />
                Zero arbitrary black-box code.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Unlike complex site builders that lock you in, Workspace68 uses deterministic component schemas.
                Edit flex layout properties, responsive margins, font sizes, colors, and button click interactions directly.
              </p>

              <div className="mt-6 space-y-3 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                  <span>@dnd-kit drag and drop reordering inside sections and containers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                  <span>Multi-page management with path routing (/home, /about, /projects)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                  <span>Interactive actions: link to external URLs, scroll to ID, or switch pages</span>
                </div>
              </div>
            </div>

            {/* Visual Preview Mock */}
            <div className="rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-xs text-zinc-400">
                <span className="font-semibold text-white">Visual Inspector</span>
                <span className="rounded bg-red-600/10 px-2 py-0.5 text-red-400 border border-red-600/20 font-mono text-[11px]">
                  Desktop View (100%)
                </span>
              </div>
              <div className="mt-4 space-y-3 rounded-lg bg-[#070709] p-4 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Display</span>
                  <span className="text-white">Flex (Column)</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Max Width</span>
                  <span className="text-white">1120px</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Padding</span>
                  <span className="text-white">80px 32px</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Theme Color</span>
                  <span className="text-red-500 font-semibold">#dc2626 (Crimson)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Publishing Engine */}
      <section id="publishing" className="border-t border-zinc-800/80 bg-[#0a0a0d] py-20">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="rounded-2xl border border-zinc-800 bg-[#0e0e12] p-6 shadow-2xl">
              <span className="text-xs font-bold text-red-500">Live Snapshot Engine</span>
              <h3 className="mt-2 text-xl font-bold text-white">Published Website URLs</h3>
              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-lg bg-[#070709] p-3 text-zinc-300 border border-zinc-800/50">
                  <p className="text-[11px] text-zinc-500">Portfolio:</p>
                  <code className="text-red-400">https://workspace68.vercel.app/publishers/myportfolio</code>
                </div>
                <div className="rounded-lg bg-[#070709] p-3 text-zinc-300 border border-zinc-800/50">
                  <p className="text-[11px] text-zinc-500">Agency:</p>
                  <code className="text-red-400">https://workspace68.vercel.app/publishers/inovex</code>
                </div>
                <div className="rounded-lg bg-[#070709] p-3 text-zinc-300 border border-zinc-800/50">
                  <p className="text-[11px] text-zinc-500">Restaurant:</p>
                  <code className="text-red-400">https://workspace68.vercel.app/publishers/myrestaurant</code>
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">Production Publishing</span>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Edit drafts without breaking live visitors.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                Workspace68 separates your editable draft from the published snapshot. When you make edits in the visual
                builder, your live website continues serving the previous version until you hit <b>Republish</b>.
              </p>
              <div className="mt-6 flex gap-4">
                <Link
                  to={user ? '/dashboard' : '/register'}
                  className="rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-red-600/30 hover:bg-red-500 transition"
                >
                  Publish Your First Website
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: React 18 Export */}
      <section id="react-export" className="border-t border-zinc-800/80 py-20">
        <div className="mx-auto max-w-[1440px] px-6 text-center">
          <Code2 className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">
            Export real React 18 source code anytime.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
            No vendor lock-in. Click Download Code to export a ready-to-deploy Vite + React project with Tailwind CSS configuration.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to={user ? '/dashboard' : '/register'}
              className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              Start Building Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#050507] py-12 text-xs text-zinc-500">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">WORKSPACE68</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-zinc-400">
            <a href="https://github.com/PRN-6/workspace68" target="_blank" rel="noreferrer" className="hover:text-white">
              GitHub
            </a>
            <a href="https://prinson.is-a.dev/" target="_blank" rel="noreferrer" className="hover:text-white">
              Developer
            </a>
            <Link to="/login" className="hover:text-white">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
