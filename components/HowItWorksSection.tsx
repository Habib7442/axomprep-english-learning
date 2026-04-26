"use client";

import { motion } from "framer-motion";
import { FileUp, ListChecks, Mic2 } from "lucide-react";

const steps = [
  {
    icon: <FileUp className="h-8 w-8" />,
    title: "Upload your PDF",
    description: "Any textbook, research paper, or class notes. We support documents up to 100 pages long."
  },
  {
    icon: <ListChecks className="h-8 w-8" />,
    title: "Choose your mode",
    description: "Select between Tutor, Exam Panic, or Debate mode depending on your study goals for the day."
  },
  {
    icon: <Mic2 className="h-8 w-8" />,
    title: "Start talking",
    description: "Ask questions, get quizzed, and master your subjects. No more passive reading — start engaging."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 bg-muted/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            <span className="text-white">Three Steps to</span>{" "}
            <span className="text-primary">
              Mastery
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            It's faster than making flashcards and 10x more effective than reading.
          </p>
        </motion.div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Horizontal connecting line for desktop */}
          <div className="hidden md:block absolute top-[68px] left-[20%] right-[20%] h-0.5 bg-primary/20" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number and icon */}
              <div className="relative mb-8">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black font-black text-xl z-10 relative shadow-[0_0_20px_rgba(0,181,181,0.3)] transition-transform duration-500 group-hover:scale-110">
                  {index + 1}
                </div>
                <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-8 rounded-2xl bg-card border border-white/5 group-hover:border-primary/30 transition-all duration-500 w-full">
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-6 mx-auto group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}