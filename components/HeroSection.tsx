"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/stores/authStore";
import { SignupDialog } from "./auth/SignupDialog";

export function HeroSection() {
  const { user } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03]" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-16 md:py-24 lg:py-32 md:-mt-10">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8"
          >
            <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            Voice-First AI Study Platform
          </motion.div>
 
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]"
          >
            <span className="text-white">Stop Reading Your PDFs.</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Start Talking to Them.
            </span>
          </motion.h1>
 
          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed"
          >
            Upload any PDF and have a real-time voice conversation with your notes. 
            Ask questions, get quizzed, or debate topics to master your subjects 2x faster.
          </motion.p>
 
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-5 justify-center w-full max-w-lg mb-6"
          >
            {user ? (
              <Button 
                size="lg" 
                className="bg-primary text-black hover:bg-accent shadow-[0_0_20px_rgba(0,181,181,0.3)] h-14 px-10 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
                asChild
              >
                <Link href="/dashboard">Talk to Your PDF — It's Free</Link>
              </Button>
            ) : (
              <SignupDialog>
                <Button 
                  size="lg" 
                  className="bg-primary text-black hover:bg-accent shadow-[0_0_20px_rgba(0,181,181,0.3)] h-14 px-10 text-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
                >
                  Talk to Your PDF — It's Free
                </Button>
              </SignupDialog>
            )}
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-muted-foreground/60 mb-16"
          >
            No credit card. No app download. Works in your browser.
          </motion.p>
 
          {/* Looping Demo Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-4xl rounded-2xl border border-primary/20 bg-card/50 aspect-video flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 group-hover:to-primary/10 transition-colors" />
            <div className="flex flex-col items-center gap-4 text-primary/40 group-hover:text-primary/60 transition-colors">
              <div className="flex gap-1 items-end h-12">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [10, 40, 10] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1 + Math.random(),
                      delay: Math.random() 
                    }}
                    className="w-1.5 bg-current rounded-full"
                  />
                ))}
              </div>
              <p className="font-medium tracking-widest text-xs uppercase">Voice Interface Active</p>
            </div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}