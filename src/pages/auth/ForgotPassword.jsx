import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <h2 className="text-xl font-bold">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-400">Enter your email to receive recovery instructions.</p>
        
        {error && (
          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-950/60 p-3 text-xs text-emerald-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            placeholder="you@example.com"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
