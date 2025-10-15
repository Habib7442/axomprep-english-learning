'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/authStore'
import { Icons } from '@/components/icons'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuthStore()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      // Check for error parameters
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      
      if (error) {
        console.error('Authentication error:', error, errorDescription)
        router.push('/?error=auth_failed')
        return
      }
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        router.push('/?error=auth_failed')
        return
      }
      
      if (session?.user) {
        // Update our auth store with the user
        setUser(session.user)
        
        // Check if user has completed onboarding
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('current_level, goal, daily_goal')
          .eq('id', session.user.id)
          .single()
        
        // If user has no level set, redirect to onboarding
        if (!userError && (!userData?.current_level || !userData?.goal)) {
          router.push('/onboarding')
        } else {
          // Check if we have a next parameter to redirect to a specific page
          const next = searchParams.get('next')
          if (next) {
            router.push(next)
          } else {
            // Redirect to dashboard
            router.push('/dashboard')
          }
        }
      } else {
        // No session, redirect to home
        router.push('/')
      }
    }
    
    handleAuthCallback()
  }, [router, searchParams, setUser])
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  )
}