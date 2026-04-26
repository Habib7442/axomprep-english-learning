'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { 
  Loader2, 
  Mic, 
  MicOff, 
  PhoneOff, 
  ArrowLeft, 
  Trophy, 
  GraduationCap, 
  Zap, 
  Sword,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Vapi from '@vapi-ai/web'
import { motion, AnimatePresence } from 'framer-motion'
import { configureAssistant } from '@/lib/utils'

type Mode = 'tutor' | 'panic' | 'debate'

export default function ChatPage() {
  const { bookId } = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthStore()
  const [book, setBook] = useState<any>(null)
  const [segments, setSegments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedRef = useRef(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'loading' | 'active' | 'error'>('idle')
  const [selectedMode, setSelectedMode] = useState<Mode>('tutor')
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([])
  const [vapi, setVapi] = useState<Vapi | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isCalling, setIsCalling] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Use refs to avoid stale closures in Vapi event handlers
  const transcriptRef = useRef(transcript)
  const callDurationRef = useRef(callDuration)

  useEffect(() => {
    transcriptRef.current = transcript
  }, [transcript])

  useEffect(() => {
    callDurationRef.current = callDuration
  }, [callDuration])
  const { profile } = useAuthStore()

  const supabase = createClient()

  useEffect(() => {
    const vapiToken = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN
    if (vapiToken) {
      const vapiInstance = new Vapi(vapiToken)
      setVapi(vapiInstance)
    } else {
      console.error('Vapi token missing')
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  const fetchBookData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('id', bookId)
        .single()

      if (bookError) throw bookError
      setBook(bookData)

      const { data: segmentsData, error: segmentsError } = await supabase
        .from('book_segments')
        .select('content')
        .eq('book_id', bookId)
        .order('segment_index', { ascending: true })
        .limit(10) // Initial context limit

      if (segmentsError) throw segmentsError
      setSegments(segmentsData || [])
    } catch (error) {
      console.error('Error fetching book data:', error)
      router.push('/dashboard')
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [bookId, router, supabase])

  useEffect(() => {
    if (bookId && user) {
      fetchBookData(hasFetchedRef.current);
      hasFetchedRef.current = true;
    }
  }, [bookId, user, fetchBookData]);

  const toggleMute = () => {
    if (vapi) {
      vapi.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const stopSession = () => {
    vapi?.stop()
  }

  const saveSession = async () => {
    if (!user || transcriptRef.current.length === 0) return


    try {
      const { error } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          book_id: bookId,
          mode: selectedMode,
          duration: callDurationRef.current,
          transcript: transcriptRef.current
        });

      if (error) throw error
    } catch (error) {
      console.error('Error saving session history:', error)
    }
  }

  // Separate effect for Vapi event listeners
  useEffect(() => {
    if (!vapi) return

    const handleCallStart = () => {
      setCallStatus('active')
      setIsCalling(true)
    }

    const handleCallEnd = () => {
      setCallStatus('idle')
      setIsCalling(false)
      saveSession()
    }

    const handleMessage = async (message: any) => {
      
      if (message.type === 'transcript') {
        if (message.transcriptType === 'final') {
          setTranscript(prev => [...prev, { role: message.role, text: message.transcript }])
        }
      }

      if (message.type === 'tool-calls') {
        for (const toolCall of message.toolCallList) {
          if (toolCall.function.name === 'searchBook') {
            try {
              let parsedArgs = {};
              try {
                parsedArgs = JSON.parse(toolCall.function.arguments);
              } catch (e) {
                console.error('Failed to parse tool arguments:', e);
                continue;
              }

              const response = await fetch('/api/vapi/search-book', {
                method: 'POST',
                body: JSON.stringify({
                  message: {
                    toolCalls: [{
                      ...toolCall,
                      function: {
                        ...toolCall.function,
                        arguments: JSON.stringify({
                          ...parsedArgs,
                          bookId: bookId // Auto-inject the current bookId
                        })
                      }
                    }]
                  }
                })
              });
              const data = await response.json();
              // Send the result back to Vapi
              (vapi as any)?.send({
                type: 'tool-call-result',
                toolCallId: toolCall.id,
                result: data.results?.[0]?.result || data.result || "No info found"
              });
            } catch (err) {
              console.error('Error executing client tool:', err);
              (vapi as any)?.send({
                type: 'tool-call-result',
                toolCallId: toolCall.id,
                error: "Failed to fetch book content"
              });
            }
          }
        }
      }
    }

    const handleError = (e: any) => {
      console.error('Vapi detailed error:', e);
      setCallStatus('error')
      alert('Vapi error: ' + (e.message || JSON.stringify(e)))
    }

    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('message', handleMessage)
    vapi.on('error', handleError)

    return () => {
      vapi.off('call-start', handleCallStart)
      vapi.off('call-end', handleCallEnd)
      vapi.off('message', handleMessage)
      vapi.off('error', handleError)
    }
  }, [vapi, bookId]) // bookId used in handleMessage

  // Separate effect for the 5-minute timer
  useEffect(() => {
    let interval: any;
    if (vapi && callStatus === 'active' && profile?.subscription_tier === 'free') {
      interval = setInterval(() => {
        setCallDuration(prev => {
          if (prev >= 300) { // 5 minutes (300 seconds)
            vapi.stop();
            setShowUpgradeModal(true);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [vapi, callStatus, profile])

  // Cleanup on unmount only
  useEffect(() => {
    return () => {
      if (vapi) {
        vapi.stop()
      }
    }
  }, [vapi])


  const startSession = async () => {
    if (!vapi || !user) {
      alert('Vapi is not initialized or user is not logged in.')
      return
    }

    if (!book) {
      alert('Book data not loaded yet.')
      return
    }

    // Check usage for free tier
    if (profile?.subscription_tier === 'free') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())

      if (sessionsError) {
        console.error('Error checking usage:', sessionsError)
        alert('Unable to verify usage limits. Please try again.')
        return
      }

      const totalDuration = sessions?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0
      
      if (totalDuration >= 300) {
        setShowUpgradeModal(true)
        return
      }
    }

    if (segments.length === 0) {
      alert('No text segments found for this book. This can happen if the PDF is scanned (image-only) and contains no selectable text.')
      return
    }

    setCallStatus('loading')
    setTranscript([]) // Clear previous transcript
    
    // Construct PDF context from segments
    const pdfContent = segments.map(s => s.content).join('\n\n')
    
    const assistant = configureAssistant("female", "casual", selectedMode);
    
    // Add the search tool to the assistant model
    if (assistant.model) {
      (assistant.model as any).tools = [
        {
          type: 'function',
          messages: [
            {
              type: 'request-start',
              content: 'Let me check the book for that information...'
            }
          ],
          function: {
            name: 'searchBook',
            description: 'Search for specific information or context within the current book/PDF.',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query to look for in the book segments.'
                }
              },
              required: ['query']
            }
          }
        }
      ];

      // Update system prompt with PDF context
      if (assistant.model.messages?.[0]) {
        assistant.model.messages[0].content += `\n\nPDF Context:\n${pdfContent}`;
      }
    }

    const overrides = {
      variableValues: {
        bookId: book.id,
        topic: book.title,
        subject: "English",
        style: selectedMode
      }
    }


    try {
      await vapi.start(assistant, overrides)
    } catch (e) {
      console.error('Failed to start Vapi session:', e)
      setCallStatus('error')
      alert('Failed to start session: ' + (e instanceof Error ? e.message : String(e)))
    }
  }


  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Preparing your session...</p>
          <span className="sr-only">Preparing your conversation session, please wait...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="font-bold hidden sm:inline">Back to Library</span>
            </button>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <h1 className="text-white font-black tracking-tight text-lg max-w-[200px] sm:max-w-md line-clamp-1">
              {book?.title}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-12 flex flex-col items-center justify-center relative">
        <AnimatePresence mode="wait">
          {!isCalling ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                { 
                  id: 'tutor', 
                  name: 'Tutor Mode', 
                  icon: GraduationCap, 
                  color: 'primary', 
                  desc: 'Patient explanations & guided learning',
                  minTier: 'free'
                },
                { 
                  id: 'panic', 
                  name: 'Exam Panic', 
                  icon: Zap, 
                  color: 'accent', 
                  desc: 'Rapid-fire drills & high-pressure recall',
                  minTier: 'free'
                },
                { 
                  id: 'debate', 
                  name: 'Debate Mode', 
                  icon: Sword, 
                  color: 'primary', 
                  desc: 'Defend your notes against an AI adversary',
                  minTier: 'free'
                }
              ].map((mode) => {
                return (
                  <button
                    key={mode.id}
                    onClick={() => {
                      setSelectedMode(mode.id as Mode);
                    }}
                    className={`group relative flex flex-col p-8 rounded-[2rem] border-2 transition-all duration-500 text-left backdrop-blur-md ${
                      selectedMode === mode.id
                        ? 'bg-primary/20 border-primary shadow-[0_0_50px_rgba(0,181,181,0.25)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                      selectedMode === mode.id ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,181,181,0.5)]' : 'bg-white/5 text-muted-foreground'
                    }`}>
                      <mode.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">{mode.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {mode.desc}
                    </p>
                  </button>
                );
              })}

              <div className="md:col-span-3 mt-8 flex flex-col items-center">
                <Button 
                  onClick={startSession}
                  disabled={callStatus === 'loading'}
                  aria-label={callStatus === 'loading' ? 'Preparing session' : 'Start voice study session'}
                  className="bg-primary text-black hover:bg-accent font-black h-20 px-16 text-2xl rounded-3xl shadow-[0_0_30px_rgba(0,181,181,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  {callStatus === 'loading' ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-4">
                      <Mic className="h-8 w-8" />
                      <span>Start Talking</span>
                    </div>
                  )}
                </Button>
                <p className="mt-6 text-muted-foreground/60 text-sm font-medium uppercase tracking-[0.2em]">
                  Using AI Voice Engine
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="calling"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-12 w-full max-w-2xl"
            >
              {/* Voice Visualizer */}
              <div className="w-64 h-64 rounded-full bg-primary/5 flex items-center justify-center relative">
                <div className="absolute inset-0 border-2 border-primary/20 rounded-full" />
                <div className="absolute inset-4 border-2 border-primary/10 rounded-full" />
                
                <div className="flex gap-2 items-end h-24 z-10">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [15, 60, 15] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.8 + Math.random(),
                        delay: Math.random() 
                      }}
                      className="w-2 bg-primary rounded-full shadow-[0_0_15px_rgba(0,181,181,0.5)]"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-black uppercase tracking-widest mb-6">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {selectedMode} mode active
                </div>
                <h2 className="text-4xl font-black text-white mb-2 italic">Listening to you...</h2>
                <p className="text-muted-foreground font-medium">Go ahead, ask about the PDF</p>
              </div>

              {/* Chat Transcript Area */}
              <div className="w-full bg-card rounded-[2rem] p-8 border border-white/10 h-[400px] flex flex-col relative overflow-hidden shadow-2xl">
                
                <div className="flex-1 overflow-y-auto space-y-6 pt-10 pb-16 scrollbar-hide flex flex-col-reverse">
                  <div className="flex flex-col space-y-6">
                    {transcript.length > 0 ? (
                      transcript.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-base leading-relaxed shadow-lg ${
                            msg.role === 'user' 
                              ? 'bg-primary text-black font-bold rounded-tr-none' 
                              : 'bg-white/10 text-white rounded-tl-none border border-white/10 backdrop-blur-md'
                          }`}>
                            {msg.text}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <Sparkles className="h-10 w-10 text-primary" />
                        </div>
                        <p className="italic text-lg font-medium tracking-wide">Awaiting conversation...</p>
                      </div>
                    )}
                  </div>
                </div>
                
                </div>

              <div className="flex gap-6">
                <Button 
                  onClick={stopSession}
                  variant="destructive"
                  aria-label="End voice session"
                  className="h-16 w-16 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
                <Button 
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  className={`h-16 w-16 rounded-full border transition-all ${
                    isMuted 
                      ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-card border border-white/10 rounded-[2.5rem] p-10 max-w-lg w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-8">
                <Zap className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Trial Ended!</h2>
              <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
                Your 5-minute free session has ended. Upgrade to Pro for unlimited conversations and advanced features.
              </p>
              <div className="flex flex-col gap-4">
                <Button 
                  onClick={() => router.push('/pricing')}
                  className="bg-primary text-black hover:bg-accent font-black h-16 rounded-2xl text-xl shadow-[0_0_30px_rgba(0,181,181,0.3)]"
                >
                  Upgrade to Pro
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-muted-foreground hover:text-white"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
