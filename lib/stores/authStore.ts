import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: { subscription_tier: string } | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<{ success: boolean; error?: string }>
  initializeAuthState: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
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
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_tier')
          .eq('id', session.user.id)
          .single()

        set({ user: session.user, profile: profile || { subscription_tier: 'free' }, isLoading: false })
      } else {
        set({ user: null, profile: null, isLoading: false })
      }
    } catch (error) {
      console.error('Error initializing auth state:', error)
      set({ user: null, isLoading: false })
    }
  },
}))