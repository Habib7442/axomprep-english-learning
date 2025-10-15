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
    
    // Get all flashcards for the user
    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({ 
      success: true, 
      data
    });
  } catch (error) {
    console.error("Error fetching user flashcards:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}