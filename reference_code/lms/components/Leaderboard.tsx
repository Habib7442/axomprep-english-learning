"use client";

import React, { useEffect, useState } from "react";
import { getChapterLeaderboard } from "@/lib/actions/chapter.actions";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  time: string;
  avatar: string;
}

interface LeaderboardProps {
  chapterId: string;
  chapterName: string;
}

export const Leaderboard = ({ chapterId, chapterName }: LeaderboardProps) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getChapterLeaderboard(chapterId);
        
        // Transform data to match our component's interface
        const transformedData = data.map((entry: { score: number; time_taken: number }, index: number) => ({
          rank: index + 1,
          name: `Student ${index + 1}`,
          score: entry.score,
          time: `${Math.floor(entry.time_taken / 60)}:${(entry.time_taken % 60).toString().padStart(2, '0')}`,
          avatar: `S${index + 1}`
        }));
        
        setLeaderboardData(transformedData);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        
        // Fallback to mock data
        setLeaderboardData([
          {
            rank: 1,
            name: "Aditya Kumar",
            score: 95,
            time: "12:45",
            avatar: "AK"
          },
          {
            rank: 2,
            name: "Priya Sharma",
            score: 92,
            time: "13:20",
            avatar: "PS"
          },
          {
            rank: 3,
            name: "Rohan Patel",
            score: 89,
            time: "11:30",
            avatar: "RP"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">{chapterName} - Leaderboard</h2>
          <p className="text-gray-600">Top performers in this chapter test</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left">Rank</th>
                <th className="py-3 px-6 text-left">Student</th>
                <th className="py-3 px-6 text-left">Score</th>
                <th className="py-3 px-6 text-left">Time</th>
                <th className="py-3 px-6 text-left">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaderboardData.map((entry) => (
                <tr 
                  key={entry.rank} 
                  className={entry.name === "You" ? "bg-blue-50" : ""}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {entry.rank <= 3 ? (
                        <span className="text-xl">
                          {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                        </span>
                      ) : (
                        <span className="font-medium">#{entry.rank}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="font-medium text-blue-800">{entry.avatar}</span>
                      </div>
                      <span className={entry.name === "You" ? "font-bold text-blue-600" : ""}>
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium">{entry.score}%</span>
                  </td>
                  <td className="py-4 px-6">
                    <span>{entry.time}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          entry.score >= 90 ? "bg-green-500" : 
                          entry.score >= 75 ? "bg-yellow-500" : 
                          "bg-red-500"
                        }`}
                        style={{ width: `${entry.score}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t">
          <h3 className="text-lg font-medium mb-4">Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Your Rank</p>
              <p className="text-2xl font-bold text-blue-600">#6</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-2xl font-bold text-green-600">78%</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Improvement Needed</p>
              <p className="text-2xl font-bold text-purple-600">12%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};