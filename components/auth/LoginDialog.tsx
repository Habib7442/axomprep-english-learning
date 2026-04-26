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
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
        <DialogHeader className="relative z-10 text-center mb-6">
          <DialogTitle className="text-3xl font-black text-foreground tracking-tight">
            Welcome <span className="text-primary italic">Back</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Continue your study session with IntegratePDF
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="relative z-10 bg-red-500/10 border-red-500/20 text-red-500 backdrop-blur-sm">
            <AlertTitle className="font-bold">Error</AlertTitle>
            <AlertDescription className="font-medium">{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground/70">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      className="bg-white/5 border-white/10 focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50"
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
                  <FormLabel className="text-foreground/70">Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      className="bg-white/5 border-white/10 focus:border-primary focus:ring-primary text-foreground"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary text-black hover:bg-accent font-black h-12 rounded-xl transition-all shadow-[0_0_15px_rgba(0,181,181,0.2)]"
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
                <span className="bg-background/80 px-4 text-muted-foreground backdrop-blur-sm rounded-full">
                  Or use Google
                </span>
              </div>
            </div>
            
            <div className="relative z-10">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={handleGoogleLogin}
                className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold h-12 rounded-xl transition-all"
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.google className="mr-2 h-4 w-4" />
                )}
                Continue with Google
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}