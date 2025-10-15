"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export function CallToActionSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#FF6B35]/10 to-[#FF914D]/10 dark:from-[#FF6B35]/5 dark:to-[#FF914D]/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
              Ready to Transform Your English?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of students who are already speaking English with confidence. Start your free trial today and see the difference in just 7 days.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088] shadow-lg h-12 px-8 text-base font-medium transition-all duration-300 hover:shadow-xl"
              asChild
            >
              <Link href="/signup">Start Free Trial</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 text-base font-medium backdrop-blur-md bg-white/60 dark:bg-input/30 border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              asChild
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}