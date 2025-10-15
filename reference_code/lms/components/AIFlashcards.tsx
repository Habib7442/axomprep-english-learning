"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { saveFlashcard, getChapterFlashcards } from "@/lib/actions/chapter.actions";

interface Flashcard {
  id?: string;
  front: string;
  back: string;
}

interface FlashcardsProps {
  subject: string;
  chapter: string;
  chapterId: string;
}

export const AIFlashcards = ({ subject, chapter, chapterId }: FlashcardsProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load saved flashcards when component mounts
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        const savedFlashcards = await getChapterFlashcards(chapterId);
        if (savedFlashcards.length > 0) {
          setFlashcards(savedFlashcards);
        }
      } catch (err) {
        console.error("Error loading flashcards:", err);
      }
    };

    loadFlashcards();
  }, [chapterId]);

  const handleGenerateFlashcards = async () => {
    setLoading(true);
    setError(null);
    setIsFlipped(false);
    
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateFlashcards",
          subject,
          chapter,
          count: 10,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }
      
      // Validate that we received flashcards
      if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
        throw new Error("No flashcards received from AI");
      }
      
      setFlashcards(data.result);
      setCurrentIndex(0);
      setSaved(false);
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
      console.error("Error generating flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFlashcards = async () => {
    try {
      // Save each flashcard to Supabase
      for (const card of flashcards) {
        await saveFlashcard({
          chapter_id: chapterId,
          front_text: card.front,
          back_text: card.back,
          subject,
          class: "9"
        });
      }
      setSaved(true);
      // Show success message for 3 seconds
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError("Failed to save flashcards. Please try again.");
      console.error("Error saving flashcards:", err);
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Generating flashcards...</p>
        <p className="text-gray-600 mt-2">Creating 10 high-quality flashcards for {chapter}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <Button 
          onClick={handleGenerateFlashcards}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-xl font-bold mb-4">Flashcards</h3>
        <p className="text-gray-600 mb-6">Generate 10 AI-powered flashcards to review key concepts from this chapter.</p>
        <Button 
          onClick={handleGenerateFlashcards}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Generate Flashcards
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Flashcards</h2>
            <p className="text-gray-600">Review key concepts with interactive flashcards</p>
          </div>
          <div className="flex gap-2">
            {!saved && (
              <Button 
                onClick={handleSaveFlashcards}
                variant="outline"
                className="text-sm"
              >
                Save Flashcards
              </Button>
            )}
            {saved && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Saved!
              </span>
            )}
            <Button 
              onClick={handleGenerateFlashcards}
              className="bg-blue-600 hover:bg-blue-700 text-sm"
            >
              Regenerate
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            {subject}
          </span>
        </div>

        <div 
          className="relative h-64 cursor-pointer mb-8"
          onClick={handleFlip}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg flex items-center justify-center p-8 transition-all duration-500 transform ${isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'}`}>
            <p className="text-white text-xl text-center font-medium">
              {flashcards[currentIndex].front}
            </p>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg flex items-center justify-center p-8 transition-all duration-500 transform ${isFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'}`}>
            <p className="text-white text-xl text-center font-medium">
              {flashcards[currentIndex].back}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={handlePrevious}
            variant="outline"
          >
            Previous
          </Button>
          <Button
            onClick={handleFlip}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isFlipped ? "Show Question" : "Show Answer"}
          </Button>
          <Button
            onClick={handleNext}
            variant="outline"
          >
            Next
          </Button>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};