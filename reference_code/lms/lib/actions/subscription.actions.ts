"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

/**
 * Get user's subscription status
 */
export async function getUserSubscription() {
  const { userId } = await auth();
  
  if (!userId) {
    return { 
      plan: 'free',
      features: {
        companionsLimit: 1,
        interviewsPerMonth: 2,
        resumeAnalysis: false,
        mockTests: false,
        flashcards: false,
        advancedReporting: false,
        prioritySupport: false
      }
    };
  }

  // In a real implementation, you would check the user's subscription status
  // This is a simplified version that just returns default values
  // In practice, you would integrate with Clerk's billing system
  
  try {
    const supabase = createSupabaseClient();
    
    // Get user's plan from our API
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing?action=plan`);
    const planData = await response.json();
    
    const featuresResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing?action=features`);
    const featuresData = await featuresResponse.json();
    
    const plan = planData.plan;
    const features = featuresData.features;
    
    // Get user's usage data
    const { data: companions, error: companionsError } = await supabase
      .from('companions')
      .select('id', { count: 'exact' })
      .eq('author', userId);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { data: sessions, error: sessionsError } = await supabase
      .from('session_history')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth);

    const companionCount = companions?.length || 0;
    const sessionCount = sessions?.length || 0;

    return {
      plan,
      usage: {
        companions: companionCount,
        interviews: sessionCount
      },
      features
    };
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return { 
      plan: 'free',
      features: {
        companionsLimit: 1,
        interviewsPerMonth: 2,
        resumeAnalysis: false,
        mockTests: false,
        flashcards: false,
        advancedReporting: false,
        prioritySupport: false
      }
    };
  }
}

/**
 * Upgrade user's subscription
 */
export async function upgradeSubscription(plan: string) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // In a real implementation, you would integrate with Clerk's billing system
  // to handle the actual subscription upgrade process
  
  try {
    // This is a placeholder for the actual subscription upgrade logic
    // You would use Clerk's API to manage subscriptions
    
    // For now, we'll just revalidate the path to refresh the UI
    revalidatePath("/subscription");
    revalidatePath("/my-journey");
    
    return { success: true, message: "Subscription upgraded successfully" };
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    throw new Error("Failed to upgrade subscription");
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelSubscription() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // In a real implementation, you would integrate with Clerk's billing system
  // to handle the actual subscription cancellation process
  
  try {
    // This is a placeholder for the actual subscription cancellation logic
    // You would use Clerk's API to manage subscriptions
    
    // For now, we'll just revalidate the path to refresh the UI
    revalidatePath("/subscription");
    revalidatePath("/my-journey");
    
    return { success: true, message: "Subscription cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}