'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initializeAuthState, setUser } = useAuthStore()

  useEffect(() => {
    initializeAuthState()

    const supabase = createClient()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initializeAuthState, setUser])

  return <>{children}</>
}