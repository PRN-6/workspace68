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
    <div className="relative flex min-h-screen items-center justify-center bg-ink-950 px-4 text-white">
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[460px] w-[460px] rounded-full bg-crimson-700/15 blur-[150px]" />

      <div className="animate-scale-in relative w-full max-w-md rounded-3xl border border-ink-700 bg-ink-850 p-8 shadow-lift backdrop-blur">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10 shadow-glow-sm">
          <Mail className="h-5 w-5 text-crimson-500" />
        </span>
        <h2 className="mt-4 font-display text-xl font-bold text-white">Reset Password</h2>
        <p className="mt-1 text-xs text-zinc-400">Enter your email to receive recovery instructions.</p>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/60 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ws-input w-full rounded-full py-2.5 pl-10 pr-4"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="ws-btn-primary w-full justify-center gap-2 py-2.5"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-5 text-center">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
