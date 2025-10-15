"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TopicExplanation } from "@/components/TopicExplanation";
import { PracticeQuestions } from "@/components/PracticeQuestions";
import { AIFlashcards } from "@/components/AIFlashcards";
import { MockTest } from "@/components/MockTest"; // Keep import for mock tab usage
import { saveChapterScore, updateStudentProgress } from "@/lib/actions/chapter.actions";
import { stripMarkdown } from "@/utils/markdown-stripper";
import { vapi } from "@/lib/vapi.sdk";
import { configureAssistant } from "@/lib/utils";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import Image from "next/image";
import { CreateAssistantDTO, AssistantOverrides } from "@vapi-ai/web/dist/api";

// Add these type definitions
enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface TranscriptMessage {
  type: "transcript";
  role: "user" | "system" | "assistant";
  transcriptType: "partial" | "final";
  transcript: string;
}

interface FunctionCallMessage {
  type: "function-call";
  functionCall: {
    name: string;
    parameters: unknown;
  };
}

interface FunctionCallResultMessage {
  type: "function-call-result";
  functionCallResult: {
    forwardToClientEnabled?: boolean;
    result: unknown;
    [a: string]: unknown;
  };
}

type Message = TranscriptMessage | FunctionCallMessage | FunctionCallResultMessage;

// Define type for mock test questions
interface MockTestQuestion {
  id: string;
  created_at: string;
  chapter_id: string;
  chapter_name: string;
  subject: string;
  class: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
  user_id: string;
  test_score: number;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  user_answers?: Record<string, string>;
  is_retake?: boolean;
  subtopic?: string;
}

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

// Define type for student progress
interface StudentProgress {
  mastery_percentage: number;
  subtopic_mastery: Record<string, number>;
  last_practiced?: string;
}

