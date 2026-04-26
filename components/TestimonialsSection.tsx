"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Kumar",
    role: "UPSC Aspirant",
    company: "Delhi",
    content: "I was drowning in Laxmikanth. Debate Mode forced me to defend my notes against the AI. I cleared my Prelims! It's like having a 24/7 study partner who knows every page of my textbook.",
    rating: 5
  },
  {
    name: "Sneha Das",
    role: "Medical Student",
    company: "Kolkata",
    content: "Exam Panic Mode is a life-saver. I upload my 50-page histology notes 2 hours before the viva, and the AI drills me until I know every cell. Simply incredible for high-pressure situations.",
    rating: 5
  },
  {
    name: "Amit Sharma",
    role: "B.Tech Student",
    company: "Bengaluru",
    content: "I used to hate reading dry technical papers. Now I just 'talk' to them in Tutor Mode. Concepts that took 3 hours to read now take 30 mins to 'discuss' and master.",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 bg-muted/5 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white">
            Trusted by <span className="text-primary tracking-tight">thousands</span> of students
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From UPSC aspirants to Medical students, IntegratePDF is changing how India studies.
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
              whileHover={{ y: -10 }}
              className="group bg-card/50 rounded-3xl p-8 border border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Quote className="h-16 w-16 text-primary" />
              </div>
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-medium">
                "{testimonial.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(0,181,181,0.2)]">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground font-medium">
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