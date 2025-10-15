"use client";

import {
  addBookmark,
  isCompanionBookmarked,
  removeBookmark,
} from "@/lib/actions/companion.actions";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CompanionCardProps {
  id: string;
  name: string;
  topic: string;
  subject: string;
  duration: number;
  color: string;
}

const CompanionCard = ({
  id,
  name,
  topic,
  subject,
  duration,
  color,
}: CompanionCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const pathname = usePathname();

  // Check if the companion is bookmarked when the component mounts
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await isCompanionBookmarked(id);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };

    checkBookmarkStatus();
  }, [id]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        // Remove bookmark
        await removeBookmark(id, pathname);
        setIsBookmarked(false);
      } else {
        // Add bookmark
        await addBookmark(id, pathname);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
    }
  };

  return (
    <article className="bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#6366F1] hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Colored Header */}
      <div className="h-2 md:h-3 w-full" style={{ backgroundColor: color }}></div>

      {/* Card Content */}
      <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-4">
        {/* Subject Badge and Bookmark */}
        <div className="flex justify-between items-center">
          <span className="inline-block bg-[#F1F5F9] text-[#475569] px-2 py-1 md:px-3 md:py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide">
            {subject}
          </span>
          <button
            className="p-1.5 md:p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            onClick={handleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 ${
                isBookmarked
                  ? "fill-[#6366F1] stroke-[#6366F1]"
                  : "stroke-[#64748B] fill-none"
              } transition-colors`}
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-lg md:text-2xl font-bold text-[#0F172A] group-hover:text-[#6366F1] transition-colors">
          {name}
        </h2>

        {/* Topic */}
        <p className="text-[#64748B] text-xs md:text-sm line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
          {topic}
        </p>

        {/* Duration */}
        <div className="flex items-center gap-1.5 md:gap-2 text-[#64748B] text-xs md:text-sm">
          <svg
            className="w-3 h-3 md:w-4 md:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-medium">{duration} minutes</span>
        </div>

        {/* Launch Button */}
        <Link href={`/companions/${id}`} className="w-full mt-2">
          <button className="w-full bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base">
            Launch Lesson
            <svg
              className="w-4 h-4 md:w-5 md:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </Link>
      </div>
    </article>
  );
};

export default CompanionCard;