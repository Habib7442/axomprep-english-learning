"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { generateChapterExplanation } from "@/lib/ai-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { stripMarkdown } from "@/utils/markdown-stripper";
import { getSubtopicContent, saveSubtopicContent } from "@/lib/actions/chapter.actions";
import { vapi } from "@/lib/vapi.sdk";
import { configureAssistant } from "@/lib/utils";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

type AlertVariant = "default" | "destructive" | "success" | "warning" | "info";

interface TopicExplanationProps {
  subject: string;
  chapter: string;
  topic?: string;
  loading?: boolean; // Add loading prop
  onSubtopicVoiceTutor?: (subtopic: string) => void; // Add subtopic voice tutor callback
}

export const TopicExplanation = ({ subject, chapter, topic, loading: parentLoading, onSubtopicVoiceTutor }: TopicExplanationProps) => {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<{type: AlertVariant, title: string, message: string} | null>(null);

  // Load saved content on component mount
  useEffect(() => {
    const loadSavedContent = async () => {
      if (!topic) return;
      
      try {
        const savedContent = await getSubtopicContent({
          chapter_id: chapter,
          subtopic: topic,
          content_type: "explanation"
        });
        
        if (savedContent) {
          setExplanation(savedContent.content.text || "");
        }
      } catch (err) {
        console.error("Error loading saved content:", err);
      }
    };
    
    loadSavedContent();
  }, [chapter, topic]);

  // Auto-dismiss alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const handleGenerateExplanation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generateExplanation",
          subject,
          chapter,
          subtopic: topic,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate explanation");
      }
      
      const generatedExplanation = data.result || "";
      setExplanation(generatedExplanation);
      
      // Save to Supabase if it's a subtopic
      if (topic) {
        setSaving(true);
        try {
          await saveSubtopicContent({
            chapter_id: chapter,
            subtopic: topic,
            content_type: "explanation",
            content: { text: generatedExplanation },
            subject,
            class: "9" // Default to class 9, you might want to pass this as a prop
          });
        } catch (saveError: unknown) {
          console.error("Error saving explanation:", saveError);
          if (saveError instanceof Error) {
            setError(`Failed to save explanation: ${saveError.message}`);
          } else {
            setError("Failed to save explanation: Unknown error");
          }
        } finally {
          setSaving(false);
        }
      }
    } catch (err) {
      setError("Failed to generate explanation. Please try again.");
      console.error("Error generating explanation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceExplanation = async () => {
    if (!explanation) {
      setAlert({
        type: "warning",
        title: "No Explanation Generated",
        message: "Please generate an explanation first before requesting a voice tutor session."
      });
      return;
    }
    
    // If we have a callback function, call it to trigger the VAPI session
    if (onSubtopicVoiceTutor && topic) {
      onSubtopicVoiceTutor(topic);
      
      setAlert({
        type: "success",
        title: "Voice Tutor Session Started",
        message: `🎤 The AI tutor will now explain "${topic}" to you. You can ask questions about this topic during the session.`
      });
      
      // Scroll to the VAPI section after a short delay
      setTimeout(() => {
        const vapiSection = document.getElementById('vapi-section');
        if (vapiSection) {
          vapiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    } else {
      // Fallback to direct VAPI start if no callback is provided
      try {
        // Strip markdown from the explanation before sending to VAPI
        const cleanText = stripMarkdown(explanation);
        
        // Configure VAPI assistant for voice explanation
        const assistantOverrides = {
          variableValues: { 
            subject: subject,
            topic: topic ? `${chapter} - ${topic}` : chapter,
            explanation: cleanText,
            style: "casual" // Use "casual" style to match the ChapterInterface
          },
          clientMessages: ["transcript"],
          serverMessages: [],
        };
        
        // @ts-expect-error - Using the same pattern as CompanionComponent which works fine
        vapi.start(configureAssistant("female", "casual"), assistantOverrides); // Use "casual" style to match
        
        setAlert({
          type: "success",
          title: "Voice Tutor Session Started",
          message: `🎤 The AI tutor will now explain "${topic ? topic : chapter}" to you. You can ask questions about this topic during the session.`
        });
        
        // Scroll to the VAPI section after a short delay
        setTimeout(() => {
          const vapiSection = document.getElementById('vapi-section');
          if (vapiSection) {
            vapiSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      } catch (err) {
        console.error("Error starting voice explanation:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setAlert({
          type: "destructive",
          title: "Failed to Start Voice Explanation",
          message: `Error: ${errorMessage}`
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">
          {topic ? `Explanation: ${topic}` : `Chapter Explanation: ${chapter}`}
        </h3>
        <div className="flex gap-2">
          <Button 
            onClick={handleVoiceExplanation} 
            disabled={!explanation}
            className="bg-purple-600 hover:bg-purple-700"
          >
            🎓 Tutor Explain Topic
          </Button>
          <Button 
            onClick={handleGenerateExplanation} 
            disabled={loading || saving || parentLoading} // Disable when loading, saving, or parent is loading
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading || parentLoading ? "Loading..." : saving ? "Saving..." : "Generate Explanation"}
          </Button>
        </div>
      </div>

      {alert && (
        <div className="mb-4">
          <Alert variant={alert.type}>
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {explanation ? (
        <div className="prose max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="mb-3" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
              li: ({node, ...props}) => <li className="mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              em: ({node, ...props}) => <em className="italic" {...props} />,
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      ) : !loading && !error ? (
        <div className="text-gray-500 text-center py-8">
          <p>Click &quot;Generate Explanation&quot; to get a detailed explanation of this topic.</p>
        </div>
      ) : null}

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};