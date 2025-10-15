"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

// Save chapter score
export const saveChapterScore = async (scoreData: {
  chapter_id: string;
  chapter_name: string;
  score: number;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  subject: string;
  class: string;
}) => {
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

  return data[0];
};

// Get user's chapter scores
export const getUserChapterScores = async (chapterId?: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  let query = supabase
    .from("chapter_scores")
    .select()
    .eq("user_id", userId);

  if (chapterId) {
    query = query.eq("chapter_id", chapterId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
};

// Get leaderboard for a chapter
export const getChapterLeaderboard = async (chapterId: string, limit = 10) => {
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
  }));
};

// Get leaderboard for a chapter based on mock test scores (highest score per user)
export const getChapterMockTestLeaderboard = async (chapterId: string, limit = 10) => {
  const supabase = createSupabaseClient();

  // First, get all mock test scores for the chapter
  const { data: allScores, error: scoresError } = await supabase
    .from("mock_test_questions")
    .select("user_id, test_score, created_at")
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  if (scoresError) throw new Error(scoresError.message);

  // Group scores by user and get the highest score for each user
  const userScoresMap = new Map();
  allScores.forEach((score) => {
    const userId = score.user_id;
    const testScore = score.test_score;
    
    if (!userScoresMap.has(userId) || userScoresMap.get(userId).test_score < testScore) {
      userScoresMap.set(userId, {
        user_id: userId,
        test_score: testScore,
        created_at: score.created_at
      });
    }
  });

  // Convert map to array and sort by score (descending)
  const userScores = Array.from(userScoresMap.values())
    .sort((a, b) => b.test_score - a.test_score)
    .slice(0, limit);

  // Add rank to each entry
  const leaderboardData = userScores.map((entry, index) => ({
    ...entry,
    rank: index + 1
  }));

  // Fetch user names for each entry
  const userIds = leaderboardData.map(entry => entry.user_id);
  const { data: usersData, error: usersError } = await supabase
    .from("companion_users")
    .select("id, name")
    .in("id", userIds);

  if (usersError) {
    console.error("Error fetching user names:", usersError);
    // Return leaderboard data without user names if there's an error
    return leaderboardData;
  }

  // Create a map of user IDs to names
  const userNamesMap = new Map();
  usersData.forEach(user => {
    userNamesMap.set(user.id, user.name);
  });

  // Add user names to leaderboard data
  const leaderboardDataWithNames = leaderboardData.map(entry => ({
    ...entry,
    user_name: userNamesMap.get(entry.user_id) || `User ${entry.user_id.substring(0, 10)}`
  }));

  return leaderboardDataWithNames;
};

