'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/authStore'
import { Icons } from '@/components/icons'

function AuthCallback() {
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
      
      console.log('Auth callback: session', session);
      
      if (session?.user) {
        // Update our auth store with the user
        setUser(session.user)
        console.log('Auth callback: user set in store', session.user.id);
        
        // Check if user has completed onboarding
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('current_level, goal, daily_goal')
          .eq('id', session.user.id)
          .single()
        
        console.log('Auth callback: user data from Supabase', userData);
        console.log('Auth callback: user error from Supabase', userError);
        
        // Check if we have a next parameter to redirect to a specific page
        const next = searchParams.get('next')
        // Only allow relative URLs to prevent open redirect attacks
        if (next && next.startsWith('/') && !next.startsWith('//')) {
          console.log('Auth callback: redirecting to next parameter', next);
          router.push(next)
        } else {
          // Redirect to dashboard
          console.log('Auth callback: redirecting to dashboard');
          router.push('/dashboard')
        }
      } else {
        // No session, redirect to home
        console.log('Auth callback: no session, redirecting to home');
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

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}