import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.integratepdf.com'),
  title: {
    default: "IntegratePDF | Talk to your PDFs with Voice AI",
    template: "%s | IntegratePDF"
  },
  description: "The world's first voice-first AI study platform. Don't just read your PDFs—talk to them. Master complex topics with Tutor, Panic, and Debate modes.",
  keywords: ["AI Study Tool", "Talk to PDF", "Voice AI", "Interactive Learning", "PDF Tutor", "Student Productivity", "Exam Preparation"],
  authors: [{ name: "IntegratePDF Team" }],
  creator: "IntegratePDF",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.integratepdf.com',
    title: 'IntegratePDF - The Voice-First AI Study Platform',
    description: "Experience the future of studying. Upload any PDF and start a voice conversation with your documents.",
    siteName: 'IntegratePDF',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'IntegratePDF - Talk to your PDFs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IntegratePDF - Talk to your PDFs',
    description: "Don't just read your PDFs—talk to them. Voice-first AI study platform for the modern student.",
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}