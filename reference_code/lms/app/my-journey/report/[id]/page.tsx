"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Add interface for interview reports
interface InterviewReport {
  id: string;
  created_at: string;
  user_id: string;
  session_id: string;
  interview_type: string;
  topic: string;
  job_description: string | null;
  transcript: Array<{ role: string; content: string }>;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  score: number;
  feedback: string;
  recommendations: string[];
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrappedParams = await params;
      setReportId(unwrappedParams.id);
    };
    
    unwrapParams();
  }, [params]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      
      try {
        setLoading(true);

        // Fetch the specific interview report
        const { data: reportData, error: reportError } = await supabase
          .from('interview_reports')
          .select('*')
          .eq('id', reportId)
          .single();

        if (reportError) {
          throw new Error(reportError.message || "Failed to fetch interview report");
        }

        setReport(reportData);
      } catch (err) {
        setError("Failed to load report. Please try again.");
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId, supabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-center">Interview Report</h1>
            <div></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg">Loading your report...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => router.back()} 
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-center">Interview Report</h1>
            <div></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
                {error || "Report not found"}
              </div>
              <button 
                onClick={() => router.back()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => router.back()} 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Reports
          </button>
          <h1 className="text-3xl font-bold text-center">Interview Report</h1>
          <div></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {report.interview_type === "resume-based" 
                      ? "Resume-Based Interview" 
                      : report.interview_type === "companion-based"
                      ? `AI Tutor Session: ${report.topic}`
                      : report.topic}
                  </h2>
                  <p className="opacity-90">
                    {formatDate(report.created_at)} • Score: {report.score}/100
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-black">
                    {report.interview_type === "resume-based" 
                      ? "Resume-Based" 
                      : report.interview_type === "companion-based"
                      ? "AI Tutor"
                      : "Topic-Based"}
                  </span>
                </div>
              </div>

            </div>
            
            <div className="p-6">
              {/* Score Visualization */}
              <div className="mb-8">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Overall Score</span>
                  <span className="font-bold">{report.score}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-4 rounded-full" 
                    style={{ width: `${report.score}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Feedback */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-800">Overall Feedback</h3>
                <p className="text-gray-700 whitespace-pre-line">{report.feedback}</p>
              </div>
              
              {/* Strengths */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-green-600">Strengths</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Areas for Improvement */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-orange-600">Areas for Improvement</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">→</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Improvement Suggestions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-purple-600">Suggestions for Improvement</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-purple-500 mr-2">💡</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Recommendations */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-blue-600">Recommendations</h3>
                <ul className="space-y-2">
                  {report.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Transcript Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Conversation Transcript</h3>
                <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {report.transcript.map((message, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg ${
                          message.role === "assistant"
                            ? "bg-blue-100 border border-blue-200"
                            : "bg-orange-100 border border-orange-200"
                        }`}
                      >
                        <div className="font-bold mb-2">
                          {message.role === "assistant" ? "AI Tutor" : "You"}
                        </div>
                        <p>{message.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}