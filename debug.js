import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function runDiagnostics() {
  console.log('=========================================');
  console.log('   VoteNavigator Diagnostics Console     ');
  console.log('=========================================');

  console.log('\n[1] Checking Environment Variables...');
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (apiKey) {
    console.log('✅ GEMINI_API_KEY is SET (Starts with: ' + apiKey.substring(0, 5) + '...)');
  } else {
    console.error('❌ GEMINI_API_KEY is MISSING in your .env file or environment.');
  }

  if (gaId) {
    console.log('✅ NEXT_PUBLIC_GA_MEASUREMENT_ID is SET (' + gaId + ')');
  } else {
    console.warn('⚠️ NEXT_PUBLIC_GA_MEASUREMENT_ID is MISSING (Analytics will not track).');
  }

  console.log('\n[2] Testing Gemini API Connection...');
  if (!apiKey) {
    console.error('❌ Cannot test API because the key is missing.');
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Reply with the word "SUCCESS" if you receive this.' }] }],
      });
      console.log('✅ Gemini API is ONLINE and RESPONDING. Response:', response?.text || 'No text');
    } catch (error) {
      console.error('❌ Gemini API Connection FAILED.');
      console.error('Exact Error Message:', error.message);
      if (error.status === 429) {
        console.error('-> QUOTA EXCEEDED: You have hit the Google Gemini API limits.');
      } else if (error.status === 403) {
        console.error('-> UNAUTHORIZED: Your API key is invalid or lacks permissions.');
      }
    }
  }

  console.log('\n=========================================');
  console.log('   Diagnostics Complete                  ');
  console.log('=========================================');
}

runDiagnostics();
