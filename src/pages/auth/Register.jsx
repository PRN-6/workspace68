import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

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
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      await signUp(email, password, displayName)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070709] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e0e12] p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 font-bold shadow-lg shadow-red-600/30">
            W
          </div>
          <h2 className="mt-3 text-2xl font-bold">Create Account</h2>
          <p className="text-xs text-zinc-400">Start building websites on Workspace68</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300">Display Name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              placeholder="Alex Smith"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-red-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
