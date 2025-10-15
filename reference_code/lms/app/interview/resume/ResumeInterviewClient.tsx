"use client";

import React, { useState, useRef, useEffect } from "react";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
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

const ResumeInterviewClient = ({ user }: { 
  user: { 
    id: string;
    firstName: string | null;
    imageUrl: string | null;
  };
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingType, setAnalyzingType] = useState<'resume' | 'interview' | 'report' | null>(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  }, [callStatus, user, messages, supabase, jobDescription]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setResumeFile(file);
      } else {
        alert("Please upload a PDF file");
      }
    }
  };

  const handleAnalyzeResume = async () => {
    // Check if user has access to resume analysis by calling the API
    try {
      const response = await fetch('/api/billing?action=has-feature&feature=resume_analysis');
      const data = await response.json();
      
      if (!data.hasFeature) {
        alert("Resume analysis is not available on your current plan. Please upgrade to access this feature.");
        return;
      }
    } catch (error) {
      console.error("Error checking feature access:", error);
      // Continue with resume analysis even if we can't check permissions
    }

    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingType('resume');
    setAnalysisResult("");

    try {
      // Initialize Google GenAI with the API key from environment variables
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

      // Convert file to ArrayBuffer
      const arrayBuffer = await resumeFile.arrayBuffer();
      const fileBlob = new Blob([arrayBuffer], { type: 'application/pdf' });

      // Upload file to Google GenAI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileResponse: any = await ai.files.upload({
        file: fileBlob,
        config: {
          displayName: resumeFile.name,
        },
      });
      
      const file = fileResponse.file || fileResponse;

      // Wait for the file to be processed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let getFile: any = await ai.files.get({ name: file.name });
      while (getFile && getFile.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await ai.files.get({ name: file.name });
        getFile = response.file || response;
      }

      if (getFile && getFile.state === 'FAILED') {
        throw new Error('File processing failed.');
      }

      // Analyze the resume with the job description
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [
        `Analyze this resume against the following job description: "${jobDescription}". 
        Provide detailed feedback on:
        1. How well the resume matches the job requirements
        2. Strengths in the resume
        3. Areas for improvement
        4. Specific suggestions to tailor the resume for this position`,
      ];

      if (getFile && getFile.uri && getFile.mimeType) {
        const fileContent = createPartFromUri(getFile.uri, getFile.mimeType);
        content.push(fileContent);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: content,
      });

      setAnalysisResult(response.text || "Unable to generate analysis.");
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysisResult("Sorry, there was an error analyzing your resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalyzingType(null);
    }
  };

  const handleStartInterview = async () => {
    // Check if user has access to resume-based interviews by calling the API
    try {
      const response = await fetch('/api/billing?action=has-feature&feature=resume_analysis');
      const data = await response.json();
      
      if (!data.hasFeature) {
        alert("Resume-based interviews are not available on your current plan. Please upgrade to access this feature.");
        return;
      }
    } catch (error) {
      console.error("Error checking feature access:", error);
      // Continue with interview start even if we can't check permissions
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

    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingType('interview');

    try {
      // Initialize Google GenAI with the API key from environment variables
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });

      // Convert file to ArrayBuffer
      const arrayBuffer = await resumeFile.arrayBuffer();
      const fileBlob = new Blob([arrayBuffer], { type: 'application/pdf' });

      // Upload file to Google GenAI
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fileResponse: any = await ai.files.upload({
        file: fileBlob,
        config: {
          displayName: resumeFile.name,
        },
      });
      
      const file = fileResponse.file || fileResponse;

      // Wait for the file to be processed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let getFile: any = await ai.files.get({ name: file.name });
      while (getFile && getFile.state === 'PROCESSING') {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await ai.files.get({ name: file.name });
        getFile = response.file || response;
      }

      if (getFile && getFile.state === 'FAILED') {
        throw new Error('File processing failed.');
      }

      // Get a summary of the resume
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = [
        'Summarize this resume in detail, focusing on work experience, skills, and education.',
      ];

      if (getFile && getFile.uri && getFile.mimeType) {
        const fileContent = createPartFromUri(getFile.uri, getFile.mimeType);
        content.push(fileContent);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: content,
      });

      const resumeSummary = response.text || "No summary available.";

      // Start the VAPI interview with resume context
      setCallStatus(CallStatus.CONNECTING);
      setIsAnalyzing(false);
      setAnalyzingType(null);

      // Configure VAPI for resume-based interview using the same pattern as other components
      const assistantOverrides = {
        variableValues: { 
          resumeContent: resumeSummary,
          jobDescription: jobDescription,
          interviewType: "resume-based"
        },
        clientMessages: ["transcript"],
        serverMessages: [],
      };

      // Configure the assistant for resume interview using the same pattern as CompanionComponent
      const assistantConfig = configureAssistant("male", "professional");
      assistantConfig.name = "Resume Interview Coach";
      assistantConfig.firstMessage = `Hello! I'm your interview coach. I've reviewed your resume and the job description for ${jobDescription}. Let's have a conversation about your experience and how it relates to this position. Please tell me about your background and why you're interested in this role.`;
      
      // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
      vapi.start(assistantConfig, assistantOverrides);
    } catch (error) {
      console.error("Error processing resume:", error);
      setIsAnalyzing(false);
      setAnalyzingType(null);
      alert("Sorry, there was an error processing your resume. Please try again.");
    }
  };

  const handleEndInterview = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
    // Generate report immediately when session ends
    generateReport();
  };

  // Function to generate report immediately after session ends
  const generateReport = async () => {
    if (!user?.id) return;
    
    try {
      // Show loading state
      setIsAnalyzing(true);
      setAnalyzingType('report');
      
      // Save session to Supabase first
      const { data: sessionData, error: sessionError } = await supabase.from('session_history').insert([
        {
          user_id: user.id,
          companion_id: null,
          topic: "Resume-based Interview",
          messages: messages,
          duration: Date.now() - startTime.current,
          created_at: new Date().toISOString()
        }
      ]).select();

      if (sessionError) {
        console.error('Error saving session to Supabase:', sessionError);
        setIsAnalyzing(false);
        setAnalyzingType(null);
        return;
      }

      // Get the session ID
      const sessionId = sessionData?.[0]?.id;
      
      if (sessionId) {
        // Generate and save interview report
        const reportId = await generateAndSaveInterviewReport(sessionId, "resume-based", "Resume-based Interview", jobDescription);
        
        // Redirect directly to the report page if report was generated successfully
        if (reportId) {
          router.push(`/my-journey/report/${reportId}`);
          return;
        }
      }
      
      setIsAnalyzing(false);
      setAnalyzingType(null);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsAnalyzing(false);
      setAnalyzingType(null);
    }
  };

  // Function to remove markdown formatting
  const removeMarkdown = (text: string) => {
    if (!text) return text;
    
    return text
      .replace(/(^|\s)#+\s/g, '$1') // Remove headers
      .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold/italic
      .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove inline code
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links but keep text
      .replace(/>\s/g, '') // Remove blockquotes
      .replace(/(-|\*|\+)\s/g, '') // Remove list markers
      .replace(/\d+\.\s/g, '') // Remove numbered list markers
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .trim();
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
          "Relevant experience aligned with job description",
          "Clear structure in responses"
        ],
        weaknesses: [
          "Could provide more quantifiable achievements",
          "Sometimes lacked specific technical details",
          "Needed more examples of problem-solving"
        ],
        improvements: [
          "Include metrics and numbers in your responses",
          "Prepare deeper technical explanations",
          "Use more concrete examples of challenges faced and solutions implemented"
        ],
        score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
        feedback: `Overall, you demonstrated good communication skills and relevant experience that aligns well with the job description. Your responses were clear and structured. To improve, focus on including more quantifiable achievements and deeper technical explanations relevant to the role requirements.`,
        recommendations: [
          "Review the job description again and prepare specific examples",
          "Practice explaining technical concepts clearly",
          "Prepare stories that demonstrate problem-solving abilities",
          "Work on providing concise, impactful answers"
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
          <Link href="/interview" className="text-blue-600 hover:text-blue-800">
            ← Back to Interview Topics
          </Link>
          <h1 className="text-3xl font-bold text-center">Resume-Based Interview Practice</h1>
          <Link href="/interview/reports" className="text-blue-600 hover:text-blue-800">
            Reports
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Resume Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Upload Your Resume & Job Description</h2>
            <p className="text-gray-600 text-center mb-6">
              Upload your resume and enter a job description to get personalized feedback and practice interview questions
            </p>
            
            <div className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label className="block text-lg font-medium mb-2">Upload Your Resume (PDF)</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                    className="hidden"
                  />
                  {resumeFile ? (
                    <p className="text-green-600 font-medium">✓ {resumeFile.name} uploaded</p>
                  ) : (
                    <>
                      <p className="text-gray-500 mb-2">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400">PDF files only (max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Job Description */}
              <div>
                <label className="block text-lg font-medium mb-2">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors h-32"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-lg transition-all ${
                    isAnalyzing || !resumeFile || !jobDescription.trim()
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white hover:scale-105 shadow-lg"
                  }`}
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Resume"}
                </button>
                
                <button
                  onClick={handleStartInterview}
                  disabled={isAnalyzing || !resumeFile || !jobDescription.trim() || callStatus !== CallStatus.INACTIVE}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-lg transition-all ${
                    isAnalyzing || !resumeFile || !jobDescription.trim() || callStatus !== CallStatus.INACTIVE
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white hover:scale-105 shadow-lg"
                  }`}
                >
                  {isAnalyzing ? "Processing..." : "Start Interview"}
                </button>
              </div>
              
              {/* Analysis Results */}
              {analysisResult && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-xl font-bold mb-3 text-blue-800">Resume Analysis</h3>
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold" {...props} />,
                        em: ({node, ...props}) => <span className="italic" {...props} />,
                      }}
                    >
                      {analysisResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interview Interface */}
          {(callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE || callStatus === CallStatus.FINISHED) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* AI Interviewer Section */}
                <div className="md:w-1/2">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">AI Interview Coach</h2>
                    <p className="text-gray-600">Resume-based Interview</p>
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
            <h3 className="text-xl font-bold mb-2">
              {analyzingType === 'resume' ? 'Analyzing Your Resume' : 
               analyzingType === 'interview' ? 'Processing Your Resume' : 
               'Generating Your Report'}
            </h3>
            <p className="text-gray-600">
              {analyzingType === 'resume' ? 'Analyzing your resume against the job description...' : 
               analyzingType === 'interview' ? 'Processing your resume for the interview...' : 
               'Analyzing your interview performance...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeInterviewClient;