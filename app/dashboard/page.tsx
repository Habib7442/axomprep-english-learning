'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/authStore'
import { Icons } from '@/components/icons'
import { DashboardSidebar } from '@/components/DashboardSidebar'
import { Button } from '@/components/ui/button'
import { FileUp, Book, Loader2, Play, Trash2, Clock, FileText } from 'lucide-react'
import { parsePDFFile } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { createBook, deleteBookAction, fetchBooksAction } from '@/lib/actions/book.actions'
import { MAX_FILE_SIZE, TIER_LIMITS } from '@/lib/constants'
import { FileUploadZone } from '@/components/FileUploadZone'

interface PDFBook {
  id: string;
  title: string;
  file_url: string;
  cover_url?: string;
  page_count?: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuthStore()
  const [books, setBooks] = useState<PDFBook[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [isLoadingBooks, setIsLoadingBooks] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchBooks()
    }
  }, [user])

  const fetchBooks = async () => {
    try {
      const result = await fetchBooksAction()
      if (result.success) {
        setBooks(result.data || [])
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setIsLoadingBooks(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
      return
    }

    const tier = (profile?.subscription_tier as keyof typeof TIER_LIMITS) || 'free'
    const limits = TIER_LIMITS[tier]

    if (books.length >= limits.maxPDFs) {
      alert(`You've reached the limit of ${limits.maxPDFs} PDFs for the ${tier} plan. Please upgrade to upload more.`)
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(10)

      // 1. Parse PDF for text and cover
      setLoadingMessage("Analyzing PDF structure...")
      const { content, cover } = await parsePDFFile(
        file, 
        (msg) => setLoadingMessage(msg),
        limits.maxOCR
      )
      setUploadProgress(30)

      // 2. Upload PDF to Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      setLoadingMessage("Finalizing upload...")
      setUploadProgress(50)

      // 3. Upload Cover to Storage (if exists)
      let coverUrl = ''
      if (cover) {
        const coverBlob = await (await fetch(cover)).blob()
        const coverName = `${user.id}/${Date.now()}-cover.png`
        const { data: coverData, error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverName, coverBlob)
        
        if (!coverError) {
          const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverName)
          coverUrl = publicUrl
        }
      }
      setUploadProgress(70)

      const { data: { publicUrl: fileUrl } } = supabase.storage.from('pdfs').getPublicUrl(fileName)
      setUploadProgress(80)

      // 4. Save Book and Segments to Database via Server Action
      const result = await createBook({
        title: file.name.replace('.pdf', ''),
        file_url: fileUrl,
        cover_url: coverUrl,
        page_count: content.length > 0 ? Math.ceil(content.reduce((acc, s) => acc + s.wordCount, 0) / 300) : 0,
        segments: content
      })

      if (!result.success) throw new Error(result.error)
      
      setUploadProgress(100)
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
        setLoadingMessage("")
        fetchBooks()
      }, 500)

    } catch (error) {
      console.error('Error uploading PDF:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload PDF. Please try again.')
      setIsUploading(false)
      setUploadProgress(0)
      setLoadingMessage("")
    }
  }

  const deleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PDF? All session history will be lost.')) return

    try {
      const result = await deleteBookAction(id)
      if (result.success) {
        setBooks(books.filter(b => b.id !== id))
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book')
    }
  }

  if (authLoading) {
    return (
      <DashboardSidebar>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-muted-foreground">Initializing...</p>
          </div>
        </div>
      </DashboardSidebar>
    )
  }

  if (!user) return null

  return (
    <DashboardSidebar>
      <div className="min-h-screen bg-background text-foreground pb-20">
        <header className="container mx-auto px-6 pt-16 pb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-white tracking-tight leading-none">
              My <span className="text-primary">Library</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto">
              Upload your PDFs and start talking to them. Your study material is now your conversation partner.
            </p>
            
            {books.length > 0 && !isUploading && (
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-black hover:bg-accent font-black h-14 px-8 rounded-2xl shadow-[0_0_20px_rgba(0,181,181,0.2)] transition-all duration-300 active:scale-95 text-base"
              >
                <div className="flex items-center gap-3">
                  <FileUp className="h-5 w-5" />
                  <span>Upload New PDF</span>
                </div>
              </Button>
            )}

            {isUploading && books.length > 0 && (
              <div className="flex flex-col items-center gap-2" role="status" aria-live="polite" aria-busy="true">
                <div className="flex items-center gap-3 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-black text-lg">{uploadProgress}%</span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                  {loadingMessage || 'Processing...'}
                </span>
                <span className="sr-only">Upload in progress: {uploadProgress}% - {loadingMessage || 'Processing...'}</span>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".pdf" 
              className="hidden" 
            />
          </motion.div>
        </header>

        <main className="container mx-auto px-6">
          {isLoadingBooks ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-card/50 border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : books.length === 0 ? (
            <FileUploadZone 
              onFileSelect={(file) => handleFileUpload({ target: { files: [file] } } as any)}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              loadingMessage={loadingMessage}
              maxSize={MAX_FILE_SIZE}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence>
                {books.map((book) => (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-card/50 border border-white/5 rounded-3xl overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl"
                  >
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {book.cover_url ? (
                        <img 
                          src={book.cover_url} 
                          alt={book.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                          <FileText className="h-20 w-20 text-primary/20" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                        <Button 
                          onClick={() => router.push(`/chat/${book.id}`)}
                          className="bg-primary text-black hover:bg-accent font-black rounded-full h-16 w-16 shadow-[0_0_20px_rgba(0,181,181,0.5)] transition-transform duration-300 hover:scale-110"
                        >
                          <Play className="h-6 w-6 fill-current" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-b from-card to-background/80">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                          {book.title}
                        </h3>
                        <button 
                          onClick={() => deleteBook(book.id)}
                          className="p-2 -mr-2 text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-3 w-3 text-primary" />
                          <span>{new Date(book.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/10 text-[10px] font-black uppercase tracking-wider text-primary">
                          <FileText className="h-3 w-3" />
                          <span>{book.page_count || 0} Pages</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </DashboardSidebar>
  )
}
