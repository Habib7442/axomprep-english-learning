"use client"

import * as React from "react"
import { 
  BookOpenIcon, 
  MicIcon, 
  UserIcon, 
  SettingsIcon,
  BarChartIcon,
  HomeIcon,
  LogOutIcon
} from "lucide-react"
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Menu items for the sidebar
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Practice Interview",
    url: "/practice-interview",
    icon: MicIcon,
  },
  {
    title: "Daily Conversation",
    url: "/practice-conversation",
    icon: UserIcon,
  },
  {
    title: "Progress",
    url: "/progress",
    icon: BarChartIcon,
  },
]

const userItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: UserIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: SettingsIcon,
  },
]

export function DashboardSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()

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

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] p-2 rounded-lg">
                <MicIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">AxomPrep</h2>
                <p className="text-xs text-muted-foreground">English Practice</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Learning</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <SidebarGroup>
              <SidebarGroupLabel>Account</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {userItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOutIcon />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            <div className="p-4 text-xs text-muted-foreground">
              <p>Welcome, {user?.email?.split('@')[0] || 'User'}</p>
              <p className="mt-1">Ready to practice English?</p>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <main className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}