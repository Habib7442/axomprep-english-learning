import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "User not authenticated" 
      }, { status: 401 });
    }

    const supabase = createSupabaseClient();
    
    // Parse the test history ID from the request body
    const { testId } = await request.json();
    
    if (!testId) {
      return NextResponse.json({ 
        success: false, 
        error: "Test ID is required" 
      }, { status: 400 });
    }
    
    // Delete the test history record
    const { error } = await supabase
      .from("mock_test_questions")
      .delete()
      .eq("id", testId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Test history deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting test history:", error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}