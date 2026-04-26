'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { Button } from '@/components/ui/button'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { SignupDialog } from '@/components/auth/SignupDialog'
import Link from 'next/link'

export function Navigation() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      ) : (
        <>
          <LoginDialog>
            <Button variant="ghost" className="text-white hover:text-primary transition-colors">Login</Button>
          </LoginDialog>
          <SignupDialog>
            <Button className="bg-primary text-black hover:bg-accent font-bold px-6">Try Free</Button>
          </SignupDialog>
        </>
      )}
    </div>
  )
}