// Update leaderboard table
export const updateLeaderboard = async (scoreData: {
  chapter_id: string;
  chapter_name: string;
  score: number;
  time_taken: number;
  subject: string;
  class: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  // First, get the user's name (you might want to store this in a user profile table)
  const { data: userData, error: userError } = await supabase
    .from("companion_users")
    .select("name")
    .eq("id", userId)
    .maybeSingle();

  if (userError) {
    console.error("Error fetching user data:", userError);
  }

  const userName = userData?.name || "Anonymous";

  const { data, error } = await supabase
    .from("leaderboard")
    .insert({
      ...scoreData,
      user_id: userId,
    })
    .select();

  if (error) throw new Error(error.message);

  return data[0];
};

// Get flashcards for a chapter
export const getChapterFlashcards = async (chapterId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  try {
    // Try to filter by both chapter_id and user_id
    const { data, error } = await supabase
      .from("flashcards")
      .select()
      .eq("chapter_id", chapterId)
      .eq("user_id", userId);

    if (error) throw error;

    return data;
  } catch (error) {
    // If user_id filtering fails, fall back to just chapter_id filtering
    console.warn("Could not filter flashcards by user_id, falling back to chapter_id only:", error);
    
    const { data, error: fallbackError } = await supabase
      .from("flashcards")
      .select()
      .eq("chapter_id", chapterId);

    if (fallbackError) throw fallbackError;

    return data;
  }
};

// Save flashcard
export const saveFlashcard = async (flashcardData: {
  chapter_id: string;
  front_text: string;
  back_text: string;
  subject: string;
  class: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  try {
    // Try to insert with user_id
    const { data, error } = await supabase
      .from("flashcards")
      .insert({
        ...flashcardData,
        user_id: userId,
      })
      .select();

    if (error) throw error;

    return data[0];
  } catch (error) {
    // If user_id insertion fails, fall back to inserting without user_id
    console.warn("Could not insert flashcard with user_id, falling back to insertion without user_id:", error);
    
    const { data, error: fallbackError } = await supabase
      .from("flashcards")
      .insert(flashcardData)
      .select();

    if (fallbackError) throw fallbackError;

    return data[0];
  }
};

// Update student progress with subtopic mastery tracking
export const updateStudentProgress = async (progressData: {
  chapter_id: string;
  chapter_name: string;
  mastery_percentage: number;
  topic_mastery?: Record<string, number>;
  subject: string;
  class: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  // Check if progress already exists for this user and chapter
  const { data: existingProgress, error: fetchError } = await supabase
    .from("student_progress")
    .select()
    .eq("user_id", userId)
    .eq("chapter_id", progressData.chapter_id)
    .maybeSingle();

  if (fetchError) throw new Error(fetchError.message);

  let result;
  if (existingProgress) {
    // Merge topic mastery data
    let updatedTopicMastery = existingProgress.topic_mastery || {};
    
    // If new topic mastery data is provided, merge it
    if (progressData.topic_mastery) {
      updatedTopicMastery = {
        ...updatedTopicMastery,
        ...progressData.topic_mastery
      };
    }
    
    // Update existing progress
    const { data, error } = await supabase
      .from("student_progress")
      .update({
        ...progressData,
        topic_mastery: updatedTopicMastery,
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

  return result;
};

// Get student progress
export const getStudentProgress = async (chapterId?: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  let query = supabase
    .from("student_progress")
    .select()
    .eq("user_id", userId);

  if (chapterId) {
    query = query.eq("chapter_id", chapterId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
};

// Define the question type
interface MockTestQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string; // Make userAnswer optional
}

// Save mock test questions with improved tracking
export const saveMockTestQuestions = async (testData: {
  chapter_id: string;
  chapter_name: string;
  subject: string;
  class: string;
  questions: MockTestQuestion[];
  test_score: number;
  time_taken: number;
  total_questions: number;
  correct_answers: number;
  is_retake?: boolean;
  // Add subtopic information
  subtopic?: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  // Extract user answers from questions
  const userAnswers: Record<number, string> = {};
  const questionsWithoutUserAnswers = testData.questions.map((q, index) => {
    if (q.userAnswer) {
      userAnswers[index] = q.userAnswer;
    }
    // Remove userAnswer property from the question object
    const { userAnswer, ...questionWithoutUserAnswer } = q;
    return questionWithoutUserAnswer;
  });

  const { data, error } = await supabase
    .from("mock_test_questions")
    .insert({
      ...testData,
      questions: questionsWithoutUserAnswers,
      user_answers: userAnswers,
      user_id: userId,
      is_retake: testData.is_retake || false,
      // Add subtopic field
      subtopic: testData.subtopic || null,
    })
    .select();

  if (error) throw new Error(error.message);

  // Update student progress with subtopic mastery and overall chapter mastery
  try {
    // Get existing progress
    const { data: existingProgress, error: fetchError } = await supabase
      .from("student_progress")
      .select()
      .eq("user_id", userId)
      .eq("chapter_id", testData.chapter_id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);

    let updatedSubtopicMastery = {};
    
    if (existingProgress && existingProgress.subtopic_mastery) {
      updatedSubtopicMastery = { ...existingProgress.subtopic_mastery };
    }
    
    // If subtopic is provided, update subtopic mastery
    if (testData.subtopic) {
      // Update the specific subtopic mastery
      updatedSubtopicMastery = {
        ...updatedSubtopicMastery,
        [testData.subtopic]: testData.test_score
      };
    }

    // Update or create progress entry with subtopic mastery and overall chapter mastery
    if (existingProgress) {
      await supabase
        .from("student_progress")
        .update({
          mastery_percentage: testData.test_score, // Update overall chapter mastery
          subtopic_mastery: updatedSubtopicMastery,
          updated_at: new Date().toISOString(),
          last_practiced: new Date().toISOString(),
        })
        .eq("id", existingProgress.id);
    } else {
      await supabase
        .from("student_progress")
        .insert({
          chapter_id: testData.chapter_id,
          chapter_name: testData.chapter_name,
          mastery_percentage: testData.test_score, // Set overall chapter mastery
          subtopic_mastery: updatedSubtopicMastery,
          subject: testData.subject,
          class: testData.class,
          user_id: userId,
          last_practiced: new Date().toISOString(),
        });
    }
  } catch (progressError) {
    console.error("Error updating student progress:", progressError);
  }

  return data[0];
};

// Get user's mock test questions
export const getUserMockTestQuestions = async (chapterId?: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  let query = supabase
    .from("mock_test_questions")
    .select()
    .eq("user_id", userId);

  if (chapterId) {
    query = query.eq("chapter_id", chapterId);
  }

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
};

// Get weakest topics for a student based on test history
export const getWeakestTopics = async (chapterId: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  // Get all mock test questions for this chapter and user
  const { data: testHistory, error } = await supabase
    .from("mock_test_questions")
    .select("*")
    .eq("user_id", userId)
    .eq("chapter_id", chapterId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // If no test history, return empty array
  if (!testHistory || testHistory.length === 0) {
    return [];
  }

  // Group tests by subtopic (simplified - in reality you'd need to map questions to subtopics)
  // For now, we'll just look at overall test scores
  const scores = testHistory.map(test => test.test_score);
  
  // Find tests with scores below 30%
  const weakPerformance = testHistory.filter(test => test.test_score < 30);
  
  // Return unique chapter names with weak performance
  const weakTopics = weakPerformance
    .map(test => ({
      chapter_name: test.chapter_name,
      score: test.test_score,
      created_at: test.created_at
    }))
    .filter((topic, index, self) => 
      index === self.findIndex(t => t.chapter_name === topic.chapter_name)
    );

  return weakTopics;
};

// Save subtopic content
export const saveSubtopicContent = async (contentData: {
  chapter_id: string;
  subtopic: string;
  content_type: string; // 'explanation', 'practice_questions', 'examples'
  content: Record<string, unknown> | Array<unknown>; // JSON content
  subject: string;
  class: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  // First, try to update existing content
  const { data: existingContent, error: fetchError } = await supabase
    .from("subtopic_content")
    .select()
    .eq("user_id", userId)
    .eq("chapter_id", contentData.chapter_id)
    .eq("subtopic", contentData.subtopic)
    .eq("content_type", contentData.content_type)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching existing content:", fetchError);
    throw new Error(`Error fetching existing content: ${fetchError.message}`);
  }

  let result;
  if (existingContent) {
    // Update existing content
    const { data, error } = await supabase
      .from("subtopic_content")
      .update({
        ...contentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingContent.id)
      .select();

    if (error) {
      console.error("Error updating content:", error);
      throw new Error(`Error updating content: ${error.message}`);
    }
    result = data[0];
  } else {
    // Insert new content
    const { data, error } = await supabase
      .from("subtopic_content")
      .insert({
        ...contentData,
        user_id: userId,
      })
      .select();

    if (error) {
      console.error("Error inserting content:", error);
      throw new Error(`Error inserting content: ${error.message}`);
    }
    result = data[0];
  }

  return result;
};

// Get subtopic content
export const getSubtopicContent = async (params: {
  chapter_id: string;
  subtopic: string;
  content_type: string;
}) => {
  const { userId } = await auth();
  if (!userId) throw new Error("User not authenticated");

  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("subtopic_content")
    .select()
    .eq("user_id", userId)
    .eq("chapter_id", params.chapter_id)
    .eq("subtopic", params.subtopic)
    .eq("content_type", params.content_type)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subtopic content:", error);
    throw new Error(`Error fetching subtopic content: ${error.message}`);
  }

  return data;
};
