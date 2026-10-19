import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to sign in')
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
          <h2 className="mt-3 text-2xl font-bold">Welcome back</h2>
          <p className="text-xs text-zinc-400">Sign in to your Workspace68 account</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-950/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex justify-between">
              <label className="text-xs font-semibold text-zinc-300">Password</label>
              <Link to="/forgot-password" className="text-xs text-red-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-[#070709] px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-red-400 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  )
}
