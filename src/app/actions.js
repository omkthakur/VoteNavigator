"use server";

import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeLocation, parseAndValidateAIResponse } from '@/utils/security';

/**
 * Server-side function to fetch political party manifestos using Gemini.
 * This avoids the need for NEXT_PUBLIC_ variables at build time.
 */
export async function getManifestosAction(location, languageCode = 'en') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[GEMINI ERROR] API Key is missing on server.');
    throw new Error('AI Service configuration missing.');
  }

  // Use a more robust model configuration
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'
    // Temporarily disabling googleSearch to verify if it's the cause of failure in certain regions
    // tools: [{ googleSearch: {} }] 
  });

  const safeLocation = sanitizeLocation(location);
  const targetLanguage = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', 
    te: 'Telugu', mr: 'Marathi', ta: 'Tamil'
  }[languageCode] || 'English';

  const prompt = `
    I am a voter in ${safeLocation}, India.
    List 2-3 major political parties that typically participate in elections in this specific region.
    Provide a brief, simplified summary of their core manifesto promises or key focus areas.
    
    IMPORTANT: You MUST write the ENTIRE response (partyName and manifestoSummary) in ${targetLanguage}.
    
    Return the data STRICTLY as a JSON array of objects.
    
    Format:
    [
      {
        "partyName": "Name",
        "symbol": "Emoji",
        "manifestoSummary": "2-3 sentences"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('Empty response from AI');
    }

    return parseAndValidateAIResponse(text, 'manifesto');
  } catch (error) {
    console.error('[GEMINI ERROR] Detailed Error:', error.message || error);
    // If it's a safety block or other AI error, we provide a more descriptive error
    throw new Error(error.message || 'Failed to fetch data from AI service.');
  }
}

/**
 * Server-side function to fetch Special Intensive Revision (SIR) details.
 */
export async function getSIRDetailsAction(location, languageCode = 'en') {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('AI Service configuration missing.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash'
    // tools: [{ googleSearch: {} }] 
  });

  const safeLocation = sanitizeLocation(location);
  const targetLanguage = {
    en: 'English', hi: 'Hindi', bn: 'Bengali', 
    te: 'Telugu', mr: 'Marathi', ta: 'Tamil'
  }[languageCode] || 'English';

  const prompt = `
    I am a voter in ${safeLocation}.
    Provide details about the Special Intensive Revision (SIR) or Special Summary Revision (SSR) of Electoral Rolls for this specific state/region.
    
    IMPORTANT: You MUST write the ENTIRE response in ${targetLanguage}.
    
    Return the data STRICTLY as a JSON object.
    
    Format:
    {
      "title": "Title",
      "overview": "2-3 sentences",
      "thingsToKnow": ["Point 1", "Point 2"],
      "documentsNeeded": ["Doc 1", "Doc 2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return parseAndValidateAIResponse(text, 'sir');
  } catch (error) {
    console.error('Gemini SIR Action Error:', error.message || error);
    throw new Error(error.message || 'Failed to fetch SIR details.');
  }
}
