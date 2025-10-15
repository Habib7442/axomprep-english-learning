"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";
import { revalidatePath } from "next/cache";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();
  const supabase = createSupabaseClient();

  // Check if user can create a companion by calling our API
  try {
    // In a real implementation, we would check the user's permissions directly
    // For now, we'll just allow creation but in a real app you would implement proper checks
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing?action=can-create-companion`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!data.canCreate) {
      throw new Error("You've reached your companion limit for your current plan. Please upgrade to create more AI Tutors.");
    }
  } catch (error) {
    // If we can't check permissions, we'll allow creation
    console.error("Error checking companion creation permission:", error);
  }

  const { data, error } = await supabase
    .from("companions")
    .insert({ ...formData, author })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");

  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  const supabase = createSupabaseClient();

  let query = supabase.from("companions").select();

  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error.message);

  return companions;
};

export const getCompanion = async (id: string) => {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) return console.log(error);

  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
    const { userId } = await auth();
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.from('session_history')
        .insert({
            companion_id: companionId,
            user_id: userId,
        })

    if(error) throw new Error(error.message);

    return data;
}

export const getRecentSessions = async (limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserSessions = async (userId: string, limit = 10) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('session_history')
        .select(`companions:companion_id (*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if(error) throw new Error(error.message);

    return data.map(({ companions }) => companions);
}

export const getUserCompanions = async (userId: string) => {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
        .from('companions')
        .select()
        .eq('author', userId)

    if(error) throw new Error(error.message);

    return data;
}

export const newCompanionPermissions = async () => {
  try {
    // Call our API to check if user can create a companion
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/billing?action=can-create-companion`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return data.canCreate;
  } catch (error) {
    console.error("Error checking companion creation permission:", error);
    // If we can't check permissions, we'll allow creation
    return true;
  }
}

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: userId,
  });
  if (error) {
    throw new Error(error.message);
  }
  // Revalidate the path to force a re-render of the page

  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { userId } = await auth();
  if (!userId) return;
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

// Function to check if a companion is bookmarked
export const isCompanionBookmarked = async (companionId: string) => {
  const { userId } = await auth();
  if (!userId) return false;
  
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("companion_id", companionId)
    .eq("user_id", userId)
    .maybeSingle();
    
  if (error) {
    console.error("Error checking if companion is bookmarked:", error);
    return false;
  }
  
  return !!data;
};

// It's almost the same as getUserCompanions, but it's for the bookmarked companions
export const getBookmarkedCompanions = async (userId: string) => {
  const supabase = createSupabaseClient();
  // First try a simple query to see if we can fetch bookmarks
  const { data: bookmarks, error: bookmarksError } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId);
    
  if (bookmarksError) {
    console.error("Error fetching bookmarks:", bookmarksError.message, bookmarksError.details, bookmarksError.hint);
    return [];
  }
  
  // If we have bookmarks, get the companion details
  if (bookmarks && bookmarks.length > 0) {
    const companionIds = bookmarks.map(bookmark => bookmark.companion_id);
    const { data: companions, error: companionsError } = await supabase
      .from("companions")
      .select("*")
      .in("id", companionIds);
      
    if (companionsError) {
      console.error("Error fetching companions:", companionsError.message, companionsError.details, companionsError.hint);
      return [];
    }
    
    return companions || [];
  }
  
  return [];
};