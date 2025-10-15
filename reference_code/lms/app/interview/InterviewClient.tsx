"use client";

import React, { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { configureAssistant } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface InterviewReport {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  score: number;
  feedback: string;
  recommendations: string[];
}

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const InterviewClient = ({ user, initialTopic }: { 
  user: { 
    id: string;
    firstName: string | null;
    imageUrl: string | null;
  };
  initialTopic: string;
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [topic, setTopic] = useState(initialTopic);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const supabase = createClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (lottieRef.current) {
      if (isSpeaking) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.stop();
      }
    }
  }, [isSpeaking]);

  // Save session to Supabase when interview finishes
  useEffect(() => {
    // This useEffect is no longer needed as we're generating reports immediately
    // when the session ends via the generateReport function
    return () => {};
  }, [callStatus, user, topic, messages, supabase]);

  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      startTime.current = Date.now();
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: { type: string; transcriptType: string; role: string; transcript: string }) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => {
      console.log("VAPI Error", error);
      alert(`VAPI Error: ${error.message}`);
    };

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

  const toggleMicrophone = () => {
    try {
      const isMuted = vapi.isMuted();
      vapi.setMuted(!isMuted);
      setIsMuted(!isMuted);
    } catch (error) {
      console.error("Error toggling microphone:", error);
      alert("Failed to toggle microphone. Please try again.");
    }
  };

  const handleStartInterview = async () => {
    if (!topic.trim()) {
      alert("Please enter an interview topic");
      return;
    }

    // Check if user can start an interview by calling the API
    try {
      const response = await fetch('/api/billing?action=can-start-interview');
      const data = await response.json();
      
      if (!data.canStart) {
        alert("You've reached your interview limit for your current plan. Please upgrade to continue practicing.");
        return;
      }
    } catch (error) {
      console.error("Error checking interview permission:", error);
      // Continue with interview start even if we can't check permissions
    }

    setCallStatus(CallStatus.CONNECTING);

    const assistantOverrides = {
      variableValues: { 
        topic,
        userName: user?.firstName || "Candidate",
        subject: "interview"
      },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // Configure the assistant for interview practice using the same pattern as CompanionComponent
    // Using "male" and "formal" as default values that match the available voices
    const assistantConfig = configureAssistant("male", "formal");
    assistantConfig.name = "Interview Coach";
    assistantConfig.firstMessage = `Hello! I'm your interview coach for ${topic}. Let's start with some basic questions about this topic. Please introduce yourself and tell me about your experience with ${topic}.`;
    
    // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
    vapi.start(assistantConfig, assistantOverrides);
  };

  const handleEndInterview = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
    // Generate report immediately when session ends
    generateReport();
  };

  // Function to generate report immediately after session ends
  const generateReport = async () => {
    if (!user?.id || !topic) return;
    
    try {
      // Show loading state
      setIsAnalyzing(true);
      
      // Save session to Supabase first
      const { data: sessionData, error: sessionError } = await supabase.from('session_history').insert([
        {
          user_id: user.id,
          companion_id: null,
          topic: topic,
          messages: messages,
          duration: Date.now() - startTime.current,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (sessionError) {
        console.error('Error saving session to Supabase:', sessionError);
        setIsAnalyzing(false);
        return;
      }

      // Get the session ID
      const sessionId = sessionData?.[0]?.id;
      
      if (sessionId) {
        // Generate and save interview report
        const reportId = await generateAndSaveInterviewReport(sessionId, "topic-based", topic, null);
        
        // Redirect directly to the report page if report was generated successfully
        if (reportId) {
          router.push(`/my-journey/report/${reportId}`);
          return;
        }
      }
      
      setIsAnalyzing(false);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsAnalyzing(false);
    }
  };

  // Function to generate and save interview report
  const generateAndSaveInterviewReport = async (
    sessionId: string, 
    interviewType: string, 
    topic: string, 
    jobDescription: string | null
  ): Promise<string | null> => {
    try {
      // Create a transcript string for analysis
      const transcriptText = messages.map(msg => 
        `${msg.role === 'assistant' ? 'Interviewer' : 'Candidate'}: ${msg.content}`
      ).join('\n\n');

      // Call the API to generate the report
      const response = await fetch('/api/interview/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          interviewType,
          topic,
          jobDescription
        }),
      });

      const { analysis, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      // Save report to Supabase
      const { data, error: supabaseError } = await supabase.from('interview_reports').insert([
        {
          user_id: user.id,
          session_id: sessionId,
          interview_type: interviewType,
          topic: topic,
          job_description: jobDescription,
          transcript: messages,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          improvements: analysis.improvements,
          score: analysis.score,
          feedback: analysis.feedback,
          recommendations: analysis.recommendations
        }
      ]).select();

      if (supabaseError) {
        console.error('Error saving interview report:', supabaseError);
        return null;
      } else {
        console.log('Interview report saved:', data);
        return data?.[0]?.id || null;
      }
    } catch (error) {
      console.error('Error generating interview report:', error);
      // Fallback to mock report if AI generation fails
      const mockReport: InterviewReport = {
        strengths: [
          "Good communication skills",
          "Relevant experience mentioned",
          "Clear structure in responses"
        ],
        weaknesses: [
          "Could provide more specific examples",
          "Sometimes went off-topic",
          "Needed more technical details"
        ],
        improvements: [
          "Use STAR method for behavioral questions",
          "Prepare specific examples for common questions",
          "Practice concise responses"
        ],
        score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
        feedback: `Overall, you demonstrated good communication skills and relevant experience for the ${topic} position. Your responses were generally clear and well-structured. To improve, focus on providing more specific examples using the STAR method (Situation, Task, Action, Result) and prepare technical details relevant to the role.`,
        recommendations: [
          "Research common interview questions for this role",
          "Practice with a friend or mentor",
          "Record yourself to identify areas for improvement",
          "Prepare questions to ask the interviewer"
        ]
      };

      // Save mock report to Supabase
      const { data, error: supabaseError } = await supabase.from('interview_reports').insert([
        {
          user_id: user.id,
          session_id: sessionId,
          interview_type: interviewType,
          topic: topic,
          job_description: jobDescription,
          transcript: messages,
          strengths: mockReport.strengths,
          weaknesses: mockReport.weaknesses,
          improvements: mockReport.improvements,
          score: mockReport.score,
          feedback: mockReport.feedback,
          recommendations: mockReport.recommendations
        }
      ]).select();

      if (supabaseError) {
        console.error('Error saving mock interview report:', supabaseError);
        return null;
      } else {
        console.log('Mock interview report saved:', data);
        return data?.[0]?.id || null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-center">Interview Practice</h1>
          <Link href="/interview/reports" className="text-blue-600 hover:text-blue-800">
            Reports
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Topic Selection */}
          {callStatus === CallStatus.INACTIVE && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Interview Topic</h2>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter interview topic (e.g., React Developer, Marketing Manager)"
                  className="flex-grow px-6 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
                />
                <button
                  onClick={handleStartInterview}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg whitespace-nowrap"
                >
                  Start Interview
                </button>
              </div>
              <p className="text-gray-600 text-center">
                Practice real interview scenarios with our AI coach. Get feedback on your answers and improve your confidence.
              </p>
              
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 mb-4">Or try our resume-based interview practice:</p>
                <Link href="/interview/resume">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                    Upload Resume & Practice
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Interview Interface */}
          {(callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE || callStatus === CallStatus.FINISHED) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* AI Interviewer Section */}
                <div className="md:w-1/2">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">AI Interview Coach</h2>
                    <p className="text-gray-600">Topic: {topic}</p>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                      <div
                        className={`absolute transition-opacity duration-1000 ${
                          (callStatus as CallStatus) === CallStatus.FINISHED || (callStatus as CallStatus) === CallStatus.INACTIVE
                            ? "opacity-100"
                            : "opacity-0"
                        } ${
                          callStatus === CallStatus.CONNECTING && "opacity-100 animate-pulse"
                        }`}
                      >
                        <Image
                          src="/icons/male-ai-assistant.png"
                          alt="Interview Coach - Male Voice"
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
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
                          className="w-48 h-48"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-xl mb-2">
                      {`${user?.firstName || "Candidate"}'s Interview Coach`}
                    </p>
                    <div className="flex justify-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        callStatus === CallStatus.ACTIVE ? "bg-green-500 animate-pulse" : 
                        callStatus === CallStatus.CONNECTING ? "bg-yellow-500 animate-pulse" : 
                        "bg-gray-400"
                      }`}></span>
                      <span className="text-sm">
                        {callStatus === CallStatus.ACTIVE ? "In Progress" : 
                         callStatus === CallStatus.CONNECTING ? "Connecting" : 
                         "Session Ended"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Section */}
                <div className="md:w-1/2">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">You</h2>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center overflow-hidden">
                      {user?.imageUrl ? (
                        <Image
                          src={user.imageUrl}
                          alt={user.firstName || "User"}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-6xl flex items-center justify-center w-full h-full">
                          {user?.firstName?.charAt(0) || "U"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors w-full ${
                        callStatus === CallStatus.ACTIVE
                          ? isMuted
                            ? "bg-gray-200 hover:bg-gray-300"
                            : "bg-green-200 hover:bg-green-300"
                          : "bg-gray-200 cursor-not-allowed"
                      }`}
                      onClick={toggleMicrophone}
                      disabled={callStatus !== CallStatus.ACTIVE}
                    >
                      <Image
                        src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
                        alt="mic"
                        width={24}
                        height={24}
                      />
                      <span>
                        {isMuted ? "Turn on microphone" : "Turn off microphone"}
                      </span>
                      {callStatus === CallStatus.ACTIVE && !isMuted && isSpeaking && (
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse delay-150"></div>
                        </div>
                      )}
                    </button>
                    
                    <button
                      className={`rounded-lg py-3 cursor-pointer transition-colors w-full text-white ${
                        callStatus === CallStatus.ACTIVE
                          ? "bg-red-700 hover:bg-red-800"
                          : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      } ${callStatus === CallStatus.CONNECTING && "animate-pulse"}`}
                      onClick={
                        callStatus === CallStatus.ACTIVE ? handleEndInterview : handleStartInterview
                      }
                    >
                      {callStatus === CallStatus.ACTIVE
                        ? "End Interview"
                        : callStatus === CallStatus.CONNECTING
                        ? "Connecting..."
                        : "Start Interview"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interview Transcript */}
          {(callStatus === CallStatus.ACTIVE || callStatus === CallStatus.FINISHED) && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Interview Transcript</h2>
              <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${
                        message.role === "assistant"
                          ? "bg-blue-100 border border-blue-200"
                          : "bg-orange-100 border border-orange-200"
                      }`}
                    >
                      <div className="font-bold mb-2">
                        {message.role === "assistant" ? "Interview Coach" : user?.firstName || "You"}
                      </div>
                      <p>{message.content}</p>
                    </div>
                  ))}
                  
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      {callStatus === CallStatus.ACTIVE
                        ? "Interview in progress... Speak to the microphone to begin."
                        : "Your interview conversation will appear here."}
                    </div>
                  )}
                </div>
              </div>
              
              {callStatus === CallStatus.FINISHED && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setCallStatus(CallStatus.INACTIVE);
                      setMessages([]);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    Start New Interview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Generating Your Report</h3>
            <p className="text-gray-600">Analyzing your interview performance...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewClient;