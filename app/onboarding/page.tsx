'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/authStore'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [level, setLevel] = useState('')
  const [goals, setGoals] = useState<string[]>([])
  const [dailyGoal, setDailyGoal] = useState(20) // Default 20 minutes

  console.log('Onboarding: user', user);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      console.log('Onboarding: No user, redirecting to home');
      router.push('/')
    }
  }, [user, router])

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return;
      
      console.log('Onboarding: Checking if already completed for user', user.id);
      
      try {
        const supabase = createClient()
        const { data: userData, error } = await supabase
          .from('users')
          .select('current_level, goal')
          .eq('id', user.id)
          .single()

        console.log('Onboarding: User data from Supabase', userData);
        console.log('Onboarding: Error from Supabase', error);

        if (!error && userData?.current_level && userData?.goal) {
          console.log('Onboarding: Already completed, redirecting to dashboard');
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Onboarding: Error checking status:', error)
      }
    }
    
    checkOnboardingStatus()
  }, [user, router])

  const handleLevelSelect = (selectedLevel: string) => {
    setLevel(selectedLevel)
    setCurrentStep(2)
  }

  const handleGoalToggle = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal) 
        : [...prev, goal]
    )
  }

  const handleDailyGoalSelect = (minutes: number) => {
    setDailyGoal(minutes)
    // Immediately update the UI when a selection is made
  }

  const completeOnboarding = async () => {
    if (!user) return
    
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Update user profile with onboarding data
      const { error } = await supabase
        .from('users')
        .update({
          current_level: level,
          goal: goals.join(','),
          daily_goal: dailyGoal,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) throw error
      
      console.log('Onboarding: Completed successfully, redirecting to dashboard');
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Level Assessment
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
              Assess Your English Level
            </CardTitle>
            <CardDescription>
              Help us understand your current English skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              This will help us create a personalized learning plan for you.
            </p>
            
            <div className="space-y-4 mt-6">
              <Button 
                onClick={() => handleLevelSelect('beginner')}
                className="w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm"
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">Beginner</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Just starting with English
                  </span>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleLevelSelect('intermediate')}
                className="w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm"
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">Intermediate</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Some English knowledge
                  </span>
                </div>
              </Button>
              
              <Button 
                onClick={() => handleLevelSelect('advanced')}
                className="w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm"
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">Advanced</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Fluent but want to improve
                  </span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 2: Goal Setting
  if (currentStep === 2) {
    const goalOptions = [
      "Crack job interviews",
      "Improve daily conversation",
      "Professional communication",
      "Exam preparation (IELTS/TOEFL)",
      "Just want to speak confidently"
    ]
    
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
              What&apos;s Your Main Goal?
            </CardTitle>
            <CardDescription>
              Select one or more goals that matter to you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 mt-6">
              {goalOptions.map((goal) => (
                <Button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`w-full h-auto py-4 text-left justify-start bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl ${
                    goals.includes(goal)
                      ? 'bg-accent text-accent-foreground border-accent'
                      : ''
                  }`}
                  variant="outline"
                >
                  <div className="flex items-center w-full">
                    <div className={`mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      goals.includes(goal)
                        ? 'bg-[#FF6B35] border-[#FF6B35]'
                        : 'border-input'
                    }`}>
                      {goals.includes(goal) && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{goal}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground rounded-xl"
              >
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(3)}
                disabled={goals.length === 0}
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088] rounded-xl shadow-lg"
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Step 3: Daily Goal Setting
  if (currentStep === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
              Set Your Daily Goal
            </CardTitle>
            <CardDescription>
              How much time can you dedicate daily?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Consistency is key to mastering English!
            </p>
            
            <div className="space-y-4 mt-6">
              <Button 
                onClick={() => handleDailyGoalSelect(10)}
                className={`w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm relative ${
                  dailyGoal === 10
                    ? 'bg-accent text-accent-foreground border-accent shadow-md'
                    : ''
                }`}
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">10 minutes</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Quick daily practice
                  </span>
                </div>
                {dailyGoal === 10 && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6B35] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </Button>
              
              <Button 
                onClick={() => handleDailyGoalSelect(20)}
                className={`w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm relative ${
                  dailyGoal === 20
                    ? 'bg-accent text-accent-foreground border-accent shadow-md'
                    : ''
                }`}
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">20 minutes</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Recommended for most users
                  </span>
                </div>
                {dailyGoal === 20 && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6B35] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </Button>
              
              <Button 
                onClick={() => handleDailyGoalSelect(30)}
                className={`w-full h-16 text-lg bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground transition-all rounded-xl shadow-sm relative ${
                  dailyGoal === 30
                    ? 'bg-accent text-accent-foreground border-accent shadow-md'
                    : ''
                }`}
                variant="outline"
              >
                <div className="flex flex-col items-center">
                  <span className="font-medium">30 minutes</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Intensive practice
                  </span>
                </div>
                {dailyGoal === 30 && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6B35] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </Button>
            </div>
            
            <div className="flex justify-between mt-8">
              <Button 
                onClick={() => setCurrentStep(2)}
                variant="outline"
                className="bg-white dark:bg-card border border-input hover:bg-accent hover:text-accent-foreground rounded-xl"
              >
                Back
              </Button>
              <Button 
                onClick={completeOnboarding}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088] rounded-xl shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}