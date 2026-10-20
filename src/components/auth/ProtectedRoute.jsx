import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ink-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-crimson-500 border-t-transparent" />
          <span className="font-display text-sm font-medium text-zinc-400">Loading Workspace68…</span>
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />
}
