"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { SignupDialog } from "./auth/SignupDialog";

export function CallToActionSection() {
  const { user } = useAuthStore();

  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-primary/20" />
      
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-8 text-white leading-tight">
            Stop <span className="text-primary italic">Reading.</span><br />
            Start <span className="text-primary">Talking.</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Join students who are mastering their PDFs in record time. Upload your first document for free and feel the difference today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            {user ? (
              <Button 
                size="lg" 
                className="bg-primary text-black hover:bg-accent shadow-[0_0_20px_rgba(0,181,181,0.3)] h-16 px-10 text-lg font-black transition-all duration-300 rounded-2xl group"
                asChild
              >
                <Link href="/dashboard" className="flex items-center gap-2">
                  Start Talking Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <SignupDialog>
                <Button 
                  size="lg" 
                  className="bg-primary text-black hover:bg-accent shadow-[0_0_20px_rgba(0,181,181,0.3)] h-16 px-10 text-lg font-black transition-all duration-300 rounded-2xl group"
                >
                  <span className="flex items-center gap-2">
                    Start Talking Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </SignupDialog>
            )}
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 px-10 text-lg font-bold border-white/10 hover:bg-white/5 text-white transition-all duration-300 rounded-2xl"
              asChild
            >
              <Link href="#pricing">View Pricing</Link>
            </Button>
          </div>
          
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-muted-foreground/60 font-bold tracking-widest text-xs uppercase text-center">
            <span>No Credit Card</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <span>Instant Access</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
            <span>Cancel Anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}