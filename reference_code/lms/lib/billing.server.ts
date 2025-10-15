import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "./supabase";

/**
 * User plan types
 */
export type PlanType = 'free' | 'basic' | 'pro';

/**
 * Feature types for interview platform
 */
export type FeatureType = 
  | 'companions_limit'
  | 'interviews_per_month'
  | 'resume_analysis'
  | 'advanced_reporting'
  | 'priority_support';

/**
 * Plan feature limits for interview platform
 */
export interface PlanFeatures {
  companionsLimit: number;
  interviewsPerMonth: number;
  resumeAnalysis: boolean;
  advancedReporting: boolean;
  prioritySupport: boolean;
}

/**
 * Get the current user's plan features (SERVER VERSION)
 */
export async function getUserPlanFeaturesServer(): Promise<PlanFeatures> {
  try {
    const { userId, has } = await auth();
    
    if (!userId) {
      return {
        companionsLimit: 0,
        interviewsPerMonth: 0,
        resumeAnalysis: false,
        advancedReporting: false,
        prioritySupport: false
      };
    }

    // Check if user has pro plan (Pro Companion - $20/month)
    if (has({ plan: 'pro' })) {
      return {
        companionsLimit: 50,
        interviewsPerMonth: 100, // Unlimited
        resumeAnalysis: true,
        advancedReporting: true,
        prioritySupport: true
      };
    }

    // Check if user has basic plan (Basic Core Learner - $10/month)
    if (has({ plan: 'basic' })) {
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
    console.error("Error in getUserPlanFeaturesServer:", error);
    // Return default free plan features on error
    return {
      companionsLimit: 1,
      interviewsPerMonth: 2,
      resumeAnalysis: false,
      advancedReporting: false,
      prioritySupport: false
    };
  }
}

/**
 * Check if user can create a new companion based on their plan (SERVER VERSION)
 */
export async function canCreateCompanionServer(): Promise<boolean> {
  try {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    if (!userId) return false;

    // Check if user has pro plan first (unlimited companions)
    if (has({ plan: 'pro' })) {
      return true;
    }

    // For basic plan, check companion limit
    let companionLimit = 0;
    if (has({ plan: 'basic' })) {
      companionLimit = 10;
    } else if (has({ feature: "1_companion_limit" })) {
      companionLimit = 1;
    }

    // Check current companion count
    const { data: companions, error } = await supabase
      .from('companions')
      .select('id', { count: 'exact' })
      .eq('author', userId);

    if (error) {
      console.error("Error checking companion count:", error);
      return false;
    }

    const companionCount = companions?.length || 0;
    return companionCount < companionLimit;
  } catch (error) {
    console.error("Error in canCreateCompanionServer:", error);
    return false;
  }
}

/**
 * Check if user can start an interview based on their plan and usage (SERVER VERSION)
 */
export async function canStartInterviewServer(): Promise<boolean> {
  try {
    const { userId, has } = await auth();
    const supabase = createSupabaseClient();

    if (!userId) return false;

    // Check if user has pro plan (unlimited interviews)
    if (has({ plan: 'pro' })) {
      return true;
    }

    // Determine interview limit based on plan
    let interviewLimit = 0;
    if (has({ plan: 'basic' })) {
      interviewLimit = 10;
    } else if (has({ feature: "1_companion_limit" })) {
      interviewLimit = 2;
    }

    // Check current session count for this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    
    const { data: sessions, error } = await supabase
      .from('session_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);

    if (error) {
      console.error("Error checking session count:", error);
      return false;
    }

    const sessionCount = sessions?.length || 0;
    return sessionCount < interviewLimit;
  } catch (error) {
    console.error("Error in canStartInterviewServer:", error);
    return false;
  }
}

/**
 * Check if user has access to a specific feature (SERVER VERSION)
 */
export async function hasFeatureServer(feature: FeatureType): Promise<boolean> {
  try {
    const { userId, has } = await auth();

    if (!userId) return false;

    switch (feature) {
      case 'companions_limit':
        return await canCreateCompanionServer();
      case 'interviews_per_month':
        return await canStartInterviewServer();
      case 'resume_analysis':
        return has({ plan: 'basic' }) || has({ plan: 'pro' });
      case 'advanced_reporting':
        return has({ plan: 'pro' });
      case 'priority_support':
        return has({ plan: 'pro' });
      default:
        return false;
    }
  } catch (error) {
    console.error("Error in hasFeatureServer:", error);
    return false;
  }
}

/**
 * Get user's current plan name (SERVER VERSION)
 */
export async function getUserPlanServer(): Promise<PlanType> {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return 'free';
    }

    if (has({ plan: 'pro' })) {
      return 'pro';
    } else if (has({ plan: 'basic' })) {
      return 'basic';
    } else {
      return 'free';
    }
  } catch (error) {
    console.error("Error in getUserPlanServer:", error);
    return 'free';
  }
}

/**
 * Get user's usage data (SERVER VERSION)
 */
export async function getUserUsageServer(): Promise<{ companions: number; interviews: number }> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { companions: 0, interviews: 0 };
    }

    try {
      const supabase = createSupabaseClient();
      
      // Get companion count
      const { data: companions, error: companionsError } = await supabase
        .from('companions')
        .select('id', { count: 'exact' })
        .eq('author', userId);

      // Get interview count for this month
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: sessions, error: sessionsError } = await supabase
        .from('session_history')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth);

      return {
        companions: companions?.length || 0,
        interviews: sessions?.length || 0
      };
    } catch (error) {
      console.error("Error fetching usage data:", error);
      return { companions: 0, interviews: 0 };
    }
  } catch (error) {
    console.error("Error in getUserUsageServer:", error);
    return { companions: 0, interviews: 0 };
  }
}