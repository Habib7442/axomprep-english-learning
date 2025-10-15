"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Kumar",
    role: "Engineering Student",
    company: "Cotton University",
    content: "I was terrified of speaking English. After just 2 months with AxomPrep, I practiced every day with the AI tutor. Yesterday, I got placed at TCS with a ₹3.6 LPA package! The AI debate feature really helped me think quickly.",
    avatar: "/avatars/rahul.jpg",
    rating: 5
  },
  {
    name: "Priya Kalita",
    role: "Job Seeker",
    company: "Jorhat",
    content: "As a girl from a small town in Assam, I never thought I could work in Bangalore. My English was so weak. AxomPrep's voice practice made me confident. The best part? I could practice anytime without feeling judged. Today, I'm working at a startup in Bangalore earning ₹6 LPA!",
    avatar: "/avatars/priya.jpg",
    rating: 5
  },
  {
    name: "Amit Deka",
    role: "Working Professional",
    company: "Dibrugarh",
    content: "I used AxomPrep for 4 months before my civil services interview. The debate mode trained me to structure arguments quickly. I cleared APSC prelims and mains. Now preparing for the final interview with AxomPrep's Pro tier. This app is a game-changer for Assamese students.",
    avatar: "/avatars/amit.jpg",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-muted/10 dark:bg-muted/5">
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
              Success Stories
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who transformed their English skills and career prospects
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card rounded-xl p-6 border border-border/40 backdrop-blur-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 relative">
                <Quote className="absolute -top-2 -left-2 h-5 w-5 text-primary/20" />
                <span className="relative z-10">{testimonial.content}</span>
              </p>
              
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-md">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}