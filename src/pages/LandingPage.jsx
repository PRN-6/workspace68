import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Sparkles, Layout, Share2, Cpu } from 'lucide-react'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-800 text-base font-bold shadow-lg shadow-red-500/20">
            W
          </div>
          <span className="text-lg font-bold tracking-tight">workspace68</span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-500"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold transition hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" /> Visual Website Builder & Instant Publishing Platform
        </div>
        <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
          Build visually. <br />
          <span className="bg-gradient-to-r from-red-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Publish instantly.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Design beautiful, responsive websites with a drag-and-drop canvas, AI generation, and instant cloud publishing with custom slugs.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={user ? '/dashboard' : '/register'}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            Start Building Free <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-base font-semibold text-slate-300 hover:bg-slate-800"
          >
            Explore Features
          </a>
        </div>
      </header>

      {/* Feature Grid */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <Layout className="h-8 w-8 text-indigo-400" />
            <h3 className="mt-4 text-xl font-semibold">Visual Drag & Drop</h3>
            <p className="mt-2 text-sm text-slate-400">
              Intuitive section, container, typography, and button blocks designed for responsive desktop, tablet, and mobile layouts.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <Share2 className="h-8 w-8 text-red-400" />
            <h3 className="mt-4 text-xl font-semibold">One-Click Publishing</h3>
            <p className="mt-2 text-sm text-slate-400">
              Claim a unique slug and publish your site with a fast public URL at <code>/publishers/:slug</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
            <Cpu className="h-8 w-8 text-purple-400" />
            <h3 className="mt-4 text-xl font-semibold">AI Site Builder</h3>
            <p className="mt-2 text-sm text-slate-400">
              Prompt AI to generate full-page layouts, tailor typography, or create sections in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Workspace68. Built for modern web creators.</p>
      </footer>
    </div>
  )
}
