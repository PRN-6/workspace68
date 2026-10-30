import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mail, Send, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage('Password reset link sent! Please check your email inbox.')
    } catch (err) {
      setError(err.message || 'Error requesting reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FE] text-[#1D1B20] selection:bg-[#6750A4] selection:text-white flex flex-col justify-between overflow-x-hidden">
      {/* Soft Ambient Radial Background Glows (Material 3 Expressive) */}
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#EADDFF]/40 blur-[150px]" />
      <div className="pointer-events-none absolute top-[40%] -right-40 h-[450px] w-[450px] rounded-full bg-[#6750A4]/10 blur-[150px]" />

      {/* Floating Top Nav Pill Header */}
      <header className="relative z-30 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
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
          </Link>

          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-full border border-[#E7E0EC] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#49454F] shadow-sm backdrop-blur transition hover:bg-[#F3EDF7] hover:text-[#1D1B20]"
          >
            <ArrowLeft size={13} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full max-w-[440px] rounded-[32px] border border-[#E7E0EC] bg-white/95 p-8 sm:p-10 shadow-[0_20px_50px_-20px_rgba(103,80,164,0.15)] backdrop-blur-xl">
          <div className="mb-6">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EADDFF] text-[#6750A4] shadow-sm">
              <Mail size={22} />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#1D1B20]">
              Reset Password
            </h1>
            <p className="mt-1 text-xs text-[#79747E]">
              Enter your email address and we will send you a password recovery link.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[#BA1A1A]/20 bg-[#FFDAD6] p-3 text-xs text-[#410002]">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-[#BA1A1A]" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-50 p-3 text-xs text-emerald-900">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#49454F] mb-1.5">
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
                  className="w-full rounded-2xl bg-transparent py-3 pl-11 pr-4 text-xs font-medium text-[#1D1B20] placeholder-[#79747E] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#6750A4] py-3 px-6 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(103,80,164,0.25)] transition hover:bg-[#5B449A] hover:shadow-[0_6px_22px_rgba(103,80,164,0.35)] active:scale-[0.98] disabled:opacity-60"
            >
              <Send size={15} />
              <span>{loading ? 'Sending link…' : 'Send Reset Link'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6750A4] transition hover:text-[#5B449A] hover:underline"
            >
              <ArrowLeft size={13} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>

      <footer className="relative z-20 py-3 text-center text-[11px] text-[#79747E]">
        Workspace68 · Material 3 Expressive Studio
      </footer>
    </div>
  )
}
