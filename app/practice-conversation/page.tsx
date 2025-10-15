'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardSidebar } from '@/components/DashboardSidebar'

export default function PracticeConversationPage() {
  const router = useRouter()
  const { user, isLoading } = useAuthStore()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [conversationStage, setConversationStage] = useState<'intro' | 'recording' | 'processing' | 'response'>('intro')
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
    setConversationStage('processing')
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI response
      const mockResponses = [
        "That sounds interesting! Tell me more about that.",
        "I see. How did that make you feel?",
        "Really? What happened next?",
        "That&apos;s a good point. What do you think about...?",
        "I understand. Can you explain that a bit more?"
      ]
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]
      setAiResponse(randomResponse)
      setConversationStage('response')
    } catch (error) {
      console.error('Error processing audio:', error)
      setAiResponse('Sorry, I encountered an error processing your response. Please try again.')
      setConversationStage('response')
    }
  }

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = []
      mediaRecorderRef.current.start()
      setIsRecording(true)
      setTranscript('')
      setConversationStage('recording')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleStartConversation = () => {
    setConversationStage('recording')
  }

  const handleContinueConversation = () => {
    setTranscript('')
    setAiResponse('')
    setConversationStage('recording')
  }

  const handleEndConversation = () => {
    router.push('/dashboard')
  }

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <DashboardSidebar>
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Icons.spinner className="h-8 w-8 animate-spin" />
            <p className="text-lg">Loading conversation practice...</p>
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
                Daily Conversation Practice
              </h2>
              <p className="mt-2 text-muted-foreground">
                Practice everyday conversations with AI
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* AI Conversation Partner */}
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle>AI Conversation Partner</CardTitle>
                  <CardDescription>
                    Your virtual conversation buddy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-64">
                    {conversationStage === 'intro' && (
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto">
                          <Icons.bot className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-muted-foreground">
                          Welcome to daily conversation practice. Let&apos;s have a casual chat to improve your English speaking skills.
                        </p>
                      </div>
                    )}
                    
                    {conversationStage === 'recording' && (
                      <div className="text-center">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto animate-pulse">
                            <Icons.mic className="h-12 w-12 text-white" />
                          </div>
                          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 animate-pulse"></div>
                        </div>
                        <p className="text-muted-foreground">
                          I&apos;m listening to you...
                        </p>
                      </div>
                    )}
                    
                    {conversationStage === 'processing' && (
                      <div className="text-center">
                        <Icons.spinner className="h-12 w-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Thinking of a response...
                        </p>
                      </div>
                    )}
                    
                    {conversationStage === 'response' && (
                      <div className="text-center">
                        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-4 rounded-full w-24 h-24 flex items-center justify-center mb-4 mx-auto">
                          <Icons.bot className="h-12 w-12 text-white" />
                        </div>
                        <p className="text-muted-foreground">
                          {aiResponse || 'Here&apos;s my response to what you said...'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Your Response */}
              <Card className="bg-white/80 dark:bg-card/80 backdrop-blur-lg border border-input/30 shadow-lg">
                <CardHeader>
                  <CardTitle>Your Response</CardTitle>
                  <CardDescription>
                    Speak naturally in English
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-64">
                    {conversationStage === 'intro' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons.mic className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                          Click &quot;Start Conversation&quot; to begin practicing
                        </p>
                        <Button 
                          className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                          onClick={handleStartConversation}
                        >
                          Start Conversation
                        </Button>
                      </div>
                    )}
                    
                    {conversationStage === 'recording' && (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="relative mb-4">
                          <div className="bg-red-500 rounded-full w-16 h-16 flex items-center justify-center animate-pulse">
                            <Icons.mic className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {transcript || 'Speak naturally...'}
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
                    
                    {conversationStage === 'processing' && (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    )}
                    
                    {conversationStage === 'response' && (
                      <div className="flex flex-col h-full">
                        <div className="flex-grow mb-4">
                          <p className="text-muted-foreground">
                            {transcript || 'What you said will appear here...'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={handleContinueConversation}
                            className="flex-1"
                          >
                            Continue
                          </Button>
                          <Button 
                            className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                            onClick={handleEndConversation}
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
            {conversationStage === 'recording' && (
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

            {conversationStage === 'intro' && (
              <div className="mt-6 text-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088]"
                  onClick={handleStartConversation}
                >
                  Start Conversation
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardSidebar>
  )
}