"use client";

import React, { useState } from "react";
import { PracticeQuestions } from "@/components/PracticeQuestions";

interface WeakTopic {
  id: string;
  name: string;
  score: number;
}

interface PersonalizedTestProps {
  userId: string;
  weakTopics: WeakTopic[];
}

export const PersonalizedTest = ({ userId, weakTopics }: PersonalizedTestProps) => {
  const [selectedTopic, setSelectedTopic] = useState<WeakTopic | null>(null);
  const [testStarted, setTestStarted] = useState(false);

  const handleStartTest = (topic: WeakTopic) => {
    setSelectedTopic(topic);
    setTestStarted(true);
  };

  const handleTestBack = () => {
    setTestStarted(false);
    setSelectedTopic(null);
  };

  if (testStarted && selectedTopic) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleTestBack}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Topics
          </button>
          <h2 className="text-xl font-bold">Practice Test: {selectedTopic.name}</h2>
          <div></div> {/* Spacer for alignment */}
        </div>
        <PracticeQuestions 
          subject="Science" // This would be dynamic in a real app
          chapter={selectedTopic.name}
          userId={userId}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Personalized Practice Tests</h2>
        <p className="text-gray-600">Focus on your weak areas to improve your performance</p>
      </div>

      <div className="p-6">
        {weakTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No weak topics identified. Great job!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Practice Tests for Weak Areas</h3>
            {weakTopics.map((topic) => (
              <div key={topic.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{topic.name}</h4>
                  <p className="text-sm text-gray-600">Current Score: {topic.score}%</p>
                </div>
                <button
                  onClick={() => handleStartTest(topic)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Start Practice Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};