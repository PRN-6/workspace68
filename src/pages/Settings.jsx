import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { ArrowLeft, User, Lock, Trash2 } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Account Settings</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-950/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3 text-xs text-emerald-400">
            {message}
          </div>
        )}

        {/* Profile Card */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center gap-2 text-base font-semibold">
            <User className="h-4 w-4 text-indigo-400" /> Profile Information
          </div>
          <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400">Email Address</label>
              <input
                disabled
                value={user?.email || ''}
                className="mt-1 w-full cursor-not-allowed rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Lock className="h-4 w-4 text-indigo-400" /> Security
          </div>
          <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400">Change Password</label>
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-950/20 p-6">
          <div className="flex items-center gap-2 text-base font-semibold text-red-400">
            <Trash2 className="h-4 w-4" /> Danger Zone
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Deleting your account will remove all your draft projects and published websites.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
          >
            Delete My Account & Websites
          </button>
        </div>
      </div>
    </div>
  )
}
