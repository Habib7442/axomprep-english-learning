"use client";

import { motion } from "framer-motion";
import { CheckCircle, Crown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/authStore";
import { SignupDialog } from "@/components/auth/SignupDialog";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Perfect for testing the waters",
    features: [
      "3 PDFs total",
      "5 min voice time/day",
      "Tutor Mode only",
      "Basic progress tracking"
    ],
    cta: "Start Studying Free",
    popular: false
  },
  {
    name: "Student",
    price: "₹199",
    period: "per month",
    description: "Most popular for exam prep",
    features: [
      "20 PDFs total",
      "30 min voice time/day",
      "All 3 Modes (Tutor + Panic + Debate)",
      "High-quality AI voices",
      "Detailed mastery analytics"
    ],
    cta: "Upgrade to Student",
    popular: true
  },
  {
    name: "Pro",
    price: "₹499",
    period: "per month",
    description: "For serious researchers",
    features: [
      "Unlimited PDFs",
      "Unlimited voice time",
      "AI summary exports",
      "Early access to new features",
      "Priority support"
    ],
    cta: "Go Pro",
    popular: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            <span className="text-white">Simple, Student-First</span>{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No complicated tiers. Just pure learning.
          </p>
        </motion.div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`relative rounded-3xl p-10 transition-all duration-500 ${
                plan.popular 
                  ? "bg-card border-2 border-primary shadow-[0_0_40px_rgba(0,181,181,0.2)] scale-105 z-10" 
                  : "bg-card/50 border border-white/5"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Best Value
                </div>
              )}
              
              <div className="text-center mb-10">
                <h3 className="text-xl font-bold mb-4 text-white">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground font-medium">{plan.description}</p>
              </div>
              
              <ul className="space-y-5 mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <PlanCTA plan={plan} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-4 text-center"
        >
          <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Info className="h-4 w-4" />
            <p className="text-sm font-bold tracking-tight uppercase">Mission Statement</p>
          </div>
          <p className="text-muted-foreground text-lg italic max-w-2xl">
            "Students in Tier 2 cities deserve the best AI tools too. We've priced IntegratePDF to be accessible for every learner across India."
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function PlanCTA({ plan }: { plan: any }) {
  const { user } = useAuthStore();

  const button = (
    <Button
      className={`w-full h-14 text-lg font-bold rounded-2xl transition-all duration-300 ${
        plan.popular
          ? "bg-primary text-black hover:bg-accent shadow-[0_0_20px_rgba(0,181,181,0.2)]"
          : "bg-white/5 border border-white/10 hover:bg-white/10 text-white"
      }`}
      variant={plan.popular ? "default" : "outline"}
    >
      {plan.cta}
    </Button>
  );

  if (user) {
    return (
      <Link href="/dashboard">
        {button}
      </Link>
    );
  }

  return (
    <SignupDialog>
      {button}
    </SignupDialog>
  );
}