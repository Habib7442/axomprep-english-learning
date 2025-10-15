import React from "react";
import Link from "next/link";
import { getStudentProgress } from "@/lib/actions/chapter.actions";

interface ChapterCardProps {
  id: string;
  title: string;
  subject: string;
  class: string;
  topicCount: number;
  masteryPercentage: number;
}

const ChapterCard = ({
  id,
  title,
  subject,
  class: chapterClass,
  topicCount,
  masteryPercentage,
}: ChapterCardProps) => {
  // Get color based on subject
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      chemistry: "#E5D0FF",
      biology: "#BDE7FF",
      physics: "#FFDA6E",
      mathematics: "#FFC8E4",
      english: "#BDE7FF",
      hindi: "#FFC8E4",
      "social science": "#FFECC8",
      sanskrit: "#C8FFDF",
      "environmental science/biology": "#C8FFDF",
    };
    
    // Convert to lowercase for case-insensitive matching
    const normalizedSubject = subject.toLowerCase();
    
    // Check for exact match
    if (colors[normalizedSubject]) {
      return colors[normalizedSubject];
    }
    
    // Check for partial matches
    if (normalizedSubject.includes("chemistry")) return "#E5D0FF";
    if (normalizedSubject.includes("biology") || normalizedSubject.includes("environmental")) return "#BDE7FF";
    if (normalizedSubject.includes("physics")) return "#FFDA6E";
    if (normalizedSubject.includes("math")) return "#FFC8E4";
    
    // Default color
    return "#E5D0FF";
  };

  return (
    <article 
      className="chapter-card rounded-lg p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow"
      style={{ borderLeft: `4px solid ${getSubjectColor(subject)}` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-base md:text-lg">{title}</h3>
          <p className="text-xs md:text-sm text-gray-600">{subject} • Class {chapterClass}</p>
        </div>
        <div className="bg-gray-100 rounded-full px-1.5 py-0.5 md:px-2 md:py-1 text-xs">
          {masteryPercentage}%
        </div>
      </div>
      
      <div className="mt-2 md:mt-3">
        <div className="flex justify-between text-xs md:text-sm mb-1">
          <span>Topics: {topicCount}</span>
          <span>Mastery</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
          <div 
            className="bg-blue-600 h-1.5 md:h-2 rounded-full" 
            style={{ width: `${masteryPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <Link href={`/chapters/${id}`} className="mt-3 md:mt-4 block">
        <button className="w-full py-1.5 md:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base">
          Open Chapter
        </button>
      </Link>
    </article>
  );
};

export default ChapterCard;