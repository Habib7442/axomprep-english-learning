'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { 
  History, 
  Clock, 
  BookOpen, 
  Calendar,
  MessageSquare,
  ChevronRight,
  Loader2,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HistoryPage() {
  const { user, profile, isLoading: authLoading } = useAuthStore()
  const [sessions, setSessions] = useState<any[]>([])
  const [dailyUsage, setDailyUsage] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedRef = useRef(false)
  const supabase = createClient()

  const fetchHistory = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select(`
          *,
          books (
            title
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessions(data || [])

      // Calculate today's usage in local timezone
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      const todaySessions = (data || []).filter(s => {
        const sessionDate = new Date(s.created_at)
        return sessionDate >= todayStart
      })
      const totalToday = todaySessions.reduce((acc, s) => acc + (s.duration || 0), 0)
      setDailyUsage(totalToday)
    } catch (error: any) {
      console.error('Error fetching history:', error.message || error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user) {
      fetchHistory(hasFetchedRef.current);
      hasFetchedRef.current = true;
    }
  }, [user, fetchHistory]);

  const deleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSessions(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session')
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium">Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 pt-12 max-w-7xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 text-primary mb-2">
              <History className="h-6 w-6" />
              <span className="font-black uppercase tracking-widest text-sm">Learning Journey</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Session History</h1>
            <p className="text-muted-foreground mt-2">Review your past conversations and study progress.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-6 bg-card/30 backdrop-blur-md border border-white/5 px-6 py-4 rounded-2xl w-full">
            {profile?.subscription_tier === 'free' && (
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Daily Free Limit</p>
                  <p className="text-[10px] font-bold text-white">{Math.floor(dailyUsage / 60)}m {dailyUsage % 60}s / 5m</p>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${Math.min((dailyUsage / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="hidden md:block w-px h-10 bg-white/10" />

            <div className="grid grid-cols-2 gap-4 md:flex md:gap-8 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
              <div className="text-left md:text-right">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/60">Sessions</p>
                <p className="text-xl md:text-2xl font-black text-primary">{sessions.length}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground/60">Time</p>
                <p className="text-xl md:text-2xl font-black text-white whitespace-nowrap">
                  {Math.floor(sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60)}m {sessions.reduce((acc, s) => acc + (s.duration || 0), 0) % 60}s
                </p>
              </div>
            </div>
          </div>
        </header>

        {sessions.length === 0 ? (
          <div className="bg-card/30 border border-white/5 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <History className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No history yet</h2>
            <p className="text-muted-foreground max-w-sm mb-8">
              Your study sessions will appear here once you start talking to your PDFs.
            </p>
            <Button asChild className="bg-primary text-black font-bold h-12 px-8 rounded-xl">
              <Link href="/dashboard">Go to Library</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <div 
                key={session.id}
                className="group bg-card/30 hover:bg-card/50 border border-white/5 hover:border-primary/20 rounded-[1.5rem] p-4 sm:p-6 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden"
              >
                <div className="flex items-start gap-4 md:gap-5 min-w-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <BookOpen className="h-6 w-6 md:h-7 md:w-7 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors truncate pr-4">
                      {session.books?.title || 'Unknown Book'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-[11px] md:text-sm text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {format(new Date(session.created_at), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {Math.floor((session.duration || 0) / 60)}m {(session.duration || 0) % 60}s
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        {session.transcript?.length || 0}
                      </div>
                      <div className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-black uppercase tracking-widest text-primary/70 border border-white/5">
                        {session.mode}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteSession(session.id)}
                    className="h-11 w-11 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all shrink-0"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button 
                    asChild
                    className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-white/5 hover:bg-primary text-white hover:text-black transition-all font-bold group/btn border border-white/10"
                  >
                    <Link href={`/chat/${session.book_id}`} className="flex items-center justify-center gap-2">
                      Resume Study
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>
    </div>
  )
}
