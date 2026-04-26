import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { TestimonialForm } from "@/components/TestimonialForm";
import { Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Write a Review | IntegratePDF",
  description: "Share your experience with IntegratePDF and help us improve.",
};

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold">Back to Home</span>
          </Link>

          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/20 text-xs font-black uppercase tracking-widest mb-6">
              <Star className="h-3 w-3 fill-current" />
              Your voice matters
            </div>
            <h1 className="text-5xl font-black text-white mb-6 tracking-tight">
              Tell us what <span className="text-primary italic">you think</span>
            </h1>
            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
              Whether you're a student, researcher, or curious mind, your feedback helps us build the future of document interaction.
            </p>
          </div>

          <TestimonialForm />
        </div>
      </main>

      <Footer />

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px]" />
      </div>
    </div>
  );
}
