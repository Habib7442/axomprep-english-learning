"use client";

import React, { useState, useRef } from "react";
import { vapi } from "@/lib/vapi.sdk";

const ResumeUpload = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult("");

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("jobDescription", jobDescription);
      formData.append("action", "analyze");

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysisResult(data.result);
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setAnalysisResult("Sorry, there was an error analyzing your resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartInterview = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and enter a job description");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append("action", "summarize");

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process resume");
      }

      const resumeSummary = data.result;

      // Start the VAPI interview with resume context
      setInterviewStarted(true);
      setIsAnalyzing(false);

      // Configure VAPI for resume-based interview
      const assistantOverrides = {
        variableValues: { 
          resumeContent: resumeSummary,
          jobDescription: jobDescription,
          interviewType: "resume-based"
        },
        clientMessages: ["transcript"],
        serverMessages: [],
      };

      // This would be a different assistant configuration for resume-based interviews
      const assistantConfig = {
        name: "Resume Interview Coach",
        firstMessage: `Hello! I'm your interview coach. I've reviewed your resume and the job description for ${jobDescription}. Let's have a conversation about your experience and how it relates to this position. Please tell me about your background and why you're interested in this role.`,
        voice: "male",
        style: "professional",
      };

      // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
      vapi.start(assistantConfig, assistantOverrides);
    } catch (error) {
      console.error("Error processing resume:", error);
      setIsAnalyzing(false);
      alert("Sorry, there was an error processing your resume. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Resume-Based Interview Practice</h2>
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
            disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-lg transition-all ${
              isAnalyzing || !resumeFile || !jobDescription.trim()
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
            <div className="whitespace-pre-line text-gray-700">
              {analysisResult}
            </div>
          </div>
        )}
        
        {/* Interview Interface */}
        {interviewStarted && (
          <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-xl font-bold mb-3 text-orange-800">Interview in Progress</h3>
            <p className="text-gray-700 mb-4">
              Your resume-based interview has started. Speak into your microphone to begin the conversation.
            </p>
            <button
              onClick={() => {
                vapi.stop();
                setInterviewStarted(false);
              }}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium"
            >
              End Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;