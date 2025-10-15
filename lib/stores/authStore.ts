import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  initializeAuthState: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  signInWithGoogle: async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true // We'll handle the redirect ourselves
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Redirect to the Google OAuth URL
      if (data?.url) {
        window.location.href = data.url
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },
  signOut: async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        return { success: false, error: error.message }
      }

      set({ user: null })
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  },
  initializeAuthState: async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        set({ user: session.user, isLoading: false })
      } else {
        set({ user: null, isLoading: false })
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)
      set({ user: null, isLoading: false })
    }
  },
}))