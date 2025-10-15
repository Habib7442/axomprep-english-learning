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

// CLIENT-SIDE FUNCTIONS (these can use React hooks)
/**
 * Get the current user's plan features (CLIENT VERSION)
 */
export async function getUserPlanFeatures(): Promise<PlanFeatures> {
  // In a client context, we would typically fetch this from an API
  // For now, we'll just return a default object
  // In a real implementation, this would call an API route
  return {
    companionsLimit: 1,
    interviewsPerMonth: 2,
    resumeAnalysis: false,
    advancedReporting: false,
    prioritySupport: false
  };
}

/**
 * Check if user can create a new companion based on their plan (CLIENT VERSION)
 */
export async function canCreateCompanion(): Promise<boolean> {
  // In a client context, we would typically fetch this from an API
  // For now, we'll just return true
  // In a real implementation, this would call an API route
  return true;
}

/**
 * Check if user can start an interview based on their plan and usage (CLIENT VERSION)
 */
export async function canStartInterview(): Promise<boolean> {
  // In a client context, we would typically fetch this from an API
  // For now, we'll just return true
  // In a real implementation, this would call an API route
  return true;
}

/**
 * Check if user has access to a specific feature (CLIENT VERSION)
 */
export async function hasFeature(feature: FeatureType): Promise<boolean> {
  // In a client context, we would typically fetch this from an API
  // For now, we'll just return false
  // In a real implementation, this would call an API route
  return false;
}

/**
 * Get user's current plan name (CLIENT VERSION)
 */
export async function getUserPlan(): Promise<PlanType> {
  // In a client context, we would typically fetch this from an API
  // For now, we'll just return 'free'
  // In a real implementation, this would call an API route
  return 'free';
}