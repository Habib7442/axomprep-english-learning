"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FeatureType, PlanType, PlanFeatures } from "@/lib/billing";

export default function BillingTestPage() {
  const [plan, setPlan] = useState<PlanType>('free');
  const [features, setFeatures] = useState<PlanFeatures | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        // Fetch plan
        const planResponse = await fetch('/api/billing?action=plan');
        const planData = await planResponse.json();
        
        // Fetch features
        const featuresResponse = await fetch('/api/billing?action=features');
        const featuresData = await featuresResponse.json();
        
        setPlan(planData.plan);
        setFeatures(featuresData.features);
      } catch (error) {
        console.error("Error fetching billing info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-lg">Loading billing information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feature test button component
  const FeatureTestButton = ({ 
    feature, 
    label
  }: { 
    feature: FeatureType; 
    label: string;
  }) => {
    const [access, setAccess] = React.useState<boolean | null>(null);
    const [loading, setLoading] = React.useState(false);
    
    const checkAccess = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/billing?action=has-feature&feature=${feature}`);
        const data = await response.json();
        setAccess(data.hasFeature);
      } catch (error) {
        console.error("Error checking feature access:", error);
        setAccess(false);
      } finally {
        setLoading(false);
      }
    };
    
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold mb-2">{label}</h3>
        {access === null ? (
          <button 
            onClick={checkAccess}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg disabled:opacity-50"
          >
            {loading ? "Checking..." : "Check Access"}
          </button>
        ) : (
          <div className={`text-center py-2 rounded-lg font-bold ${access ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {access ? "ACCESS GRANTED" : "ACCESS DENIED"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-center">Billing System Test</h1>
          <div></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Your Current Plan</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Plan Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Current Plan:</span>
                    <span className="font-bold capitalize">{plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Companions Limit:</span>
                    <span className="font-bold">{features?.companionsLimit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Interviews per Month:</span>
                    <span className="font-bold">{features?.interviewsPerMonth}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Feature Access</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Resume Analysis:</span>
                    <span className="font-bold">{features?.resumeAnalysis ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Advanced Reporting:</span>
                    <span className="font-bold">{features?.advancedReporting ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Priority Support:</span>
                    <span className="font-bold">{features?.prioritySupport ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Feature Access Tests</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FeatureTestButton 
                feature="resume_analysis" 
                label="Resume Analysis" 
              />
              <FeatureTestButton 
                feature="advanced_reporting" 
                label="Advanced Reporting" 
              />
              <FeatureTestButton 
                feature="priority_support" 
                label="Priority Support" 
              />
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/subscription">
              <button className="bg-gradient-to-r from-[#FF6B35] to-[#FF914D] hover:from-[#FF844B] hover:to-[#FFB088] text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg">
                Manage Subscription
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}