export const ChapterInterface = ({ chapterData, userId }: ChapterInterfaceProps) => {
  const [activeTab, setActiveTab] = useState<"topics" | "mock" | "flashcards">("topics");
  

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [loadingTopics, setLoadingTopics] = useState<Record<string, boolean>>({});
  // VAPI states
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // Add state for student progress with subtopic mastery
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [showResults, setShowResults] = useState(false); // For tracking mock test results
  


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

  // VAPI effects
  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking, lottieRef]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);

  useEffect(() => {
    // Clean up loading states when component unmounts
    return () => {
      setLoadingTopics({});
    };
  }, []);

  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const toggleTopic = (topicId: string) => {
    // If we're expanding a topic that hasn't been loaded yet, mark it as loading
    if (expandedTopic !== topicId) {
      // In a real implementation, you might want to check if the content has already been loaded
      // For now, we'll show loading for all expansions
      setLoadingTopics(prev => ({ ...prev, [topicId]: true }));
      // Set a timeout to simulate loading, in a real app this would be when the content is actually loaded
      setTimeout(() => {
        setLoadingTopics(prev => ({ ...prev, [topicId]: false }));
      }, 500);
    }
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const handleCall = async (topic: string) => {
    setCurrentTopic(topic);
    setCallStatus(CallStatus.CONNECTING);
    setMessages([]);

    // Create properly typed assistant overrides
    const assistantOverrides = {
      variableValues: { 
        subject: chapterData.subject, 
        topic: topic === "Chapter Overview" 
          ? `${chapterData.title} - Chapter Overview` 
          : `${chapterData.title} - ${topic}`,
        style: "casual" 
      },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
    vapi.start(configureAssistant("female", "casual"), assistantOverrides);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleSubtopicVoiceTutor = async (subtopic: string) => {
    setCurrentTopic(subtopic);
    setCallStatus(CallStatus.CONNECTING);
    setMessages([]);

    // Create properly typed assistant overrides for subtopic tutoring
    const assistantOverrides = {
      variableValues: { 
        subject: chapterData.subject, 
        topic: `${chapterData.title} - ${subtopic}`,
        style: "casual"
      },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
    vapi.start(configureAssistant("female", "casual"), assistantOverrides);
    
    // Scroll to the VAPI section
    setTimeout(() => {
      const vapiSection = document.getElementById('vapi-section');
      if (vapiSection) {
        vapiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Add state for user's test scores
  const [userTestScores, setUserTestScores] = useState<MockTestQuestion[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);

  // Fetch user's test scores to determine unlocked topics
  useEffect(() => {
    const fetchUserScores = async () => {
      try {
        setLoadingScores(true);
        const response = await fetch(`/api/my-journey?chapterId=${chapterData.id}`);
        const data = await response.json();
        
        if (data.success) {
          setUserTestScores(data.data);
        }
      } catch (error) {
        console.error("Error fetching user scores:", error);
      } finally {
        setLoadingScores(false);
      }
    };

    fetchUserScores();
  }, [chapterData.id]);

  // Fetch student progress with subtopic mastery
  const fetchStudentProgress = async () => {
    try {
      setLoadingProgress(true);
      const response = await fetch(`/api/student-progress?chapterId=${chapterData.id}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        setStudentProgress(result.data[0]);
      } else {
        // Initialize with default values
        setStudentProgress({
          mastery_percentage: chapterData.masteryPercentage,
          subtopic_mastery: {}
        });
      }
    } catch (error) {
      console.error("Error fetching student progress:", error);
      // Fallback to chapter data
      setStudentProgress({
        mastery_percentage: chapterData.masteryPercentage,
        subtopic_mastery: {}
      });
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    fetchStudentProgress();
  }, [chapterData.id, chapterData.masteryPercentage, userId]);

  // Log when component re-renders with new studentProgress
  useEffect(() => {
    console.log('ChapterInterface re-rendering with studentProgress:', studentProgress);
  }, [studentProgress]);
  
  // Refresh student progress when switching to topics tab (after potentially completing a mock test)
  useEffect(() => {
    if (activeTab === "topics") {
      // Add a small delay to ensure data is saved
      const timer = setTimeout(() => {
        const fetchStudentProgress = async () => {
          try {
            const response = await fetch(`/api/student-progress?chapterId=${chapterData.id}`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
              setStudentProgress(result.data[0]);
            }
          } catch (error) {
            console.error("Error refreshing student progress:", error);
          }
        };

        fetchStudentProgress();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [activeTab, chapterData.id]);

  // Function to check if a topic is unlocked (all topics unlocked from start)
  const isTopicUnlocked = (topicIndex: number, topicTitle: string) => {
    // All topics are unlocked from the start
    return true;
  };

  // Function to identify weakest topics
  const getWeakestTopics = () => {
    return chapterData.topics
      .filter(topic => topic.mastery < 30)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 3);
  };

  // Add state for weakest topics
  const [weakestTopics, setWeakestTopics] = useState<WeakestTopic[]>([]);
  const [loadingWeakestTopics, setLoadingWeakestTopics] = useState(true);

  // Fetch weakest topics from mock_test_questions
  useEffect(() => {
    const fetchWeakestTopics = async () => {
      try {
        setLoadingWeakestTopics(true);
        const response = await fetch(`/api/my-journey?chapterId=${chapterData.id}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          // Process mock test data to find weakest topics
          const topicScores: Record<string, number[]> = {};
          
          // Group scores by subtopic
          result.data.forEach((test: MockTestQuestion) => {
            if (test.subtopic && test.test_score !== undefined) {
              if (!topicScores[test.subtopic]) {
                topicScores[test.subtopic] = [];
              }
              topicScores[test.subtopic].push(test.test_score);
            }
          });
          
          // Calculate best score for each topic and filter weak ones
          const weakTopics = Object.entries(topicScores)
            .map(([topic, scores]) => {
              // Find the highest score for this topic
              const bestScore = Math.max(...scores);
              return { topic, bestScore };
            })
            .filter(({ bestScore }) => bestScore <= 30)
            .sort((a, b) => a.bestScore - b.bestScore)
            .slice(0, 3)
            .map(({ topic, bestScore }) => ({
              id: topic.replace(/\s+/g, '-').toLowerCase(),
              title: topic,
              mastery: Math.round(bestScore)
            }));
          
          setWeakestTopics(weakTopics);
        }
      } catch (error) {
        console.error("Error fetching weakest topics:", error);
      } finally {
        setLoadingWeakestTopics(false);
      }
    };

    fetchWeakestTopics();
  }, [chapterData.id]);

  return (
    <div className="chapter-interface">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <button className="text-blue-600 hover:text-blue-800 mb-2 text-sm">
            ← Back to Subjects
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-gray-200 px-2 py-1 rounded text-xs">
              Class {chapterData.class}
            </span>
            <span 
              className="px-2 py-1 rounded text-xs text-white"
              style={{ backgroundColor: getSubjectColor(chapterData.subject) }}
            >
              {chapterData.subject}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-2">{chapterData.title}</h1>
        </div>
        <div className="text-center">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <svg viewBox="0 0 36 36" className="w-16 h-16 md:w-20 md:h-20">
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
          <p className="text-xs md:text-sm mt-1">Chapter Mastery</p>
        </div>
      </div>

      {/* Hero Area */}
      <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6 md:mb-8">
        <p className="text-base md:text-lg mb-4">{chapterData.objective}</p>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm md:text-base"
          onClick={() => handleCall("Chapter Overview")}
        >
          Practice Chapter with Voice Tutor
        </Button>
      </div>

      {/* VAPI Voice Tutor Section - Only show when active */}
      {(callStatus === CallStatus.ACTIVE || callStatus === CallStatus.CONNECTING || callStatus === CallStatus.FINISHED) && (
        <div id="vapi-section" className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-lg md:text-xl font-bold">
              {currentTopic ? `Voice Tutor: ${chapterData.title} - ${currentTopic}` : `Voice Tutor: ${chapterData.title}`}
            </h2>
            <button 
              onClick={handleDisconnect}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Close
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="companion-section">
              <div
                className="companion-avatar relative w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center"
                style={{ backgroundColor: getSubjectColor(chapterData.subject) }}
              >
                <div
                  className={`absolute transition-opacity duration-1000 ${
                    callStatus === CallStatus.FINISHED ? "opacity-100" : "opacity-0"
                  } ${
                    callStatus === CallStatus.CONNECTING && "opacity-100 animate-pulse"
                  }`}
                >
                  <Image
                    src={`/icons/${chapterData.subject}.svg`}
                    alt={chapterData.subject}
                    width={60}
                    height={60}
                    className="md:w-20 md:h-20"
                  />
                </div>

                <div
                  className={`absolute transition-opacity duration-1000 ${
                    callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Lottie
                    lottieRef={lottieRef}
                    animationData={soundwaves}
                    autoplay={false}
                    className="w-24 h-24 md:w-32 md:h-32"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-sm"
                  onClick={toggleMicrophone}
                  disabled={callStatus !== CallStatus.ACTIVE}
                >
                  <Image
                    src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
                    alt="mic"
                    width={20}
                    height={20}
                  />
                  <span>{isMuted ? "Unmute" : "Mute"}</span>
                </button>
                <button
                  className={`rounded-lg py-2 px-4 cursor-pointer transition-colors text-white text-sm ${
                    callStatus === CallStatus.ACTIVE ? "bg-red-700" : "bg-primary"
                  } ${callStatus === CallStatus.CONNECTING && "animate-pulse"}`}
                  onClick={handleDisconnect}
                >
                  {callStatus === CallStatus.ACTIVE
                    ? "End Session"
                    : callStatus === CallStatus.CONNECTING
                    ? "Connecting..."
                    : "Start Session"}
                </button>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-3 md:p-4 h-24 md:h-32 overflow-y-auto">
                {callStatus === CallStatus.CONNECTING && (
                  <p className="text-sm">Connecting to voice tutor for {currentTopic ? `${currentTopic}` : "chapter overview"}...</p>
                )}
                {callStatus === CallStatus.ACTIVE && (
                  <p className="text-sm">Session active. Speak to interact with your tutor about {currentTopic ? `${currentTopic}` : "this chapter"}.</p>
                )}
                {callStatus === CallStatus.FINISHED && (
                  <p className="text-sm">Session ended. Click &quot;Start Session&quot; to begin a new session.</p>
                )}
              </div>
            </div>
          </div>

          {/* Transcript */}
          <div className="bg-gray-50 rounded-lg p-3 md:p-4 h-32 md:h-40 overflow-y-auto">
            <h3 className="font-bold mb-2 text-sm">Conversation Transcript</h3>
            <div className="space-y-2">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    message.role === "assistant" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  <strong>{message.role === "assistant" ? "Tutor" : "You"}:</strong> {message.content}
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-gray-500 text-sm">Conversation will appear here...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chapter Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-3 md:p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 text-sm md:text-base">Key Topics</h3>
          <ul className="space-y-2">
            {chapterData.topics.slice(0, 3).map((topic) => (
              <li key={topic.id} className="py-1.5 border-b border-gray-100 last:border-0">
                <span className="font-medium text-sm">{topic.title}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 text-sm md:text-base">Chapter Mastery</h3>
          <div className="flex items-center justify-center h-20">
            <div className="relative w-14 h-14 md:w-16 md:h-16">
              <svg viewBox="0 0 36 36" className="w-14 h-14 md:w-16 md:h-16">
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
          <p className="text-center text-xs md:text-sm mt-2">
            Last practiced: {studentProgress?.last_practiced ? new Date(studentProgress.last_practiced).toLocaleDateString() : "Never"}
          </p>
        </div>
        
        <div className="bg-white p-3 md:p-4 rounded-lg shadow">
          <h3 className="font-bold mb-2 text-sm md:text-base">Weakest Topics</h3>
          {loadingWeakestTopics ? (
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
            </div>
          ) : weakestTopics.length > 0 ? (
            <ul className="space-y-2">
              {weakestTopics.slice(0, 3).map((topic) => (
                <li key={topic.id} className="py-1.5 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{topic.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 text-xs">{topic.mastery}%</span>
                      <Button 
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white h-5 px-2 text-xs"
                        onClick={() => {
                          // Find the topic index and expand it
                          const topicIndex = chapterData.topics.findIndex(t => t.id === topic.id);
                          if (topicIndex !== -1) {
                            toggleTopic(topic.id);
                            // Scroll to the topic
                            setTimeout(() => {
                              const topicElement = document.getElementById(`topic-${topic.id}`);
                              if (topicElement) {
                                topicElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }
                            }, 100);
                          }
                        }}
                      >
                        Practice Now
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-xs">No weak topics identified. Keep up the good work!</p>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        <button
          className={`py-2 px-3 md:px-4 font-medium text-sm md:text-base whitespace-nowrap ${activeTab === "topics" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("topics")}
        >
          Topics
        </button>
        <button
          className={`py-2 px-3 md:px-4 font-medium text-sm md:text-base whitespace-nowrap ${activeTab === "mock" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("mock")}
        >
          Mock Tests
        </button>
        <button
          className={`py-2 px-3 md:px-4 font-medium text-sm md:text-base whitespace-nowrap ${activeTab === "flashcards" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("flashcards")}
        >
          Flashcards
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === "topics" && (
        <div className="bg-white rounded-lg shadow">
          {chapterData.topics.map((topic, index) => {
            const unlocked = true; // All topics are unlocked
            const isWeakest = topic.mastery < 30;
            
            return (
              <div 
                key={topic.id} 
                className="border-b last:border-b-0"
                id={`topic-${topic.id}`}
              >
                <div 
                  className={`flex flex-col md:flex-row md:justify-between md:items-center p-3 md:p-4 cursor-pointer hover:bg-gray-50 gap-2`}
                  onClick={() => toggleTopic(topic.id)}
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-sm md:text-base">{topic.title}</h3>
                    <p className="text-xs md:text-sm text-gray-600">{topic.description}</p>
                    {isWeakest && (
                      <p className="text-xs text-orange-600 mt-1">
                        🔥 Weakest topic
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Mastery and expansion controls only */}
                    <div className="w-16 md:w-24 bg-gray-200 rounded-full h-1.5 md:h-2">
                      <div 
                        className={`h-1.5 md:h-2 rounded-full ${isWeakest ? 'bg-orange-500' : 'bg-blue-600'}`} 
                        style={{ width: `${topic.mastery}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs md:text-sm ${isWeakest ? 'text-orange-600 font-bold' : ''}`}>
                      {topic.mastery}%
                    </span>
                    <button className="text-gray-500">
                      {loadingTopics[topic.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      ) : expandedTopic === topic.id ? (
                        "▲"
                      ) : (
                        "▼"
                      )}
                    </button>
                  </div>
                </div>

                {loadingTopics[topic.id] || expandedTopic === topic.id ? (
                  <div className="px-3 md:px-4 pb-4">
                    {loadingTopics[topic.id] ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <TopicExplanation 
                            subject={chapterData.subject} 
                            chapter={chapterData.title} 
                            topic={topic.title} 
                            loading={loadingTopics[topic.id]} // Pass loading state
                            onSubtopicVoiceTutor={handleSubtopicVoiceTutor} // Pass the voice tutor callback
                          />
                        </div>
                        <div className="mb-4">
                          <PracticeQuestions 
                            subject={chapterData.subject} 
                            chapter={chapterData.title} 
                            userId={userId}
                            subtopic={topic.title} // Pass the subtopic
                          />
                        </div>
                        {/* Remove the Practice This Topic button as requested */}

                      </>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "mock" && (
        <div className="mb-8">
          <MockTest 
            chapterId={chapterData.id}
            chapterName={chapterData.title}
            subject={chapterData.subject} 
            onTestComplete={fetchStudentProgress}
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