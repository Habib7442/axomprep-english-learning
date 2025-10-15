# Text-to-Speech Implementation Guide

This document explains how to set up and use the text-to-speech functionality in your learning management system.

## Overview

The text-to-speech feature allows students to hear explanations of topics in their preferred language, including Indian languages and Bengali for Bangladesh users.

## Features Implemented

1. **Smart Actions on Topic Rows**:
   - 🎤 Voice Explain: AI reads explanation aloud
   - 🧩 Practice 1 question: Generate a single practice question
   - 🧾 View examples/flashcards: Show examples or flashcards

2. **Voice Explanation Button** in TopicExplanation component
3. **API Endpoint** for text-to-speech generation
4. **Multi-language Support** including Bengali (Bangladesh)
5. **Markdown Processing**: Automatic removal of markdown syntax for better speech quality

## Setup Instructions

### 1. Google Cloud Setup

1. Create a Google Cloud Project
2. Enable the Text-to-Speech API
3. Create a service account and download the JSON key file
4. Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to point to your JSON key file

### 2. Environment Variables

Add one of the following to your `.env.local` file:

```env
# Option 1: Path to service account key file (Recommended for Development)
GOOGLE_APPLICATION_CREDENTIALS=C:/path/to/your/service-account-key.json

# Option 2: JSON credentials as string (Recommended for Production)
# NOTE: You must properly escape quotes and newlines in the JSON string
GOOGLE_TTS_CREDENTIALS={"type":"service_account","project_id":"your-project-id","private_key_id":"key-id","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"service-account@project-id.iam.gserviceaccount.com","client_id":"client-id","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/service-account%40project-id.iam.gserviceaccount.com"}

# Option 3: Place service-account-key.json in your project root (Development Only)
```

### 3. Supported Languages

The implementation supports multiple languages including:
- English (en-US)
- Bengali (Bangladesh) (bn-BD)
- Hindi (hi-IN)
- Tamil (ta-IN)
- Telugu (te-IN)
- Kannada (kn-IN)
- Malayalam (ml-IN)
- Marathi (mr-IN)
- Gujarati (gu-IN)
- Punjabi (pa-IN)

## Markdown Processing

To improve the quality of text-to-speech, the system automatically removes markdown syntax before sending text to the TTS service. This includes:

