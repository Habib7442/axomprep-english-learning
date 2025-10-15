"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "5 AI conversations per week",
      "1 debate challenge per week",
      "Basic progress tracking",
      "First 10 lessons",
      "Community leaderboard"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Premium",
    price: "₹399",
    period: "per month",
    description: "Most popular plan",
    features: [
      "Unlimited AI conversations",
      "Unlimited debate challenges",
      "Full 90-day curriculum",
      "Advanced pronunciation training",
      "Detailed feedback reports",
      "Ad-free experience",
      "All AI personality modes"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Pro",
    price: "₹699",
    period: "per month",
    description: "For serious learners",
    features: [
      "Everything in Premium",
      "Priority support",
      "Exclusive debate tournaments",
      "Early access to new features",
      "Personalized learning roadmap",
      "Downloadable progress reports"
    ],
    cta: "Start Free Trial",
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-20">
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
              Simple Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that works best for you. All plans include our core features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-2xl border border-border/40 backdrop-blur-md p-8 transition-all duration-300 ${
                plan.popular 
                  ? "bg-card border-primary ring-2 ring-primary/20 scale-105 z-10 shadow-lg" 
                  : "bg-card hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white text-sm font-medium px-4 py-1 rounded-full flex items-center shadow-md">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className={`w-full h-12 text-base font-medium transition-all duration-300 ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white hover:from-[#FF844B] hover:to-[#FFB088] shadow-lg hover:shadow-xl"
                    : "border border-input hover:bg-accent hover:text-accent-foreground"
                }`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}