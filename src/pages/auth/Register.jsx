import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  UserPlus,
  User,
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

export default function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = displayName.trim()

    if (!cleanName) {
      return setError('Please enter your full name')
    }
    if (!cleanEmail) {
      return setError('Please enter a valid email address')
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }

    setLoading(true)
    try {
      await signUp(cleanEmail, password, cleanName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoRegister = async () => {
    const randomId = Math.floor(Math.random() * 9000 + 1000)
    const demoEmail = `creator_${randomId}@workspace68.dev`
    const demoPass = 'demo1234'
    const demoName = 'Demo Creator'
    setDisplayName(demoName)
    setEmail(demoEmail)
    setPassword(demoPass)
    setConfirmPassword(demoPass)
    setLoading(true)
    setError('')
    try {
      await signUp(demoEmail, demoPass, demoName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Demo registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FE] text-[#1D1B20] selection:bg-[#6750A4] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Soft Ambient Radial Background Glows (Material 3 Expressive) */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#EADDFF]/40 blur-[150px]" />
      <div className="pointer-events-none absolute top-[40%] -right-40 h-[450px] w-[450px] rounded-full bg-[#6750A4]/10 blur-[150px]" />

      {/* Floating Top Nav Pill Header */}
      <header className="relative z-30 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          {/* Logo Pill */}
          <Link
            to="/"
            className="flex items-center gap-2.5 rounded-full border border-[#E7E0EC] bg-white/90 px-3.5 py-1.5 shadow-sm backdrop-blur transition hover:border-[#6750A4]/40"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#6750A4] to-[#4F378B] font-display text-xs font-bold text-white shadow-sm">
              W
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-[#1D1B20]">
              workspace68
            </span>
            <span className="rounded-full bg-[#EADDFF] px-2 py-0.5 text-[10px] font-bold text-[#4F378B]">
              Studio
            </span>
          </Link>

          {/* Action Pills */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-1.5 rounded-full border border-[#E7E0EC] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#49454F] shadow-sm backdrop-blur transition hover:bg-[#F3EDF7] hover:text-[#1D1B20]"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </Link>
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#6750A4] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5B449A] active:scale-95"
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
            <div className="w-full max-w-[460px] rounded-[32px] border border-[#E7E0EC] bg-white/95 p-7 sm:p-9 shadow-[0_20px_50px_-20px_rgba(103,80,164,0.15)] backdrop-blur-xl">
              {/* Segmented Switcher Capsule (Sign In vs Register) */}
              <div className="mb-6 flex rounded-full bg-[#F3EDF7] p-1 shadow-inner">
                <Link
                  to="/login"
                  className="flex-1 rounded-full py-2 text-center text-xs font-medium text-[#49454F] transition-all hover:text-[#1D1B20]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex-1 rounded-full bg-[#6750A4] py-2 text-center text-xs font-semibold text-white shadow-sm transition-all"
                >
                  Create Account
                </Link>
              </div>

              {/* Title & Badge */}
              <div className="mb-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EADDFF] text-[#6750A4] shadow-sm">
                  <UserPlus size={22} />
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D1B20]">
                  Create an account
                </h1>
                <p className="mt-1 text-xs text-[#79747E]">
                  Start sketching screens, previewing flows, and downloading React components.
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
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Display Name Field */}
                <div>
                  <label htmlFor="displayName" className="block text-xs font-semibold text-[#49454F] mb-1">
                    Full Name
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-[#CAC4D0] bg-[#FDFCFE] transition-all focus-within:border-[#6750A4] focus-within:ring-2 focus-within:ring-[#EADDFF]">
                    <User size={16} className="pointer-events-none absolute left-3.5 text-[#6750A4]" />
                    <input
                      type="text"
                      id="displayName"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Alex Smith"
                      className="w-full rounded-2xl bg-transparent py-2.5 pl-11 pr-4 text-xs font-medium text-[#1D1B20] placeholder-[#79747E] outline-none"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-[#49454F] mb-1">
                    Email Address
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-[#CAC4D0] bg-[#FDFCFE] transition-all focus-within:border-[#6750A4] focus-within:ring-2 focus-within:ring-[#EADDFF]">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 text-[#6750A4]" />
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl bg-transparent py-2.5 pl-11 pr-4 text-xs font-medium text-[#1D1B20] placeholder-[#79747E] outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-[#49454F] mb-1">
                    Password (min. 6 characters)
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-[#CAC4D0] bg-[#FDFCFE] transition-all focus-within:border-[#6750A4] focus-within:ring-2 focus-within:ring-[#EADDFF]">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 text-[#6750A4]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-transparent py-2.5 pl-11 pr-11 text-xs font-medium text-[#1D1B20] placeholder-[#79747E] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 p-1 text-[#79747E] hover:text-[#1D1B20]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#49454F] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative flex items-center rounded-2xl border border-[#CAC4D0] bg-[#FDFCFE] transition-all focus-within:border-[#6750A4] focus-within:ring-2 focus-within:ring-[#EADDFF]">
                    <Lock size={16} className="pointer-events-none absolute left-3.5 text-[#6750A4]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl bg-transparent py-2.5 pl-11 pr-11 text-xs font-medium text-[#1D1B20] placeholder-[#79747E] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 p-1 text-[#79747E] hover:text-[#1D1B20]"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#6750A4] py-3 px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(103,80,164,0.25)] transition hover:bg-[#5B449A] hover:shadow-[0_6px_22px_rgba(103,80,164,0.35)] active:scale-[0.98] disabled:opacity-60 mt-2"
                >
                  <UserPlus size={16} />
                  <span>{loading ? 'Creating account…' : 'Create Account'}</span>
                </button>
              </form>

              {/* Instant Demo Access Button */}
              <div className="mt-4 pt-3.5 border-t border-[#E7E0EC]">
                <button
                  type="button"
                  onClick={handleDemoRegister}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full border border-[#CAC4D0] bg-[#F3EDF7]/50 py-2.5 px-4 text-xs font-semibold text-[#4F378B] transition hover:bg-[#EADDFF]/50 active:scale-95"
                >
                  <Zap size={14} className="text-[#6750A4]" />
                  <span>One-Click Demo Registration</span>
                </button>
              </div>

              {/* Footer Switch */}
              <p className="mt-5 text-center text-xs text-[#79747E]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-[#6750A4] transition hover:text-[#5B449A] hover:underline"
                >
                  Sign in
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
      <footer className="relative z-20 py-3 text-center text-[11px] text-[#79747E]">
        Workspace68 · Material 3 Expressive Studio
      </footer>
    </div>
  )
}
