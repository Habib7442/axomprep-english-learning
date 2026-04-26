'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export function TestimonialForm() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedContent = content.trim()

    if (!trimmedName || !trimmedContent) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      setIsSubmitting(true)
      const { error } = await supabase
        .from('testimonials')
        .insert([
          { name: trimmedName, rating, content: trimmedContent, is_published: false }
        ])

      if (error) throw error

      setSubmitted(true)
      toast.success('Thank you for your review! It will be visible after moderation.')
    } catch (error: any) {
      console.error('Error submitting testimonial:', error)
      toast.error(error.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/30 backdrop-blur-md border border-white/5 p-12 rounded-[2.5rem] text-center"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
          <Star className="h-10 w-10 fill-current" />
        </div>
        <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">Review Received!</h3>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Thank you for sharing your experience. Your review will be published shortly after a quick check.
        </p>
        <Button 
          variant="outline" 
          onClick={() => {
            setSubmitted(false)
            setName('')
            setContent('')
            setRating(5)
          }}
          className="border-white/10 text-foreground hover:bg-white/5 rounded-xl px-8 h-12"
        >
          Submit Another
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="bg-card/30 backdrop-blur-md border border-white/5 p-6 sm:p-10 rounded-[2rem] relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
      
      <div className="relative">
        <h3 className="text-2xl font-black text-foreground mb-2 tracking-tight">Share Your Experience</h3>
        <p className="text-sm text-muted-foreground mb-8 font-medium">Your feedback helps us make IntegratePDF better for everyone.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Your Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={rating === star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-all duration-300 transform hover:scale-125"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || rating) 
                        ? 'text-primary fill-current' 
                        : 'text-foreground/10 fill-none'
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="testimonial-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Your Name</label>
            <input 
              id="testimonial-name"
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How should we call you?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 font-medium"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="testimonial-content" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70">Your Review</label>
            <textarea 
              id="testimonial-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you love most about talking to your PDFs?"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 font-medium resize-none"
              required
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-primary text-black hover:bg-accent font-black h-16 rounded-2xl shadow-[0_0_30px_rgba(0,181,181,0.2)] transition-all duration-300 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5" />
                <span>Submit Review</span>
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
