"use client"

import * as React from "react"
import { 
  BookOpenIcon, 
  SettingsIcon,
  HomeIcon,
  LogOutIcon,
  PlusCircleIcon,
  CreditCardIcon,
  HistoryIcon
} from "lucide-react"
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from "@/components/Logo"
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
const libraryItems = [
  {
    title: "My Library",
    url: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "Session History",
    url: "/dashboard/history",
    icon: HistoryIcon,
  },
]

const accountItems = [
  {
    title: "Pricing & Plans",
    url: "/pricing",
    icon: CreditCardIcon,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
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
      useAuthStore.getState().setUser(null)
      router.push('/')
    }
  }

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <Logo showTagline={false} />
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Your Library</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {libraryItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
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
                  {accountItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
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
            
            <div className="p-4 text-xs text-muted-foreground border-t border-input/10">
              <p className="font-medium text-foreground">{user?.email?.split('@')[0] || 'Student'}</p>
              <p className="mt-1 opacity-70">Ready to talk to a PDF?</p>
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