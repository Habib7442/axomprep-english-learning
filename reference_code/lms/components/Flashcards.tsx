"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getChapterFlashcards } from "@/lib/actions/chapter.actions";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
}

interface FlashcardsProps {
  chapterId: string;
  chapterName: string;
}

export const Flashcards = ({ chapterId, chapterName }: FlashcardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const data = await getChapterFlashcards(chapterId);
        
        // Transform data to match our component's interface
        const transformedData = data.map((card: { id: string; front_text: string; back_text: string; subject: string }) => ({
          id: card.id,
          front: card.front_text,
          back: card.back_text,
          subject: card.subject
        }));
        
        setFlashcards(transformedData);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        
        // Fallback to better quality mock data
        setFlashcards([
          {
            id: "1",
            front: `${chapterName} - Key Concept 1`,
            back: `This is an important concept from the ${chapterName} chapter. Review your textbook for detailed information.`,
            subject: "Subject"
          },
          {
            id: "2",
            front: `${chapterName} - Key Concept 2`,
            back: `Another important concept from the ${chapterName} chapter. Make sure to understand this thoroughly.`,
            subject: "Subject"
          },
          {
            id: "3",
            front: `${chapterName} - Key Concept 3`,
            back: `A fundamental concept from the ${chapterName} chapter. Practice related problems to reinforce your understanding.`,
            subject: "Subject"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlashcards();
  }, [chapterId, chapterName]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p>Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">No Flashcards Available</h3>
          <p className="text-gray-600 mb-6">No flashcards have been created for this chapter yet.</p>
          <p className="text-gray-600">Try generating AI-powered flashcards or check back later.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{chapterName} - Flashcards</h2>
          <p className="text-gray-600">Review key concepts with interactive flashcards</p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-600">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {flashcards[currentIndex].subject}
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
    </div>
  );
};