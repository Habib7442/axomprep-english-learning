'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardSidebar } from '@/components/DashboardSidebar'

export default function PracticeInterviewPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [interviewStage, setInterviewStage] = useState<'intro' | 'recording' | 'processing' | 'response'>('intro')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Redirect to home if user is not authenticated
  useEffect(() => {
    // Wait until auth state is fully loaded
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // Initialize media recorder
  useEffect(() => {
    const initMediaRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data)
          }
        }
        
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          audioChunksRef.current = []
          await processAudio(audioBlob)
        }
        
        mediaRecorderRef.current = mediaRecorder
      } catch (error) {
        console.error('Error accessing microphone:', error)
      }
    }
    
    initMediaRecorder()
    
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const processAudio = async (audioBlob: Blob) => {
    setInterviewStage('processing')
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI response
      const mockResponses = [
        "That&apos;s a great answer! You clearly understand the importance of teamwork. Could you tell me about a specific time when you had to work with a difficult team member?",
        "Interesting perspective. How do you handle situations when you disagree with your supervisor?",
        "Good point about communication. What strategies do you use to ensure clear communication in a multicultural workplace?"
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      setAiResponse(randomResponse)
      setInterviewStage('response')
    } catch (error) {
      console.error('Error processing audio:', error)
      setAiResponse('Sorry, I encountered an error processing your response. Please try again.')
      setInterviewStage('response')
    }
  }

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setTranscript('')
      setInterviewStage('recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleStartInterview = () => {
    setInterviewStage('recording')
  }

  const handleNextQuestion = () => {
    setTranscript('')
    setAiResponse('')
    setInterviewStage('recording')
  }

  const handleEndInterview = () => {
    router.push('/dashboard')
  }

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <p className="text-lg">Loading interview practice...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  // Redirect to home if user is not authenticated
  if (!user) {
    return null
  }

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-background">

        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
                Job Interview Practice
              </h2>
              <p className="mt-2 text-muted-foreground">
                Practice answering interview questions with AI feedback
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* AI Interviewer Panel */}
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle>AI Interviewer</CardTitle>
                  <CardDescription>
                    Your virtual interview coach
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-64">
                    {interviewStage === 'intro' && (
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto">
                          <Icons.bot className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-muted-foreground">
                          Welcome to your interview practice session. I&apos;ll ask you job-related questions and provide feedback on your answers.
                        </p>
                      </div>
                    )}
                    
                    {interviewStage === 'recording' && (
                      <div className="text-center">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto animate-pulse">
                            <Icons.mic className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 animate-pulse"></div>
                        </div>
                        <p className="text-muted-foreground">
                          I&apos;m listening to your answer...
                        </p>
                      </div>
                    )}
                    
                    {interviewStage === 'processing' && (
                      <div className="text-center">
                        <Icons.spinner className="h-12 w-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Processing your response...
                        </p>
                      </div>
                    )}
                    
                    {interviewStage === 'response' && (
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto">
                          <Icons.bot className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-muted-foreground">
                          {aiResponse || 'Thank you for your answer. Here&apos;s my feedback...'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* User Response Panel */}
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Response</CardTitle>
                  <CardDescription>
                    Speak your answer to the interview question
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-64">
                    {interviewStage === 'intro' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons.mic className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Click &quot;Start Interview&quot; to begin practicing
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                          onClick={handleStartInterview}
                        >
                          Start Interview
                        </Button>
                      </div>
                    )}
                    
                    {interviewStage === 'recording' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="relative mb-4">
                          <div className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center animate-pulse">
                            <Icons.mic className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {transcript || 'Speak your answer now...'}
                        </p>
                        <Button 
                          variant="destructive" 
                          onClick={stopRecording}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Stop Recording
                        </Button>
                      </div>
                    )}
                    
                    {interviewStage === 'processing' && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    )}
                    
                    {interviewStage === 'response' && (
                      <div className="flex flex-col h-full">
                        <div className="flex-grow mb-4">
                          <p className="text-muted-foreground">
                            {transcript || 'Your response will appear here...'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={handleNextQuestion}
                            className="flex-1"
                          >
                            Next Question
                          </Button>
                          <Button 
                            className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                            onClick={handleEndInterview}
                          >
                            Finish
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recording Controls */}
            {interviewStage === 'recording' && (
              <div className="mt-6 text-center">
                <Button 
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={stopRecording}
                >
                  <Icons.mic className="h-5 w-5 mr-2" />
                  Stop Recording
                </Button>
              </div>
            )}

            {interviewStage === 'intro' && (
              <div className="mt-6 text-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                  onClick={handleStartInterview}
                >
                  Start Interview
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardSidebar>
  )
}