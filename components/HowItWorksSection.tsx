"use client";

import { motion } from "framer-motion";
import { Play, MessageSquare, Target, Award } from "lucide-react";

const steps = [
  {
    icon: <Play className="h-8 w-8" />,
    title: "Sign Up & Assess",
    description: "Create your account and take our quick assessment to determine your current English level."
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Practice Daily",
    description: "Engage in AI conversations and debate challenges tailored to your skill level."
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Get Feedback",
    description: "Receive detailed analysis of your pronunciation, grammar, and fluency with actionable insights."
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: "Track Progress",
    description: "Monitor your improvement through our dashboard and celebrate milestones with achievements."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/10 dark:bg-muted/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master English in just 4 simple steps with our proven methodology
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-20 bottom-20 w-0.5 bg-gradient-to-b from-[#FF6B35] to-[#FF914D] transform -translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`relative ${index % 2 === 0 ? 'lg:text-right' : 'lg:text-left'} lg:px-8`}
              >
                {/* Step number */}
                <div className="absolute top-0 lg:top-1/2 lg:-translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FF914D] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className={`pl-16 lg:pl-0 ${index % 2 === 0 ? 'lg:pr-16 lg:pl-0' : 'lg:pl-16'}`}>
                  <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] w-14 h-14 rounded-lg flex items-center justify-center text-white mb-4 lg:mx-auto shadow-md">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}