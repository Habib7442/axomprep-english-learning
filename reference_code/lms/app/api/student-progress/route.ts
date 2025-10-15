import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User not authenticated" 
      }, { status: 401 });
    }

    const supabase = createSupabaseClient();
    
    // Parse query parameters
    const url = new URL(request.url);
    const chapterId = url.searchParams.get("chapterId");
    
    // Map chapter ID to chapter name
    const chapterName = chapterId === "1" ? "Matter in Our Surroundings" : chapterId;
    
    // Get student progress
    let query = supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId);

    // Filter by chapterId if provided
    if (chapterId) {
      query = query.eq("chapter_id", chapterName);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({ 
      success: true, 
      data
    });
  } catch (error) {
    console.error("Error fetching student progress:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}