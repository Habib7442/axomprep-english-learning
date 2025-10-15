"use client";

import React from "react";
import Link from "next/link";
import { PlanType } from "@/lib/billing";

interface PlanRestrictionProps {
  currentPlan: PlanType;
  requiredPlan: PlanType;
  featureName: string;
  children: React.ReactNode;
}

const PlanRestriction = ({
  currentPlan,
  requiredPlan,
  featureName,
  children
}: PlanRestrictionProps) => {
  // Determine if the user has access to the feature
  const hasAccess = () => {
    if (requiredPlan === 'free') return true;
    if (requiredPlan === 'basic' && currentPlan !== 'free') return true;
    if (requiredPlan === 'pro' && currentPlan === 'pro') return true;
    return false;
  };

  // Get the plan name for upgrade message
  const getPlanName = (plan: PlanType) => {
    switch (plan) {
      case 'free': return 'Free';
      case 'basic': return 'Basic';
      case 'pro': return 'Pro';
      default: return 'Basic';
    }
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
      <div className="flex flex-col items-center justify-center">
        <svg 
          className="w-12 h-12 text-yellow-500 mb-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <h3 className="text-lg font-bold text-yellow-800 mb-1">
          {featureName} is not available on your current plan
        </h3>
        <p className="text-yellow-700 mb-4">
          Upgrade to {getPlanName(requiredPlan)} plan to access this feature.
        </p>
        <Link 
          href="/subscription" 
          className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] hover:from-[#FF844B] hover:to-[#FFB088] text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
};

export default PlanRestriction;