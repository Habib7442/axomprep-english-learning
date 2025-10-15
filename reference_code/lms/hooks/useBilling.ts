"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { PlanType, PlanFeatures, FeatureType } from "@/lib/billing";

export const useBilling = () => {
  const [plan, setPlan] = useState<PlanType>('free');
  const [features, setFeatures] = useState<PlanFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    // Don't fetch if auth is not loaded or user is not signed in
    if (!isLoaded || !userId) {
      if (!userId) {
        // User is signed out, set default values
        setPlan('free');
        setFeatures({
          companionsLimit: 0,
          interviewsPerMonth: 0,
          resumeAnalysis: false,
          advancedReporting: false,
          prioritySupport: false
        });
      }
      setLoading(false);
      return;
    }

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
        // Set default values on error
        setPlan('free');
        setFeatures({
          companionsLimit: 1,
          interviewsPerMonth: 2,
          resumeAnalysis: false,
          advancedReporting: false,
          prioritySupport: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, [isLoaded, userId]);

  const canCreateCompanionHook = async () => {
    // If not authenticated, return false
    if (!isLoaded || !userId) return false;
    
    try {
      const response = await fetch('/api/billing?action=can-create-companion');
      const data = await response.json();
      return data.canCreate;
    } catch (error) {
      console.error("Error checking companion creation permission:", error);
      return false;
    }
  };

  const canStartInterviewHook = async () => {
    // If not authenticated, return false
    if (!isLoaded || !userId) return false;
    
    try {
      const response = await fetch('/api/billing?action=can-start-interview');
      const data = await response.json();
      return data.canStart;
    } catch (error) {
      console.error("Error checking interview start permission:", error);
      return false;
    }
  };

  const hasFeatureHook = async (feature: FeatureType) => {
    // If not authenticated, return false
    if (!isLoaded || !userId) return false;
    
    try {
      const response = await fetch(`/api/billing?action=has-feature&feature=${feature}`);
      const data = await response.json();
      return data.hasFeature;
    } catch (error) {
      console.error("Error checking feature access:", error);
      return false;
    }
  };

  return {
    plan,
    features,
    loading,
    canCreateCompanion: canCreateCompanionHook,
    canStartInterview: canStartInterviewHook,
    hasFeature: hasFeatureHook
  };
};