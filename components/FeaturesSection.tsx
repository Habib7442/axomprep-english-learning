"use client";

import { motion } from "framer-motion";
import { GraduationCap, Zap, Sword, FileText, Mic2, BarChart3 } from "lucide-react";

const features = [
  {
    icon: <GraduationCap className="h-8 w-8" />,
    title: "🎓 Tutor Mode",
    description: "Ask anything from your PDF. Get clear, conversational explanations that make even the toughest concepts easy to understand.",
    highlight: false
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "⚡ Exam Panic Mode",
    description: "Exam in 2 hours? Get rapid-fire questions, timed drills, and instant feedback to lock in knowledge in record time.",
    highlight: false
  },
  {
    icon: <Sword className="h-8 w-8" />,
    title: "🥊 Debate Mode",
    description: "The AI argues against your notes. You defend them. This active recall technique is the most powerful way to truly master a subject.",
    highlight: true
  },
  {
    icon: <FileText className="h-8 w-8" />,
    title: "Intelligent Parsing",
    description: "We don't just extract text. Our AI understands charts, tables, and context to give you the most accurate study experience.",
    highlight: false
  },
  {
    icon: <Mic2 className="h-8 w-8" />,
    title: "Natural Voice AI",
    description: "Experience ultra-low latency, human-like voice interactions. Studying feels like a natural conversation with a real person.",
    highlight: false
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Mastery Analytics",
    description: "Track exactly which parts of your PDF you've mastered and where you need more practice. Study with surgical precision.",
    highlight: false,
    isComingSoon: true
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            <span className="text-white">Designed for</span>{" "}
            <span className="text-primary">
              High-Performance Students
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Every feature is engineered to move you from "reading" to "mastering" in half the time.
          </p>
        </motion.div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`group relative rounded-2xl p-8 border transition-all duration-500 ${
                feature.highlight 
                ? "bg-card border-primary/50 shadow-[0_0_30px_rgba(0,181,181,0.15)]" 
                : "bg-card/50 border-white/5 hover:border-primary/30"
              }`}
            >
              {feature.highlight && (
                <div className="absolute -top-3 left-8 bg-primary text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              {feature.isComingSoon && (
                <div className="absolute -top-3 left-8 bg-white/10 text-white border border-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Coming Soon
                </div>
              )}
              
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-8 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                feature.highlight ? "bg-primary text-black" : "bg-primary/10 text-primary"
              }`}>
                {feature.icon}
              </div>
              
              <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}