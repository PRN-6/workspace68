import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Detect if Supabase credentials are missing – the placeholder URL/keys indicate a local‑only setup.
// In that case we fall back to a simple local‑storage mock so the app can be used without a real backend.
const isMockAuth = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

const AuthContext = createContext({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId) => {
    // In mock mode the profile is stored alongside the mock user record.
    if (isMockAuth) {
      const stored = JSON.parse(localStorage.getItem('mockUsers') || '[]')
      const found = stored.find((u) => u.id === userId)
      if (found) setProfile({ display_name: found.displayName })
      return
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    }
  }

  useEffect(() => {
    if (isMockAuth) {
      // No real session – just clear loading.
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    if (isMockAuth) {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]')
      const found = users.find((u) => u.email === email)
      if (!found) throw new Error('User not found – please register first')
      if (found.password !== password) throw new Error('Incorrect password')
      // Mock user object
      const mockUser = { id: email, email }
      setUser(mockUser)
      setProfile({ display_name: found.displayName })
      return { user: mockUser }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signUp = async (email, password, displayName) => {
    if (isMockAuth) {
      const users = JSON.parse(localStorage.getItem('mockUsers') || '[]')
      if (users.some((u) => u.email === email)) throw new Error('User already exists')
      const mockUser = { id: email, email }
      const newUser = { email, password, displayName, id: email }
      users.push(newUser)
      localStorage.setItem('mockUsers', JSON.stringify(users))
      setUser(mockUser)
      setProfile({ display_name: displayName })
      return { user: mockUser }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (isMockAuth) {
      setUser(null)
      setProfile(null)
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile: () => user && fetchProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
