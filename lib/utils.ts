import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { TextSegment } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Splits text content into segments for vector storage and search
export const splitIntoSegments = (
  text: string,
  segmentSize: number = 500, // Maximum words per segment
  overlapSize: number = 50, // Words to overlap between segments for context
): TextSegment[] => {
  if (segmentSize <= 0) throw new Error("segmentSize must be greater than 0");
  if (overlapSize < 0 || overlapSize >= segmentSize) throw new Error("overlapSize must be >= 0 and < segmentSize");

  const words = text.split(/\s+/).filter((word) => word.length > 0);
  const segments: TextSegment[] = [];

  let segmentIndex = 0;
  let startIndex = 0;

  while (startIndex < words.length) {
    const endIndex = Math.min(startIndex + segmentSize, words.length);
    const segmentWords = words.slice(startIndex, endIndex);
    const segmentText = segmentWords.join(" ");

    segments.push({
      text: segmentText,
      segmentIndex,
      wordCount: segmentWords.length,
    });

    segmentIndex++;

    if (endIndex >= words.length) break;
    startIndex = endIndex - overlapSize;
  }

  return segments;
};

export async function parsePDFFile(file: File) {
  try {
    const pdfjsLib = await import("pdfjs-dist");

    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    // Render first page as cover image
    const firstPage = await pdfDocument.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Could not get canvas context");

    await firstPage.render({
      canvas: canvas,
      viewport: viewport,
    }).promise;

    const coverDataURL = canvas.toDataURL("image/png");

    // Extract text from all pages
    let fullText = "";
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item) => "str" in item)
        .map((item) => (item as { str: string }).str)
        .join(" ");
      fullText += pageText + "\n";
    }

    const segments = splitIntoSegments(fullText);
    await pdfDocument.destroy();

    return {
      content: segments,
      cover: coverDataURL,
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Voice configuration
export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const configureAssistant = (voice: string = "female", style: string = "casual") => {
  const voiceId =
    (voices as any)[voice]?.[style] || "sarah";

  const modePrompts = {
    tutor: "You are a helpful tutor. Explain concepts from the provided material. Be conversational, encouraging, and ask the student if they understand before moving to the next point.",
    panic: "You are a high-pressure exam coach. Fire rapid questions from the material. Don't waste time on long explanations. Keep it fast, competitive, and quiz-heavy.",
    debate: "You are a sharp debater who DISAGREES with the core points. Challenge the student's understanding. Make them defend the material. Be professional but adversarial."
  };

  const systemPrompt = (modePrompts as any)[style] || modePrompts.tutor;

  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage:
      "Hello, let's start the session. Today we'll be talking about {{topic}}.",
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 0.8,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `${systemPrompt}
  
                    Tutor Guidelines:
                    Stick to the given topic - {{topic}} and subject - {{subject}} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your responses short, like in a real voice conversation.
                    Speak slowly and clearly so the student can understand you easily.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
        },
      ],
    },
  };
  
  return vapiAssistant;
};