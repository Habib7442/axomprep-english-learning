"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import UsageLimits from "@/components/UsageLimits";

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

export default function MyJourneyPage() {
  const [interviewReports, setInterviewReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchInterviewReports = async () => {
      try {
        setLoading(true);

        // Fetch interview reports
        const { data: reportsData, error: reportsError } = await supabase
          .from('interview_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (reportsError) {
          throw new Error(reportsError.message || "Failed to fetch interview reports");
        }

        setInterviewReports(reportsData || []);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviewReports();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-center">My Interview Journey</h1>
            <div></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg">Loading your interview reports...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ← Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-center">My Interview Journey</h1>
            <div></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{error}</div>
              <Link href="/interview">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Start Interview Practice
                </button>
              </Link>
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
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-center">My Interview Journey</h1>
          <div className="flex gap-4">
            <Link href="/interview" className="text-blue-600 hover:text-blue-800">
              Practice
            </Link>
            <Link href="/companions" className="text-blue-600 hover:text-blue-800">
              Tutors
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          {/* Usage Limits Component */}
          <div className="mb-8">
            <UsageLimits />
          </div>
          
          {interviewReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Interview Reports Yet</h2>
              <p className="text-gray-600 mb-6">
                Complete an interview to generate your first detailed report with feedback and recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/interview">
                  <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                    Start Interview Practice
                  </button>
                </Link>
                <Link href="/companions">
                  <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                    Try AI Tutors
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {interviewReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h2 className="text-xl font-bold">
                          {report.interview_type === "resume-based" 
                            ? "Resume-Based Interview" 
                            : report.interview_type === "companion-based"
                            ? `AI Tutor: ${report.topic}`
                            : report.topic}
                        </h2>
                        <p className="text-gray-600">
                          {formatDate(report.created_at)} • Score: {report.score}/100
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {report.interview_type === "resume-based" 
                            ? "Resume-Based" 
                            : report.interview_type === "companion-based"
                            ? "AI Tutor"
                            : "Topic-Based"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Score Visualization */}
                    <div className="mt-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className="text-sm font-bold">{report.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full" 
                          style={{ width: `${report.score}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Key highlights */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h3 className="font-bold text-green-800 text-sm">Strengths</h3>
                        <p className="text-green-600 text-sm mt-1">{report.strengths.length} identified</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h3 className="font-bold text-orange-800 text-sm">Improvements</h3>
                        <p className="text-orange-600 text-sm mt-1">{report.improvements.length} suggestions</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h3 className="font-bold text-blue-800 text-sm">Recommendations</h3>
                        <p className="text-blue-600 text-sm mt-1">{report.recommendations.length} provided</p>
                      </div>
                    </div>
                    
                    {/* View Report Button */}
                    <div className="mt-6">
                      <Link href={`/my-journey/report/${report.id}`}>
                        <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg">
                          View Detailed Report
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}