- Headers (### Header)
- Bold and italic text (**bold**, *italic*)
- Code blocks and inline code
- Links and images
- Lists (ordered and unordered)
- Blockquotes

This ensures that students hear clean, natural speech without markdown artifacts like "hash hash hash".

## Authentication Options

### Option 1: Environment Variable with File Path (Recommended for Development)
1. Download your service account key JSON file
2. Set the environment variable with the full path to the file:
   ```bash
   # Windows (PowerShell) - Use forward slashes or escape backslashes
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:/path/to/your/service-account-key.json"
   
   # macOS/Linux
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
   ```
3. Restart your development server

### Option 2: Environment Variable with JSON String (Recommended for Production)
This is more complex because JSON strings need to be properly escaped for environment variables.

1. Copy the contents of your service account key JSON file
2. Escape the JSON properly:
   - Replace each newline with `\\n`
   - Escape quotes with `\"`
   - Or use a tool to convert JSON to a single-line escaped string

Example of properly escaped JSON:
```env
GOOGLE_TTS_CREDENTIALS="{\"type\":\"service_account\",\"project_id\":\"your-project-id\",\"private_key_id\":\"key-id\",\"private_key\":\"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n\",\"client_email\":\"service-account@project-id.iam.gserviceaccount.com\"}"
```

### Option 3: Local File (Development Only)
1. Download your service account key JSON file
2. Rename it to `service-account-key.json`
3. Place it in your project root directory

## Common JSON Formatting Issues

### Issue 1: Invalid JSON Format
**Error**: "Expected property name or '}' in JSON at position 1"
**Solution**: 
- Make sure the entire JSON is wrapped in single quotes if using double quotes inside
- Or properly escape all double quotes with backslashes
- Ensure there are no trailing commas
- Validate your JSON with a JSON validator

### Issue 2: Newline Characters
**Error**: "Unexpected token in JSON"
**Solution**:
- Replace actual newlines with `\\n`
- The private key will have many newlines that need to be escaped

### Issue 3: Trailing Commas
**Error**: "Unexpected token } in JSON"
**Solution**:
- Remove any trailing commas before closing braces `}` or brackets `]`

## How It Works

1. **User Interaction**:
   - Click the 🎤 icon on any topic row
   - Or click the "🎤 Voice Explain" button in the TopicExplanation component

2. **Backend Processing**:
   - The system generates an explanation for the topic using the AI service
   - Markdown syntax is stripped from the text for better speech quality
   - Sends the clean text to the TTS API endpoint
   - Google Cloud Text-to-Speech converts the text to audio
   - Audio is returned as base64 encoded MP3 data

3. **Frontend Playback**:
   - The browser plays the audio using the Web Audio API

## Files Modified

1. **[lib/ai-service.ts](file://e:\Web%20Dev\lms\lib\ai-service.ts)**:
   - Added `generateSpeechFromText` function (placeholder)

2. **[components/ChapterInterface.tsx](file://e:\Web%20Dev\lms\components\ChapterInterface.tsx)**:
   - Added smart action buttons to topic rows
   - Implemented voice explanation handler
   - Added practice question and examples handlers
   - Added markdown stripping for TTS

3. **[components/TopicExplanation.tsx](file://e:\Web%20Dev\lms\components\TopicExplanation.tsx)**:
   - Added voice explanation button
   - Implemented audio playback functionality
   - Added markdown stripping for TTS

4. **[app/api/tts/route.ts](file://e:\Web%20Dev\lms\app\api\tts\route.ts)**:
   - Created API endpoint for text-to-speech generation
   - Integrated Google Cloud Text-to-Speech API
   - Added multiple authentication options
   - Improved error handling

5. **[utils/markdown-stripper.ts](file://e:\Web%20Dev\lms\utils\markdown-stripper.ts)**:
   - Created utility function to remove markdown syntax

## Customization

### Language Selection

To change the language, modify the `language` parameter in the TTS API calls:

```javascript
// For Bengali (Bangladesh)
language: "bn-BD"

// For Hindi (India)
language: "hi-IN"

// For English (US)
language: "en-US"
```

### Voice Preferences

You can customize voice characteristics by modifying the voice configuration in the TTS API route:

```javascript
voice: { 
  languageCode: language,
  ssmlGender: "NEUTRAL" // Can be "MALE", "FEMALE", or "NEUTRAL"
}
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**:
   - Ensure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
   - Verify the service account has Text-to-Speech API access
   - Check that the JSON key file is valid and not corrupted

2. **JSON Parsing Errors**:
   - "Expected property name or '}' in JSON at position 1" - Check JSON formatting
   - Make sure to properly escape quotes and newlines
   - Use a JSON validator to check your credentials

3. **Audio Not Playing**:
   - Check browser console for errors
   - Ensure the browser supports MP3 audio playback
   - Verify the audio content is properly base64 encoded

4. **Language Not Supported**:
   - Check the Google Cloud Text-to-Speech documentation for supported languages
   - Verify the language code is correct

### Error Messages

1. **"Could not load the default credentials"**:
   - Solution: Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable
   - Or use `GOOGLE_TTS_CREDENTIALS` with JSON string
   - Or place `service-account-key.json` in project root

2. **"Missing Google Cloud credentials"**:
   - Solution: Follow one of the authentication options above

3. **"Invalid JSON in GOOGLE_TTS_CREDENTIALS"**:
   - Solution: Check the formatting of your JSON credentials
   - Ensure proper escaping of quotes and newlines

## Security Considerations

1. **API Key Management**: Never expose Google Cloud credentials in client-side code
2. **Rate Limiting**: Implement rate limiting to prevent abuse of the TTS API
3. **Input Validation**: Validate all text inputs to prevent injection attacks
4. **Audio Content**: Sanitize audio content before playback

## Performance Optimization

1. **Caching**: Cache generated audio files to reduce API calls
2. **Batch Processing**: Process multiple text segments in batch
3. **Compression**: Use compressed audio formats when possible
4. **Preloading**: Preload audio for frequently accessed topics

## Development vs Production

### Development
- Use local `service-account-key.json` file or `GOOGLE_APPLICATION_CREDENTIALS`
- Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable

### Production
- Use `GOOGLE_TTS_CREDENTIALS` environment variable with JSON string
- Never commit service account keys to version control
- Use deployment platform's secret management (Vercel, Netlify, etc.)

## Testing

To test the TTS functionality:

1. Start your development server
2. Navigate to any chapter page
3. Click the 🎤 icon on any topic row
4. Or click "🎤 Voice Explain" in the TopicExplanation component
5. You should hear clean audio without markdown artifacts

For actual audio playback, ensure you've set up the credentials correctly.

## Quick Fix for JSON Formatting

If you're having trouble with JSON formatting, try this approach:

1. Create a simple Node.js script to convert your JSON:
   ```javascript
   const fs = require('fs');
   const credentials = JSON.parse(fs.readFileSync('service-account-key.json', 'utf8'));
   console.log(JSON.stringify(credentials));
   ```

2. Run it and copy the output to your `.env.local` file:
   ```bash
   node convert-json.js
   ```

3. Wrap the output in single quotes in your `.env.local`:
   ```env
   GOOGLE_TTS_CREDENTIALS='{"type":"service_account",...}'
   ```