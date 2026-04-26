import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing and using integratepdf, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">2. Use of Service</h2>
            <p>
              You agree to use our service only for lawful purposes. You are responsible for all content uploaded to your account and for all activities that occur under your account.
            </p>
            <p className="mt-2">
              Our service allows you to upload PDF documents and interact with them using AI. You retain all ownership rights to your documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">3. Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">4. Intellectual Property</h2>
            <p>
              The Service and its original content, features and functionality are and will remain the exclusive property of integratepdf and its licensors. Our branding, logos, and software are protected by copyright and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">5. Limitation of Liability</h2>
            <p>
              In no event shall integratepdf, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">7. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">8. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2 text-primary font-medium">legal@integratepdf.com</p>
          </section>
          
          <p className="text-sm pt-8">Last updated: April 25, 2026</p>
        </div>
      </div>
    </div>
  );
}
