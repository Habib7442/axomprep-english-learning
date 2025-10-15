'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  useEffect(() => {
    // Redirect to home if user is not authenticated
    if (!isLoading && !user) {
      router.push('/')
      return
    }

    // Check if user has completed onboarding
    const checkOnboardingStatus = async () => {
      if (!user) {
        setCheckingOnboarding(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: userData, error } = await supabase
          .from('users')
          .select('current_level, goal')
          .eq('id', user.id)
          .single()

        if (!error && userData?.current_level && userData?.goal) {
          setIsOnboardingComplete(true)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isLoading, router])

  useEffect(() => {
    // If onboarding is not complete, redirect to onboarding
    if (!checkingOnboarding && user && !isOnboardingComplete) {
      router.push('/onboarding')
    }
  }, [checkingOnboarding, user, isOnboardingComplete, router])

  const handleSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error)
    } else {
      // Update our auth store
      useAuthStore.getState().setUser(null)
      // Redirect to home
      router.push('/')
    }
  }

  if (isLoading || checkingOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !isOnboardingComplete) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
          <div className="flex-grow"></div>
          <div className="flex-shrink-0 flex items-center gap-4">
            <span className="text-sm hidden sm:block">Welcome, {user.email}</span>
            <Button variant="outline" onClick={handleSignOut} size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-lg border p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-center">Your Dashboard</h2>
          <p className="mt-2 text-muted-foreground text-center">
            Welcome to your personalized dashboard. This is where you&apos;ll find your learning resources.
          </p>
          
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Subscription Plan</h3>
              <p className="text-2xl font-bold text-primary">Free Tier</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upgrade to unlock premium features
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Progress</h3>
              <p className="text-2xl font-bold">0%</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Start learning to track your progress
              </p>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Resources</h3>
              <p className="text-2xl font-bold">0</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Available learning materials
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}