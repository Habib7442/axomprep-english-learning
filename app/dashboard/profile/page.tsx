"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { 
  User, 
  Mail, 
  CreditCard, 
  Calendar,
  Clock,
  MessageSquare,
  ShieldCheck,
  Edit2,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { user, profile, setProfile } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(profile?.name || '')
  const [stats, setStats] = useState({ totalSessions: 0, totalTime: 0, dailyUsage: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const hasFetchedRef = useRef(false)
  const supabase = createClient()

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('duration, created_at')
        .eq('user_id', user?.id)

      if (error) throw error

      if (data) {
        const totalSessions = data.length
        const totalTime = data.reduce((acc, s) => acc + (s.duration || 0), 0)
        
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        const dailyUsage = data
          .filter(s => {
            const sessionDate = new Date(s.created_at)
            return sessionDate >= todayStart
          })
          .reduce((acc, s) => acc + (s.duration || 0), 0)

        setStats({ totalSessions, totalTime, dailyUsage })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [user?.id, supabase])

  useEffect(() => {
    if (user) {
      fetchStats(hasFetchedRef.current);
      hasFetchedRef.current = true;
    }
  }, [user, fetchStats]);

  const handleUpdateName = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', user.id)

      if (error) throw error

      if (profile) {
        setProfile({ ...profile, name: newName })
      }
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0F0F0F] p-8 pb-20">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header Section */}
        <header>
          <div className="flex items-center gap-3 text-primary mb-2">
            <div className="h-px w-8 bg-primary/30" />
            <span className="font-black uppercase tracking-widest text-sm">Account Overview</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and track your learning progress.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card/30 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
              
              <div className="relative flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-black shadow-[0_0_40px_rgba(0,181,181,0.3)]">
                  <User className="h-12 w-12" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full max-w-sm">
                        <input 
                          type="text" 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-primary w-full"
                          autoFocus
                        />
                        <button onClick={handleUpdateName} className="p-2 hover:text-primary transition-colors">
                          <Check className="h-5 w-5" />
                        </button>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:text-red-400 transition-colors">
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-black text-white">{profile?.name || 'Student'}</h2>
                        <button onClick={() => setIsEditing(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary/60" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">
                    {profile?.subscription_tier || 'Free'} Tier
                  </span>
                </div>
              </div>
            </div>

            {/* Usage Summary */}
            <div className="bg-card/30 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Daily Usage Limit
                </h3>
                <span className="text-sm font-bold text-white">
                  {Math.floor(stats.dailyUsage / 60)}m {stats.dailyUsage % 60}s / 5m
                </span>
              </div>

              <div className="space-y-4">
                <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(0,181,181,0.5)]" 
                    style={{ width: `${Math.min((stats.dailyUsage / 300) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You have used <span className="text-primary font-bold">{Math.floor(stats.dailyUsage / 60)}m {stats.dailyUsage % 60}s</span> of your 5-minute daily free talking time. Upgrade to a paid plan for unlimited access.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Total Activity</p>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">{stats.totalSessions}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sessions</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">
                        {Math.floor(stats.totalTime / 60)}m {stats.totalTime % 60}s
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Spent Learning</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Joined On</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <Button 
                  onClick={() => window.location.href = '/pricing'}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest h-12 rounded-xl"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
