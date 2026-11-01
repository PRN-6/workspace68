import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  Zap,
} from 'lucide-react'
import M3PhonePreview from '../../components/auth/M3PhonePreview'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      return setError('Please enter your email address')
    }
    if (!password) {
      return setError('Please enter your password')
    }
    setLoading(true)
    try {
      await signIn(cleanEmail, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setError('')
    setEmail('designer@workspace68.dev')
    setPassword('demo1234')
    setLoading(true)
    try {
      await signIn('designer@workspace68.dev', 'demo1234')
      navigate('/dashboard')
    } catch {
      // In mock auth, if the demo user isn't created yet, create and sign in
      try {
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]')
        if (!users.some((u) => u.email === 'designer@workspace68.dev')) {
          users.push({
            id: 'designer@workspace68.dev',
            email: 'designer@workspace68.dev',
            password: 'demo1234',
            displayName: 'Alex Smith',
          })
          localStorage.setItem('mockUsers', JSON.stringify(users))
        }
        await signIn('designer@workspace68.dev', 'demo1234')
        navigate('/dashboard')
      } catch (e) {
        setError(e.message || 'Demo sign in failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-ink-950 text-zinc-100 selection:bg-crimson-600 selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Soft Ambient Radial Background Glows (Material 3 Expressive) */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-crimson-700/15 blur-[150px]" />
      <div className="pointer-events-none absolute top-[40%] -right-40 h-[450px] w-[450px] rounded-full bg-crimson-500/10 blur-[150px]" />

      {/* Floating Top Nav Pill Header */}
      <header className="relative z-30 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo Pill */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-full border border-ink-700 bg-ink-900/90 px-3.5 py-1.5 shadow-sm backdrop-blur transition hover:border-crimson-600/50"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-xs font-bold text-white shadow-sm">
              W
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-white">
              workspace68
            </span>
            <span className="rounded-full bg-crimson-600/15 px-2 py-0.5 text-[10px] font-bold text-crimson-400">
              Studio
            </span>
          </Link>

          {/* Action Pills */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/90 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 shadow-sm backdrop-blur transition hover:bg-ink-800 hover:text-white"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-crimson-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-crimson-500 active:scale-95"
            >
              <Sparkles size={13} />
              <span>Explore Workspace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content: Split Showcase Layout */}
      <main className="relative z-20 flex-1 px-4 sm:px-6 py-6 flex items-center">
        <div className="mx-auto w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Material 3 Auth Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[450px] rounded-[32px] border border-ink-700/80 bg-ink-900/90 p-7 sm:p-9 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {/* Segmented Switcher Capsule (Sign In vs Register) */}
              <div className="mb-6 flex rounded-full bg-ink-950 border border-ink-800 p-1 shadow-inner">
                <Link
                  to="/login"
                  className="flex-1 rounded-full bg-crimson-600 py-2 text-center text-xs font-semibold text-white shadow-sm transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-full py-2 text-center text-xs font-medium text-zinc-400 transition-all hover:text-white"
                >
                  Create Account
                </Link>
              </div>

              {/* Title & Badge */}
              <div className="mb-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-crimson-600/15 text-crimson-400 shadow-sm">
                  <LogIn size={22} />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                  Welcome back
                </h1>
                <p className="mt-1 text-xs text-zinc-500">
                  Continue building responsive web experiences with real React code.
                </p>
              </div>

              {/* Error Box (M3 Error Container) */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-[#BA1A1A]/20 bg-[#FFDAD6] p-3 text-xs text-[#410002]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#BA1A1A]" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-zinc-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-ink-700 bg-ink-950/80 transition-all focus-within:border-crimson-500 focus-within:ring-2 focus-within:ring-crimson-500/20">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 text-crimson-400" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-4 text-xs font-medium text-white placeholder-zinc-500 outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="text-xs font-semibold text-zinc-400">
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-crimson-400 transition hover:text-crimson-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative flex items-center rounded-2xl border border-ink-700 bg-ink-950/80 transition-all focus-within:border-crimson-500 focus-within:ring-2 focus-within:ring-crimson-500/20">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 text-crimson-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-11 text-xs font-medium text-white placeholder-zinc-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-zinc-500 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-crimson-600 py-3 px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(225,29,51,0.3)] transition hover:bg-crimson-500 hover:shadow-[0_6px_22px_rgba(225,29,51,0.4)] active:scale-[0.98] disabled:opacity-60"
                >
                  <LogIn size={16} />
                  <span>{loading ? 'Signing in…' : 'Sign In'}</span>
                </button>
              </form>

              {/* Instant Demo Access Button */}
              <div className="mt-5 pt-4 border-t border-ink-800">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-[#CAC4D0] bg-ink-950 border border-ink-800/50 py-2.5 px-4 text-xs font-semibold text-[#4F378B] transition hover:bg-crimson-600/15/50 active:scale-95"
                >
                  <Zap size={14} className="text-crimson-400" />
                  <span>One-Click Demo Sign In</span>
                </button>
              </div>

              {/* Footer Switch */}
              <p className="mt-6 text-center text-xs text-zinc-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-crimson-400 transition hover:text-crimson-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Right Column: Material 3 Interactive Phone Showcase (From Reference Images) */}
          <div className="lg:col-span-6 hidden lg:flex justify-center">
            <M3PhonePreview />
          </div>
        </div>
      </main>

      {/* Subtle Bottom Credit */}
      <footer className="relative z-20 py-3 text-center text-[11px] text-zinc-500">
        Workspace68 · Material 3 Expressive Studio
      </footer>
    </div>
  )
}
