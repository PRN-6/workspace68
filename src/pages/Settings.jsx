import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, User, Lock, Trash2, Save, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react'

export default function Settings() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (error) throw error
      await refreshProfile()
      setMessage('Profile updated successfully!')
    } catch (err) {
      setError(err.message || 'Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (password.length < 6) return setError('Password must be at least 6 characters')
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setPassword('')
      setMessage('Password changed successfully!')
    } catch (err) {
      setError(err.message || 'Error updating password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        'WARNING: This will permanently delete your projects, published websites, and profile. Are you sure?'
      )
    )
      return

    try {
      await supabase.from('projects').delete().eq('owner_id', user.id)
      await signOut()
      navigate('/')
    } catch (err) {
      alert(`Error deleting account: ${err.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-ink-700 bg-ink-850 px-3 py-1.5 text-xs text-zinc-400 transition hover:-translate-y-0.5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="mt-5 font-display text-2xl font-bold text-white">Account Settings</h1>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-950/60 p-3 text-xs text-red-400">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-950/60 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="mt-6 rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel">
          <div className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10">
              <User className="h-4 w-4 text-crimson-500" />
            </span>
            Profile Information
          </div>
          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            <div>
              <label className="ws-label">Email Address</label>
              <input
                disabled
                value={user?.email || ''}
                className="mt-1.5 w-full cursor-not-allowed rounded-full border border-ink-700 bg-ink-950 px-4 py-2.5 text-sm text-zinc-500"
              />
            </div>
            <div>
              <label className="ws-label">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="ws-input mt-1.5 w-full rounded-full px-4 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="ws-btn-primary gap-2 px-5 py-2.5 text-xs"
            >
              <Save className="h-3.5 w-3.5" />
              Save Profile
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="mt-6 rounded-3xl border border-ink-700 bg-ink-850 p-6 shadow-panel">
          <div className="flex items-center gap-2 font-display text-base font-semibold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-crimson-600/30 bg-crimson-600/10">
              <Lock className="h-4 w-4 text-crimson-500" />
            </span>
            Security
          </div>
          <form onSubmit={handleUpdatePassword} className="mt-5 space-y-4">
            <div>
              <label className="ws-label">Change Password</label>
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ws-input mt-1.5 w-full rounded-full px-4 py-2.5"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="ws-btn-primary gap-2 px-5 py-2.5 text-xs disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-3xl border border-red-500/25 bg-red-950/25 p-6">
          <div className="flex items-center gap-2 font-display text-base font-semibold text-red-400">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/15">
              <ShieldAlert className="h-4 w-4" />
            </span>
            Danger Zone
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Deleting your account will remove all your draft projects and published websites.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-glow-sm"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete My Account & Websites
          </button>
        </div>
      </div>
    </div>
  )
}
