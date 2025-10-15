import { createSupabaseClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

// Types for our data models
export interface ChapterScore {
  id: string;
  created_at: string;
  user_id: string;
  chapter_id: string;
  chapter_name: string;
  score: number;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  subject: string;
  class: string;
}

export interface LeaderboardEntry {
  id: string;
  created_at: string;
  user_id: string;
  chapter_id: string;
  chapter_name: string;
  score: number;
  time_taken: number;
  rank?: number;
  subject: string;
  class: string;
}

export interface Flashcard {
  id: string;
  created_at: string;
  chapter_id: string;
  front_text: string;
  back_text: string;
  subject: string;
  class: string;
}

export interface StudentProgress {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  chapter_id: string;
  chapter_name: string;
  mastery_percentage: number;
  last_practiced: string;
  topic_mastery: Record<string, number> | null;
  subject: string;
  class: string;
}

// Chapter Scores Service
export const chapterScoresService = {
  // Save a new chapter score
  async saveScore(scoreData: Omit<ChapterScore, "id" | "created_at" | "user_id">) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("chapter_scores")
      .insert({
        ...scoreData,
        user_id: userId,
      })
      .select();

    if (error) throw new Error(error.message);

    return data[0] as ChapterScore;
  },

  // Get all scores for a user
  async getUserScores() {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("chapter_scores")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data as ChapterScore[];
  },

  // Get scores for a specific chapter
  async getChapterScores(chapterId: string) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("chapter_scores")
      .select("*")
      .eq("chapter_id", chapterId)
      .order("score", { ascending: false });

    if (error) throw new Error(error.message);

    return data as ChapterScore[];
  },

  // Get a user's scores for a specific chapter
  async getUserChapterScores(chapterId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("chapter_scores")
      .select("*")
      .eq("user_id", userId)
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return data as ChapterScore[];
  },
};

// Leaderboard Service
export const leaderboardService = {
  // Get leaderboard for a chapter
  async getChapterLeaderboard(chapterId: string, limit = 10) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("chapter_scores")
      .select("user_id, score, time_taken, created_at")
      .eq("chapter_id", chapterId)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    // Add rank to each entry
    return data.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    })) as LeaderboardEntry[];
  },

  // Get user's rank in a chapter
  async getUserRank(chapterId: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    // First get the user's score
    const { data: userScoreData, error: userScoreError } = await supabase
      .from("chapter_scores")
      .select("score")
      .eq("chapter_id", chapterId)
      .eq("user_id", userId)
      .maybeSingle();

    if (userScoreError) throw new Error(userScoreError.message);
    if (!userScoreData) return null;

    // Then count how many users have a higher score
    const { count, error: countError } = await supabase
      .from("chapter_scores")
      .select("*", { count: "exact" })
      .eq("chapter_id", chapterId)
      .gt("score", userScoreData.score);

    if (countError) throw new Error(countError.message);

    return (count || 0) + 1;
  },
};

// Flashcards Service
export const flashcardsService = {
  // Save a new flashcard
  async saveFlashcard(flashcardData: Omit<Flashcard, "id" | "created_at">) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("flashcards")
      .insert(flashcardData)
      .select();

    if (error) throw new Error(error.message);

    return data[0] as Flashcard;
  },

  // Get flashcards for a chapter
  async getChapterFlashcards(chapterId: string) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("flashcards")
      .select("*")
      .eq("chapter_id", chapterId);

    if (error) throw new Error(error.message);

    return data as Flashcard[];
  },

  // Delete a flashcard
  async deleteFlashcard(flashcardId: string) {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("flashcards")
      .delete()
      .eq("id", flashcardId);

    if (error) throw new Error(error.message);

    return data;
  },
};

// Student Progress Service
export const studentProgressService = {
  // Update or create student progress
  async updateProgress(progressData: Omit<StudentProgress, "id" | "created_at" | "updated_at" | "user_id">) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    // Check if progress already exists for this user and chapter
    const { data: existingProgress, error: fetchError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("chapter_id", progressData.chapter_id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);

    let result;
    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from("student_progress")
        .update({
          ...progressData,
          updated_at: new Date().toISOString(),
          last_practiced: new Date().toISOString(),
        })
        .eq("id", existingProgress.id)
        .select();

      if (error) throw new Error(error.message);
      result = data[0];
    } else {
      // Create new progress entry
      const { data, error } = await supabase
        .from("student_progress")
        .insert({
          ...progressData,
          user_id: userId,
          last_practiced: new Date().toISOString(),
        })
        .select();

      if (error) throw new Error(error.message);
      result = data[0];
    }

    return result as StudentProgress;
  },

  // Get student progress
  async getProgress(chapterId?: string) {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    let query = supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId);

    if (chapterId) {
      query = query.eq("chapter_id", chapterId);
    }

    const { data, error } = await query;

    if (error) throw new Error(error.message);

    return data as StudentProgress[];
  },

  // Get weak topics (mastery < 70%)
  async getWeakTopics() {
    const { userId } = await auth();
    if (!userId) throw new Error("User not authenticated");

    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", userId)
      .lt("mastery_percentage", 70);

    if (error) throw new Error(error.message);

    return data as StudentProgress[];
  },
};

// Comprehensive service that combines all functionality
export const lmsService = {
  chapterScores: chapterScoresService,
  leaderboard: leaderboardService,
  flashcards: flashcardsService,
  studentProgress: studentProgressService,
};