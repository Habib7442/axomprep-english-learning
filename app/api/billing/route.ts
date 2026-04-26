import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Define feature types
type FeatureType = 
  | 'companions_limit'
  | 'interviews_per_month'
  | 'resume_analysis'
  | 'advanced_reporting'
  | 'priority_support';

// Define plan features
interface PlanFeatures {
  companionsLimit: number;
  interviewsPerMonth: number;
  resumeAnalysis: boolean;
  advancedReporting: boolean;
  prioritySupport: boolean;
}

// Get user's plan features based on their subscription tier in the database
const getUserPlanFeatures = async (userId: string): Promise<PlanFeatures> => {
  try {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const tier = profile?.subscription_tier || 'free';
    
    if (tier === 'enterprise' || tier === 'pro') {
      return {
        companionsLimit: 50,
        interviewsPerMonth: 100,
        resumeAnalysis: true,
        advancedReporting: true,
        prioritySupport: true
      };
    }
    
    if (tier === 'basic') {
      return {
        companionsLimit: 10,
        interviewsPerMonth: 10,
        resumeAnalysis: true,
        advancedReporting: false,
        prioritySupport: false
      };
    }
    
    // Free plan
    return {
      companionsLimit: 1,
      interviewsPerMonth: 2,
      resumeAnalysis: false,
      advancedReporting: false,
      prioritySupport: false
    };
  } catch (error) {
    console.error("Error fetching user plan features:", error);
    return {
      companionsLimit: 1,
      interviewsPerMonth: 2,
      resumeAnalysis: false,
      advancedReporting: false,
      prioritySupport: false
    };
  }
};

// Check if user can start an interview based on their plan and usage
const canStartInterview = async (userId: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    
    // Get user's plan features
    const planFeatures = await getUserPlanFeatures(userId);
    
    // For pro users, unlimited interviews
    if (planFeatures.interviewsPerMonth === 100) {
      return true;
    }
    
    // Check current session count for this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { count, error } = await supabase
      .from('chat_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);

    if (error) {
      console.error("Error checking session count:", error);
      return false;
    }

    const sessionCount = count || 0;
    return sessionCount < planFeatures.interviewsPerMonth;
  } catch (error) {
    console.error("Error in canStartInterview:", error);
    return false;
  }
};

// Check if user can add another companion (book)
const canAddCompanion = async (userId: string): Promise<boolean> => {
  try {
    const supabase = await createClient();
    const planFeatures = await getUserPlanFeatures(userId);
    
    const { count, error } = await supabase
      .from('books')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error("Error checking companion count:", error);
      return false;
    }

    return (count || 0) < planFeatures.companionsLimit;
  } catch (error) {
    console.error("Error in canAddCompanion:", error);
    return false;
  }
};

// Check if user has access to a specific feature
const hasFeature = async (userId: string, feature: FeatureType): Promise<boolean> => {
  try {
    const planFeatures = await getUserPlanFeatures(userId);

    switch (feature) {
      case 'companions_limit':
        return await canAddCompanion(userId);
      case 'interviews_per_month':
        return await canStartInterview(userId);
      case 'resume_analysis':
        return planFeatures.resumeAnalysis;
      case 'advanced_reporting':
        return planFeatures.advancedReporting;
      case 'priority_support':
        return planFeatures.prioritySupport;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error in hasFeature:", error);
    return false;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    switch (action) {
      case 'has-feature':
        const feature = searchParams.get('feature');
        if (!feature) {
          return NextResponse.json({ error: "Feature parameter is required" }, { status: 400 });
        }
        
        // Validate that the feature is a valid FeatureType
        const validFeatures: FeatureType[] = [
          'companions_limit',
          'interviews_per_month',
          'resume_analysis',
          'advanced_reporting',
          'priority_support'
        ];
        
        if (!validFeatures.includes(feature as FeatureType)) {
          return NextResponse.json({ error: "Invalid feature" }, { status: 400 });
        }
        
        const hasFeatureAccess = await hasFeature(user.id, feature as FeatureType);
        return NextResponse.json({ hasFeature: hasFeatureAccess });
        
      case 'can-start-interview':
        const canStart = await canStartInterview(user.id);
        return NextResponse.json({ canStart });
        
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in billing API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}