import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { UserPlus, User, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Register() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    const cleanName = displayName.trim()

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
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-crimson-900/18 to-transparent" />

      <div className="relative w-full max-w-[420px] rounded-3xl border border-ink-700 bg-ink-850/95 p-8 shadow-lift backdrop-blur">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-crimson-400 to-crimson-700 font-display text-lg font-bold text-white shadow-glow-sm">
            W
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">Workspace68</p>
            <p className="font-display text-lg font-bold leading-tight text-white">Create Account</p>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Sign up</h1>
          <p className="mt-1 text-sm text-zinc-400">Start building in your browser.</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="ws-label">Display Name</label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="ws-input w-full rounded-2xl py-3 pl-11 pr-4"
                placeholder="Alex Smith"
              />
            </div>
          </div>

          <div>
            <label className="ws-label">Email Address</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ws-input w-full rounded-2xl py-3 pl-11 pr-4"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="ws-label">Password</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ws-input w-full rounded-2xl py-3 pl-11 pr-4"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="ws-label">Confirm Password</label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ws-input w-full rounded-2xl py-3 pl-11 pr-4"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="ws-btn-primary w-full justify-center gap-2 py-2.5"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-crimson-400 transition hover:text-crimson-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
