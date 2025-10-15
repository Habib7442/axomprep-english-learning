"use client";

import { motion } from "framer-motion";
import { Mic, MessageCircle, Trophy, Brain, Users, Zap } from "lucide-react";

const features = [
  {
    icon: <Mic className="h-8 w-8" />,
    title: "AI Voice Conversations",
    description: "Practice speaking with our AI tutor anytime. Get real-time feedback on pronunciation, grammar, and fluency to boost your confidence."
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "Debate Challenges",
    description: "Sharpen your argumentation skills with AI debate opponents. Perfect for interview preparation and critical thinking development."
  },
  {
    icon: <Trophy className="h-8 w-8" />,
    title: "Gamified Learning",
    description: "Stay motivated with streaks, achievements, and leaderboards. Make learning English a fun daily habit with our engaging system."
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Personalized Feedback",
    description: "Receive detailed analytics on your progress. Get personalized recommendations to focus on areas that need improvement."
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Community Learning",
    description: "Connect with other learners, participate in group challenges, and share your progress in a supportive community environment."
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "90-Day Curriculum",
    description: "Follow our structured learning path designed by language experts. See measurable improvement in just 90 days of consistent practice."
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/10 dark:bg-muted/5">
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
              Powerful Features
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to master English conversation and build unshakeable confidence
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
              className="bg-card rounded-xl p-6 border border-border/40 backdrop-blur-md hover:shadow-lg transition-all duration-300"
            >
              <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] w-14 h-14 rounded-lg flex items-center justify-center text-white mb-5 shadow-md">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}