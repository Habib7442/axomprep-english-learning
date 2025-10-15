# Credential Formatting Utility

This utility helps format Google Cloud service account credentials for use in environment variables.

## Usage

1. Place your service account JSON key file in the project root and name it `service-account-key.json`

2. Run the formatting script:
   ```bash
   node utils/format-credentials.js
   ```

3. Copy the output to your `.env.local` file

## Output Example

The script will output something like:
```
Add this line to your .env.local file:
GOOGLE_TTS_CREDENTIALS='{"type":"service_account","project_id":"your-project-id",...}'
```

## Why This Is Needed

Environment variables with complex JSON values need to be properly formatted to avoid parsing errors like:
- "Expected property name or '}' in JSON at position 1"
- "Unexpected token in JSON"

The utility ensures your credentials are properly escaped for use in environment variables.