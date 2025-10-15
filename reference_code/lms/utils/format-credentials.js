/**
 * Utility script to format Google Cloud service account credentials for environment variables
 * 
 * Usage:
 * 1. Save your service account JSON file as 'service-account-key.json' in this directory
 * 2. Run: node format-credentials.js
 * 3. Copy the output to your .env.local file
 */

const fs = require('fs');
const path = require('path');

try {
  // Read the service account key file
  const credentialsPath = path.join(__dirname, '..', 'service-account-key.json');
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  
  // Convert to properly escaped JSON string for environment variable
  const escapedCredentials = JSON.stringify(credentials);
  
  console.log('Add this line to your .env.local file:');
  console.log('GOOGLE_TTS_CREDENTIALS=\'' + escapedCredentials + '\'');
  
  console.log('\nOr if you prefer to escape manually:');
  console.log('GOOGLE_TTS_CREDENTIALS=' + escapedCredentials
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n'));
} catch (error) {
  console.error('Error formatting credentials:', error.message);
  console.log('\nMake sure you have a valid service-account-key.json file in your project root.');
}