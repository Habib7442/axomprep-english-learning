'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { TextSegment } from "@/types";

export async function createBook(data: {
  title: string;
  file_url: string;
  cover_url: string;
  page_count: number;
  segments: TextSegment[];
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Save Book to Database
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert({
        user_id: user.id,
        title: data.title,
        file_url: data.file_url,
        cover_url: data.cover_url,
        page_count: data.page_count,
      })
      .select()
      .single();

    if (bookError) throw bookError;

    // 2. Save Segments for RAG
    const segmentsToInsert = data.segments.map((seg, idx) => ({
      book_id: bookData.id,
      user_id: user.id,
      content: seg.text,
      segment_index: idx,
    }));

    const { error: segmentsError } = await supabase
      .from('book_segments')
      .insert(segmentsToInsert);

    if (segmentsError) throw segmentsError;

    revalidatePath("/dashboard");
    return { success: true, data: bookData };
  } catch (error: any) {
    console.error('Error in createBook action:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteBookAction(bookId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)
      .eq('user_id', user.id); // Security check

    if (error) throw error;

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteBook action:', error);
    return { success: false, error: error.message };
  }
}

export async function fetchBooksAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Error in fetchBooks action:', error);
    return { success: false, error: error.message };
  }
}
