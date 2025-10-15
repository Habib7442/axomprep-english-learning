"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { TopicExplanation } from "@/components/TopicExplanation";
import { PracticeQuestions } from "@/components/PracticeQuestions";
import { AIFlashcards } from "@/components/AIFlashcards";
import { MockTest } from "@/components/MockTest";
import { saveChapterScore, updateStudentProgress } from "@/lib/actions/chapter.actions";

interface Topic {
  id: string;
  title: string;
  description: string;
  mastery: number;
  lastPracticed: string;
  weightage: string;
}

interface WeakestTopic {
  id: string;
  title: string;
  description: string;
  mastery: number;
}

interface ChapterData {
  id: string;
  title: string;
  subject: string;
  class: string;
  objective: string;
  topics: Topic[];
  weakestTopics: WeakestTopic[];
  masteryPercentage: number;
  totalTime: number;
}

interface ChapterInterfaceProps {
  chapterData: ChapterData;
  userId: string;
}

export const ChapterInterface = ({ chapterData, userId }: ChapterInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<"topics" | "mock" | "flashcards">("topics");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  // Get color based on subject
  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      science: "#E5D0FF",
      maths: "#FFDA6E",
      english: "#BDE7FF",
      hindi: "#FFC8E4",
      socialscience: "#FFECC8",
      sanskrit: "#C8FFDF",
    };
    return colors[subject.toLowerCase()] || "#E5D0FF";
  };

  return (
    <div className="chapter-interface">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button className="text-blue-600 hover:text-blue-800 mb-2">
            ← Back to Subjects
          </button>
          <div className="flex items-center gap-2">
            <span className="bg-gray-200 px-2 py-1 rounded text-sm">
              Class {chapterData.class}
            </span>
            <span 
              className="px-2 py-1 rounded text-sm text-white"
              style={{ backgroundColor: getSubjectColor(chapterData.subject) }}
            >
              {chapterData.subject}
            </span>
          </div>
          <h1 className="text-3xl font-bold mt-2">{chapterData.title}</h1>
        </div>
        <div className="text-center">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 36 36" className="w-20 h-20">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eee"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="3"
                strokeDasharray={`${chapterData.masteryPercentage}, 100`}
              />
              <text x="18" y="20.5" textAnchor="middle" fill="#4CAF50" fontSize="8" fontWeight="bold">
                {chapterData.masteryPercentage}%
              </text>
            </svg>
          </div>
          <p className="text-sm mt-1">Chapter Mastery</p>
        </div>
      </div>

      {/* Hero Area */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <p className="text-lg mb-4">{chapterData.objective}</p>
        <div className="flex gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
            Practice with Voice Tutor
          </Button>
          <Button variant="outline" className="border-2 px-6 py-3 rounded-lg">
            Start Mini-Mock (3 questions)
          </Button>
        </div>
      </div>

      {/* Chapter Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Topics & Weightage</h3>
          <ul className="text-sm">
            {chapterData.topics.map((topic) => (
              <li key={topic.id} className="flex justify-between py-1">
                <span>{topic.title}</span>
                <span className="bg-gray-100 px-2 rounded">{topic.weightage}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Chapter Mastery</h3>
          <div className="flex items-center justify-center h-24">
            <div className="relative w-16 h-16">
              <svg viewBox="0 0 36 36" className="w-16 h-16">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#eee"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="3"
                  strokeDasharray={`${chapterData.masteryPercentage}, 100`}
                />
                <text x="18" y="20.5" textAnchor="middle" fill="#4CAF50" fontSize="8" fontWeight="bold">
                  {chapterData.masteryPercentage}%
                </text>
              </svg>
            </div>
          </div>
          <p className="text-center text-sm mt-2">
            Last practiced: {chapterData.topics[0]?.lastPracticed || "Never"}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2">Weakest Topics</h3>
          <ul className="text-sm">
            {chapterData.weakestTopics.map((topic) => (
              <li key={topic.id} className="py-1">
                <div className="flex justify-between">
                  <span>{topic.title}</span>
                  <span className="text-red-600">{topic.mastery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div 
                    className="bg-red-600 h-1.5 rounded-full" 
                    style={{ width: `${topic.mastery}%` }}
                  ></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === "topics" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("topics")}
        >
          Topics
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "mock" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("mock")}
        >
          Mock Tests
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === "flashcards" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("flashcards")}
        >
          Flashcards
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "topics" && (
        <div className="bg-white rounded-lg shadow">
          {chapterData.topics.map((topic) => (
            <div 
              key={topic.id} 
              className="border-b last:border-b-0"
            >
              <div 
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleTopic(topic.id)}
              >
                <div>
                  <h3 className="font-medium">{topic.title}</h3>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${topic.mastery}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{topic.mastery}%</span>
                  <button className="text-gray-500">
                    {expandedTopic === topic.id ? "▲" : "▼"}
                  </button>
                </div>
              </div>
              
              {expandedTopic === topic.id && (
                <div className="px-4 pb-4">
                  <div className="mb-4">
                    <TopicExplanation 
                      subject={chapterData.subject} 
                      chapter={chapterData.title} 
                      topic={topic.title} 
                    />
                  </div>
                  <div className="mb-4">
                    <PracticeQuestions 
                      subject={chapterData.subject} 
                      chapter={chapterData.title} 
                      userId={userId}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "mock" && (
        <div className="mb-8">
          <MockTest 
            chapterId={chapterData.id}
            chapterName={chapterData.title}
            subject={chapterData.subject}
          />
        </div>
      )}

      {activeTab === "flashcards" && (
        <div className="mb-8">
          <AIFlashcards 
            subject={chapterData.subject} 
            chapter={chapterData.title} 
            chapterId={chapterData.id}
          />
        </div>
      )}
    </div>
  );
};