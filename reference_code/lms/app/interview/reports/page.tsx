"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

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

const InterviewReportsPage = () => {
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('interview_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching reports:', error);
        } else {
          setReports(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Link href="/interview" className="text-blue-600 hover:text-blue-800">
              ← Back to Interview
            </Link>
            <h1 className="text-3xl font-bold text-center">Interview Reports</h1>
            <div></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <p className="text-lg">Loading your interview reports...</p>
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
          <Link href="/interview" className="text-blue-600 hover:text-blue-800">
            ← Back to Interview
          </Link>
          <h1 className="text-3xl font-bold text-center">Interview Reports</h1>
          <div></div>
        </div>
        <div className="max-w-4xl mx-auto">
          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Interview Reports Yet</h2>
              <p className="text-gray-600 mb-6">
                Complete an interview to generate your first detailed report with feedback and recommendations.
              </p>
              <Link href="/interview">
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                  Start Interview Practice
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {report.interview_type === "resume-based" 
                            ? "Resume-Based Interview" 
                            : report.topic}
                        </h2>
                        <p className="opacity-90">
                          {new Date(report.created_at).toLocaleDateString()} • Score: {report.score}/100
                        </p>
                      </div>
                      <div className="mt-4 md:mt-0">
                        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                          {report.interview_type === "resume-based" ? "Resume-Based" : "Topic-Based"}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewReportsPage;