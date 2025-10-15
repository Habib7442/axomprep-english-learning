'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '@/lib/stores/authStore'
import { createClient } from '@/lib/supabase/client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Icons } from '../icons'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginDialog({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { setUser } = useAuthStore()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setError(null)
    
    try {
      const supabase = createClient()
      
      // Sign in the user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (authData.user) {
        setUser(authData.user)
        form.reset()
        setIsOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleLogin() {
    setIsLoading(true)
    setError(null)
    
    const { signInWithGoogle } = useAuthStore.getState()
    signInWithGoogle()
      .then((result) => {
        if (!result.success) {
          setError(result.error || 'Failed to sign in with Google')
          setIsLoading(false)
        }
        // Note: For Google login, the redirect is handled by the auth store
        // We don't need to close the dialog here as the page will redirect
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setIsLoading(false)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/60 dark:bg-black/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/10 to-[#FF914D]/10 dark:from-[#FF6B35]/20 dark:to-[#FF914D]/20 pointer-events-none"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
            Log in to your account
          </DialogTitle>
          <DialogDescription>
            Enter your credentials below to access your account
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="relative z-10 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#374151] dark:text-gray-200">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-white/30 dark:border-white/20 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#374151] dark:text-gray-200">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-white/30 dark:border-white/20 focus:border-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="border-white/30 dark:border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white/60 dark:bg-black/60 px-2 text-muted-foreground backdrop-blur-sm rounded-full">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-white/90 dark:hover:bg-black/90"
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}