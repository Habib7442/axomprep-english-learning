import { NextResponse } from "next/server";
// Import the Google Cloud Text-to-Speech client
import textToSpeech from "@google-cloud/text-to-speech";
import util from "util";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { text, language = "en-US" } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    
    // Initialize the Text-to-Speech client with explicit credentials
    // This approach works when you can't set environment variables
    let client;
    
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use default credentials if environment variable is set
      client = new textToSpeech.TextToSpeechClient();
    } else if (process.env.GOOGLE_TTS_CREDENTIALS) {
      // Use credentials from environment variable (JSON string)
      try {
        const credentials = JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS);
        client = new textToSpeech.TextToSpeechClient({ credentials });
      } catch (parseError) {
        console.error("Error parsing GOOGLE_TTS_CREDENTIALS:", parseError);
        return NextResponse.json({ 
          error: "Invalid JSON in GOOGLE_TTS_CREDENTIALS environment variable. Please check the format." 
        }, { status: 500 });
      }
    } else {
      // Try to load from a local file (for development)
      try {
        const credentialsPath = path.join(process.cwd(), "service-account-key.json");
        client = new textToSpeech.TextToSpeechClient({ keyFilename: credentialsPath });
      } catch (fileError) {
        // If no credentials are available, return a helpful error message
        return NextResponse.json({ 
          error: "Missing Google Cloud credentials. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable or add service-account-key.json to your project root." 
        }, { status: 500 });
      }
    }
    
    // Configure the request
    const requestConfig = {
      input: { text },
      voice: { 
        languageCode: language,
        ssmlGender: "NEUTRAL" as const
      },
      audioConfig: { 
        audioEncoding: "MP3" as const
      },
    };
    
    // Perform the text-to-speech request
    const [response] = await client.synthesizeSpeech(requestConfig);
    
    if (!response.audioContent) {
      throw new Error("Failed to generate audio content");
    }
    
    // Convert audio content to base64 for sending in JSON response
    const audioBase64 = Buffer.from(response.audioContent as string).toString("base64");
    
    // Return the audio data
    return NextResponse.json({ 
      success: true,
      audioContent: audioBase64,
      audioFormat: "mp3"
    });
  } catch (error) {
    console.error("TTS API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: "Failed to generate speech: " + errorMessage }, { status: 500 });
  }
}