"use client";

import React, { useState, useEffect } from "react";
import { PlanFeatures, PlanType } from "@/lib/billing";
import Link from "next/link";

const UsageLimits = () => {
  const [plan, setPlan] = useState<PlanType>('free');
  const [features, setFeatures] = useState<PlanFeatures | null>(null);
  const [usage, setUsage] = useState<{ companions: number; interviews: number }>({ companions: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        // Fetch all billing data from API
        const [planResponse, featuresResponse, usageResponse] = await Promise.all([
          fetch('/api/billing?action=plan'),
          fetch('/api/billing?action=features'),
          fetch('/api/billing?action=usage')
        ]);

        const planData = await planResponse.json();
        const featuresData = await featuresResponse.json();
        
        // For usage, we need to make separate calls since it's more complex
        const [companionsResponse, interviewsResponse] = await Promise.all([
          fetch('/api/billing?action=companions-count'),
          fetch('/api/billing?action=interviews-count')
        ]);

        const companionsData = await companionsResponse.json();
        const interviewsData = await interviewsResponse.json();

        setPlan(planData.plan);
        setFeatures(featuresData.features);
        setUsage({
          companions: companionsData.count || 0,
          interviews: interviewsData.count || 0
        });
      } catch (error) {
        console.error("Error fetching usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get plan display name
  const getPlanDisplayName = () => {
    switch (plan) {
      case 'free': return 'Free';
      case 'basic': return 'Basic Core Learner';
      case 'pro': return 'Pro Companion';
      default: return 'Free';
    }
  };

  // Get plan color
  const getPlanColor = () => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Usage</h2>
          <p className="text-gray-600">Track your plan limits and usage</p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getPlanColor()}`}>
          {getPlanDisplayName()}
        </span>
      </div>

      <div className="space-y-5">
        {/* Companions Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">AI Tutors</span>
            <span className="text-sm text-gray-500">
              {usage.companions} / {features?.companionsLimit || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] h-2 rounded-full" 
              style={{ width: `${Math.min(100, (usage.companions / (features?.companionsLimit || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Interviews Usage */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">Interviews (This Month)</span>
            <span className="text-sm text-gray-500">
              {usage.interviews} / {features?.interviewsPerMonth || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] h-2 rounded-full" 
              style={{ width: `${Math.min(100, (usage.interviews / (features?.interviewsPerMonth || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {plan !== 'pro' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/subscription" 
              className="flex-1 bg-gradient-to-r from-[#FF6B35] to-[#FF914D] hover:from-[#FF844B] hover:to-[#FFB088] text-white font-semibold py-2.5 px-4 rounded-lg shadow-lg transition-all duration-300 text-center text-sm"
            >
              Upgrade Plan
            </Link>
            <Link 
              href="/companions" 
              className="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-center text-sm"
            >
              View AI Tutors
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageLimits;