import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const modelsToTry = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.0-pro'
];

async function testModels() {
  for (const model of modelsToTry) {
    console.log(`\n--- Trying model: ${model} ---`);
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1' });
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Hi',
      });
      console.log(`✅ SUCCESS with ${model}:`, response.text);
      return; // Stop if we find one
    } catch (e) {
      console.log(`❌ FAILED with ${model}: ${e.message}`);
      if (e.status === 429) {
          console.log('   (Rate limit/Quota issue)');
      }
    }
  }
}

testModels();
