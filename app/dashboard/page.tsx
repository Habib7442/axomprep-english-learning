'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardSidebar } from '@/components/DashboardSidebar'

// Define the user data type
interface UserData {
  id: string
  email: string
  name: string | null
  subscription_tier: string
  created_at: string
  updated_at: string
  current_level: string | null
  goal: string | null
  daily_goal: number | null
  fluency_score: number | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    console.log('Dashboard: user changed', user);
    console.log('Dashboard: isLoading', isLoading);
    
    // Redirect to home if user is not authenticated
    if (!isLoading && !user) {
      console.log('Dashboard: No user, redirecting to home');
      router.push('/')
      return
    }

    // Check if user has completed onboarding and fetch user data
    const checkOnboardingStatus = async () => {
      if (!user) {
        console.log('Dashboard: No user, skipping onboarding check');
        setCheckingOnboarding(false)
        return
      }

      console.log('Dashboard: Checking onboarding status for user', user.id);
      
      try {
        const supabase = createClient()
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()

        console.log('Dashboard: User data from Supabase', userData);
        console.log('Dashboard: Error from Supabase', error);

        if (!error && userData?.current_level && userData?.goal) {
          console.log('Dashboard: Onboarding complete');
          setIsOnboardingComplete(true)
          setUserData(userData)
        } else {
          console.log('Dashboard: Onboarding not complete or error occurred');
          if (error) {
            console.error('Dashboard: Error fetching user data:', error);
          }
        }
      } catch (error) {
        console.error('Dashboard: Error checking onboarding status:', error)
      } finally {
        setCheckingOnboarding(false)
      }
    }

    checkOnboardingStatus()
  }, [user, isLoading, router])

  useEffect(() => {
    console.log('Dashboard: checkingOnboarding changed', checkingOnboarding);
    console.log('Dashboard: user', user);
    console.log('Dashboard: isOnboardingComplete', isOnboardingComplete);
    
    // If onboarding is not complete, redirect to onboarding
    if (!checkingOnboarding && user && !isOnboardingComplete) {
      console.log('Dashboard: Redirecting to onboarding');
      router.push('/onboarding')
    }
  }, [checkingOnboarding, user, isOnboardingComplete, router])

  if (isLoading || checkingOnboarding) {
    console.log('Dashboard: Still loading or checking onboarding');
    return (
      <DashboardSidebar>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <p className="text-lg">Loading dashboard...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  if (!user || !isOnboardingComplete) {
    console.log('Dashboard: No user or onboarding not complete, returning null');
    return null
  }

  // Parse goals from comma-separated string
  const goals = userData?.goal ? userData.goal.split(',') : []

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
                Welcome back, {userData?.name || user?.email?.split('@')[0] || 'User'}!
              </h2>
              <p className="mt-2 text-muted-foreground">
                Continue your English learning journey
              </p>
            </div>

            {/* User Info Cards */}
            <div className="grid gap-6 mb-8 md:grid-cols-3">
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Your Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold capitalize text-[#FF6B35]">
                    {userData?.current_level || 'Beginner'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Based on your assessment
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Goal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#FF6B35]">
                    {userData?.daily_goal || 20} min
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Per day
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Fluency Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#FF6B35]">
                    {userData?.fluency_score || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Keep practicing to improve
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Goals Section */}
            <Card className="mb-8 bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
              <CardHeader>
                <CardTitle>Your Goals</CardTitle>
                <CardDescription>
                  What you want to achieve with AxomPrep English
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {goals.map((goal: string, index: number) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center rounded-full bg-[#FF6B35]/10 px-3 py-1 text-sm font-medium text-[#FF6B35]"
                    >
                      {goal.trim()}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Practice Speaking Card - Only Card Now */}
            <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Practice Interview</CardTitle>
                <CardDescription>
                  Improve your conversational skills with AI-powered mock interviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                  onClick={() => router.push('/practice-interview')}
                >
                  Start Interview Practice
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardSidebar>
  )
}