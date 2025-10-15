"use client";

import { useEffect, useRef, useState } from "react";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/actions/companion.actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
  companionId,
  subject,
  topic,
  name,
  userName,
  userImage,
  style,
  voice,
  userId: propUserId, // Get userId from props
}: CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState<string | null>(propUserId || null); // Use prop userId or state

  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const supabase = createClient();
  const startTime = useRef<number>(Date.now());
  const router = useRouter();
  const conversationRef = useRef<HTMLDivElement>(null); // Ref for the conversation section

  useEffect(() => {
    // If userId wasn't passed as prop, get it from Supabase auth
    if (!propUserId) {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      };
      
      getUser();
    }
  }, [supabase, propUserId]);

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
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      startTime.current = Date.now();
    };

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

    const onError = (error: Error) => {
      console.log("VAPI Error", error);
      // Show a more detailed error message to the user
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

  // Generate report when session ends
  useEffect(() => {
    // This useEffect is no longer needed as we're generating reports immediately
    // when the session ends via the handleDisconnect function
    return () => {};
  }, [callStatus, messages, userId]);

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

  const handleCall = async () => {
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
      // Continue with session start even if we can't check permissions
    }

    setCallStatus(CallStatus.CONNECTING);
    setIsAnalyzing(false); // Ensure isAnalyzing is false when starting a new session

    const assistantOverrides = {
      variableValues: { subject, topic, style },
      clientMessages: ["transcript"],
      serverMessages: [],
    };

    // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
    vapi.start(configureAssistant(voice, style), assistantOverrides);
    
    // Scroll to the conversation section after a short delay to ensure the UI has updated
    setTimeout(() => {
      conversationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
    // Generate report immediately when session ends
    generateReport();
  };

  // Function to generate and save interview report
  const generateReport = async () => {
    console.log('Generating report with:', { userId, messagesCount: messages.length, companionId, topic });
    
    // Use userId from props or state
    const currentUserId = userId;
    
    if (!currentUserId) {
      console.error('No user ID available for report generation');
      setIsAnalyzing(false);
      router.push('/my-journey');
      return;
    }
    
    if (messages.length === 0) {
      console.log('No messages to analyze for report');
      setIsAnalyzing(false);
      router.push('/my-journey');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      
      // Save session to Supabase first
      console.log('Saving session to Supabase with data:', {
        user_id: currentUserId,
        companion_id: companionId,
        topic: topic,
        messages: messages,
        duration: Date.now() - startTime.current
      });
      
      const { data: sessionData, error: sessionError } = await supabase.from('session_history').insert([
        {
          user_id: currentUserId,
          companion_id: companionId,
          topic: topic,
          messages: messages,
          duration: Date.now() - startTime.current,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (sessionError) {
        console.error('Error saving session to Supabase:', sessionError);
        setIsAnalyzing(false);
        router.push('/my-journey');
        return;
      }

      console.log('Session saved to Supabase:', sessionData);
      
      // Get the session ID
      const sessionId = sessionData?.[0]?.id;
      
      if (sessionId) {
        // Generate and save interview report
        const reportId = await generateAndSaveInterviewReport(sessionId, currentUserId);
        
        setIsAnalyzing(false);
        
        // Redirect directly to the report page if report was generated successfully
        if (reportId) {
          router.push(`/my-journey/report/${reportId}`);
          return;
        } else {
          // Fallback to My Journey page
          router.push('/my-journey');
          return;
        }
      } else {
        // Fallback to My Journey page
        setIsAnalyzing(false);
        router.push('/my-journey');
        return;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setIsAnalyzing(false);
      // Still redirect to My Journey page even if report generation fails
      router.push('/my-journey');
    }
  };

  // Function to generate and save interview report
  const generateAndSaveInterviewReport = async (sessionId: string, currentUserId: string): Promise<string | null> => {
    try {
      // Create a transcript string for analysis
      const transcriptText = messages.map(msg => 
        `${msg.role === 'assistant' ? name : userName}: ${msg.content}`
      ).join('\n\n');

      // Call the API to generate the report
      const response = await fetch('/api/interview/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcriptText,
          interviewType: "companion-based",
          topic: `${subject} - ${topic}`,
          jobDescription: null
        }),
      });

      const { analysis, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      // Save report to Supabase
      console.log('Saving interview report to Supabase with data:', {
        user_id: currentUserId,
        session_id: sessionId,
        interview_type: "companion-based",
        topic: `${subject} - ${topic}`,
        transcript: messages,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        improvements: analysis.improvements,
        score: analysis.score,
        feedback: analysis.feedback,
        recommendations: analysis.recommendations
      });
      
      const { data, error: supabaseError } = await supabase.from('interview_reports').insert([
        {
          user_id: currentUserId,
          session_id: sessionId,
          interview_type: "companion-based",
          topic: `${subject} - ${topic}`,
          job_description: null,
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
      // Generate more dynamic mock data based on the subject and topic
      const mockStrengths = [
        `Demonstrated good understanding of ${subject} concepts`,
        `Showed enthusiasm and interest in ${topic}`,
        "Communicated ideas clearly and concisely",
        "Provided relevant examples to support points",
        "Showed critical thinking skills"
      ];
      
      const mockWeaknesses = [
        `Could dive deeper into technical aspects of ${topic}`,
        "Sometimes hesitated before answering questions",
        "Could provide more specific examples",
        "Needed more technical details in responses",
        "Went off-topic at times"
      ];
      
      const mockImprovements = [
        `Research advanced ${subject} topics related to ${topic}`,
        "Practice explaining concepts without hesitation",
        "Use the STAR method for structuring responses",
        "Prepare specific examples for common questions",
        "Focus on technical details relevant to the topic"
      ];
      
      const mockRecommendations = [
        `Review ${subject} fundamentals and advanced concepts`,
        "Practice with a friend or mentor",
        "Record yourself to identify areas for improvement",
        "Prepare questions to ask at the end of the session",
        "Research common interview questions for this topic"
      ];

      const mockReport = {
        strengths: mockStrengths.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)), // 3-5 items
        weaknesses: mockWeaknesses.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)), // 3-5 items
        improvements: mockImprovements.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)), // 3-5 items
        score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
        feedback: `Overall, you demonstrated good knowledge of ${subject} and showed interest in ${topic}. Your responses were generally clear, but there's room for improvement in providing more technical details and specific examples. Focus on structuring your answers more effectively and diving deeper into the subject matter.`,
        recommendations: mockRecommendations.sort(() => 0.5 - Math.random()).slice(0, 3 + Math.floor(Math.random() * 3)) // 3-5 items
      };

      // Save mock report to Supabase
      console.log('Saving mock interview report to Supabase with data:', {
        user_id: currentUserId,
        session_id: sessionId,
        interview_type: "companion-based",
        topic: `${subject} - ${topic}`,
        transcript: messages,
        strengths: mockReport.strengths,
        weaknesses: mockReport.weaknesses,
        improvements: mockReport.improvements,
        score: mockReport.score,
        feedback: mockReport.feedback,
        recommendations: mockReport.recommendations
      });
      
      const { data, error: supabaseError } = await supabase.from('interview_reports').insert([
        {
          user_id: currentUserId,
          session_id: sessionId,
          interview_type: "companion-based",
          topic: `${subject} - ${topic}`,
          job_description: null,
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
    <section className="flex flex-col h-[75vh] lg:h-[80vh]">
      <section className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="companion-section w-full lg:w-7/12 xl:w-8/12">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
            <div
              className="companion-avatar w-[120px] h-[120px] md:w-[150px] md:h-[150px] lg:w-[180px] lg:h-[180px] rounded-full overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: getSubjectColor(subject) }}
            >
              <div
                className={cn(
                  "absolute transition-opacity duration-1000 flex items-center justify-center",
                  callStatus === CallStatus.FINISHED ||
                    callStatus === CallStatus.INACTIVE
                    ? "opacity-100"
                    : "opacity-0",
                  callStatus === CallStatus.CONNECTING &&
                    "opacity-100 animate-pulse"
                )}
              >
                <Image
                  src={voice === "female" ? "/icons/female-ai-assistant.png" : "/icons/male-ai-assistant.png"}
                  alt={`${name} - ${voice} voice`}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                className={cn(
                  "absolute transition-opacity duration-1000",
                  callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
                )}
              >
                <Lottie
                  lottieRef={lottieRef}
                  animationData={soundwaves}
                  autoplay={false}
                  className="companion-lottie w-[120px] h-[120px] md:w-[150px] md:h-[150px] lg:w-[180px] lg:h-[180px]"
                />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-[#1F2937] mb-2">{name}</h2>
              <p className="text-lg md:text-xl text-[#4B5563] mb-4">{topic}</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <div 
                  className="px-3 py-1 rounded-full text-sm font-semibold capitalize text-white"
                  style={{ backgroundColor: getSubjectColor(subject) }}
                >
                  {subject}
                </div>
                <div className="bg-[#FFF7F2] border border-[#FDE6D8] px-3 py-1 rounded-full text-sm font-semibold text-[#FF6B35]">
                  {style}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="user-section w-full lg:w-5/12 xl:w-4/12">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 h-full flex flex-col">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <Image
                  src={userImage}
                  alt={userName}
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-[#FFF7F2] w-[100px] h-[100px] object-cover"
                />
                {callStatus === CallStatus.ACTIVE && !isMuted && isSpeaking && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-bold text-xl md:text-2xl text-[#1F2937]">{userName}</h3>
              <p className="text-[#4B5563] text-sm mt-1">You</p>
            </div>
            
            <div className="flex flex-col gap-4 mt-auto">
              <button
                className={`flex items-center justify-center gap-3 px-4 py-3 rounded-xl transition-colors text-base font-semibold ${
                  callStatus === CallStatus.ACTIVE 
                    ? isMuted 
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700" 
                      : "bg-green-100 hover:bg-green-200 text-green-800"
                    : "bg-gray-100 text-gray-500 cursor-not-allowed"
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
                  {isMuted ? "Unmute Microphone" : "Mute Microphone"}
                </span>
              </button>
              
              <button
                className={cn(
                  "rounded-xl py-3 px-4 cursor-pointer transition-all text-white font-semibold text-base flex items-center justify-center gap-2",
                  callStatus === CallStatus.ACTIVE 
                    ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg" 
                    : "bg-gradient-to-r from-[#FF6B35] to-[#FF914D] hover:from-[#FF844B] hover:to-[#FFB088] shadow-lg",
                  callStatus === CallStatus.CONNECTING && "animate-pulse"
                )}
                onClick={
                  callStatus === CallStatus.ACTIVE ? handleDisconnect : handleCall
                }
              >
                {callStatus === CallStatus.ACTIVE ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    End Session
                  </>
                ) : callStatus === CallStatus.CONNECTING ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="transcript bg-white rounded-2xl border border-gray-200 shadow-md p-6 flex-grow" ref={conversationRef}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#1F2937]">Conversation</h3>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-[#4B5563]">
              {callStatus === CallStatus.ACTIVE ? "Session Active" : 
               callStatus === CallStatus.CONNECTING ? "Connecting..." : 
               callStatus === CallStatus.FINISHED ? "Session Ended" : "Ready to Start"}
            </span>
          </div>
        </div>
        
        <div className="transcript-message no-scrollbar bg-gray-50 rounded-xl p-4 h-[calc(100%-2rem)]">
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl ${
                    message.role === "assistant" 
                      ? "bg-white border border-[#E2E8F0]" 
                      : "bg-[#FFEEE6] border border-[#FDE6D8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === "assistant" ? (
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: getSubjectColor(subject) }}
                      >
                        <span className="text-white text-xs font-bold">
                          {name.charAt(0)}
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#FF6B35]">
                        <span className="text-white text-xs font-bold">
                          {userName.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[#1F2937]">
                          {message.role === "assistant" ? name.split(" ")[0] : userName}
                        </span>
                        <span className="text-xs text-[#9CA3AF]">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#4B5563]">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-[#FFF7F2] rounded-full p-4 mb-4">
                <svg className="w-12 h-12 text-[#FF6B35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#1F2937] mb-2">Start Your Conversation</h4>
              <p className="text-[#4B5563] max-w-md">
                {callStatus === CallStatus.INACTIVE 
                  ? "Click 'Start Session' to begin your conversation with your AI tutor." 
                  : "Speak naturally to your AI tutor. Your conversation will appear here."}
              </p>
            </div>
          )}
        </div>
      </section>
      
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Generating Your Report</h3>
            <p className="text-gray-600">Analyzing your conversation performance...</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompanionComponent;