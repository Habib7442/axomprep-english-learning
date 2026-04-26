import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
        
        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">1. Introduction</h2>
            <p>
              Welcome to integratepdf ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">2. Data We Collect</h2>
            <p>
              We may collect, use, store and transfer different kinds of personal data about you, including:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Identity Data:</strong> First name, last name, and username.</li>
              <li><strong>Contact Data:</strong> Email address.</li>
              <li><strong>Technical Data:</strong> IP address, browser type and version, time zone setting and location.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
              <li><strong>PDF Data:</strong> Content of the documents you upload for analysis. This data is processed only to fulfill your specific requests. <strong>We do not use your PDF data to train AI models.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">3. How We Use Your Data</h2>
            <p>
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To provide the voice-first AI study platform services.</li>
              <li>To manage your account.</li>
              <li>To improve our website, products/services, marketing, and customer relationships.</li>
              <li>To comply with a legal or regulatory obligation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">4. Legal Basis for Processing (GDPR)</h2>
            <p>
              If you are from the European Economic Area (EEA), our legal basis for collecting and using the personal information described above depends on the personal information we collect and the specific context in which we collect it. We process your data:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>To perform a contract with you.</li>
              <li>Where you have given us permission to do so.</li>
              <li>Where the processing is in our legitimate interests and not overridden by your rights.</li>
              <li>To comply with the law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">5. Your Data Protection Rights (GDPR)</h2>
            <p>
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>The right to access:</strong> You can request copies of your personal data.</li>
              <li><strong>The right to rectification:</strong> You can request that we correct any information you believe is inaccurate.</li>
              <li><strong>The right to erasure:</strong> You can request that we erase your personal data, under certain conditions.</li>
              <li><strong>The right to restrict processing:</strong> You can request that we restrict the processing of your personal data.</li>
              <li><strong>The right to data portability:</strong> You can request that we transfer the data that we have collected to another organization.</li>
              <li><strong>The right to withdraw consent:</strong> You can withdraw your consent at any time where we relied on your consent to process your data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">6. California Privacy Rights (CCPA)</h2>
            <p>
              Under the CCPA, California residents have the right to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>Request that a business discloses the categories and specific pieces of personal data collected.</li>
              <li>Request that a business deletes any personal data about the consumer that a business has collected.</li>
              <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data. <strong>We do not sell your personal data.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">7. Data Retention and Deletion</h2>
            <p>
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
            </p>
            <div className="mt-4 space-y-4">
              <p>
                <strong>Uploaded PDFs:</strong> Uploaded documents are retained in your personal library for as long as your account remains active, or until you choose to delete them. You can delete any uploaded PDF at any time via your dashboard, which will permanently remove the document and its associated analysis from our active storage.
              </p>
              <p>
                <strong>Account Data:</strong> If you choose to delete your account, all associated personal data, including identity data, contact data, and all uploaded PDFs, will be permanently deleted from our servers within 30 days, except where we are required by law to retain certain information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">8. International Transfers</h2>
            <p>
              Your information, including personal data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">9. Children's Privacy</h2>
            <p>
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">10. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use Supabase for secure authentication and database management.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">11. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Cookie Categories</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Essential Cookies:</strong> Necessary for the website to function. We use Supabase cookies for authentication and session management. These cannot be switched off.</li>
                  <li><strong>Functional Cookies:</strong> Used to remember choices you make (such as your study mode preferences) to provide a more personal experience.</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with the website by collecting and reporting information anonymously.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Third-Party Cookies</h3>
                <p>
                  Some of our partners may use cookies on our site. Specifically:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-2">
                  <li><strong>Supabase:</strong> For user authentication and data persistence.</li>
                  <li><strong>Vapi:</strong> For maintaining voice session state and quality of service.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">How to Control Cookies</h3>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service. For more information on how to manage and delete cookies, visit <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">allaboutcookies.org</a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">12. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-white">13. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <p className="mt-2 text-primary font-medium">support@integratepdf.com</p>
          </section>
          
          <p className="text-sm pt-8">Last updated: April 25, 2026</p>
        </div>
      </div>
    </div>
  );
}
