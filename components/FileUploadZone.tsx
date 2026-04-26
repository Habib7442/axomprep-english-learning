'use client'

import React, { useRef, useState } from 'react'
import { FileUp, Book, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void
  isUploading: boolean
  uploadProgress: number
  loadingMessage: string
  maxSize: number
  disabled?: boolean
}

export function FileUploadZone({
  onFileSelect,
  isUploading,
  uploadProgress,
  loadingMessage,
  maxSize,
  disabled
}: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (disabled || isUploading) return
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled || isUploading) return

    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileSelect(file)
    } else {
      alert('Please upload a valid PDF file')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || isUploading) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center py-16 px-6 rounded-3xl border-2 border-dashed transition-all duration-300",
        isDragOver 
          ? "border-primary bg-primary/5 scale-[1.02]" 
          : "border-white/5 bg-card/20 hover:border-white/20 hover:bg-card/30",
        (disabled || isUploading) && "opacity-50 cursor-not-allowed pointer-events-none"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled || isUploading ? -1 : 0}
      aria-label="Upload PDF File"
      aria-disabled={disabled || isUploading}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFileSelect(file)
        }}
        accept=".pdf"
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-6" role="status" aria-live="polite" aria-busy="true">
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - uploadProgress / 100)}
                className="text-primary transition-all duration-500 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white">{uploadProgress}%</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-widest animate-pulse">
              {loadingMessage || 'Processing...'}
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black opacity-50">
              Please do not refresh the page
            </p>
            <span className="sr-only">Upload in progress: {uploadProgress}% - {loadingMessage || 'Processing...'}</span>
          </div>
        </div>
      ) : (
        <>
          <div className={cn(
            "w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 transition-transform duration-500",
            isDragOver ? "scale-110 rotate-12 bg-primary/20" : "group-hover:scale-110"
          )}>
            {isDragOver ? <FileUp className="h-10 w-10 text-primary" /> : <Book className="h-10 w-10 text-primary/50" />}
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white text-center">
            {isDragOver ? "Drop to Study!" : "Your library is empty"}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
            Drag and drop your PDF textbook, research paper, or class notes here to start talking to them.
          </p>
          <Button 
            variant="outline"
            className="h-14 px-10 rounded-2xl border-primary/30 text-primary hover:bg-primary hover:text-black transition-all font-bold group pointer-events-none"
          >
            <FileUp className="mr-2 h-5 w-5 group-hover:animate-bounce" />
            Select PDF File
          </Button>
          <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
            Max File Size: {maxSize / (1024 * 1024)}MB
          </p>
        </>
      )}
    </div>
  )
}
