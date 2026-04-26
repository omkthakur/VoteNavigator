import { GoogleGenAI } from '@google/genai';
import { sanitizeLocation, parseAndValidateAIResponse } from './security';
import { trackEvent, GA_EVENTS } from './analytics';

const getAI = () => {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
};

const ai = getAI();

const languageMap = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
};

// ── Manifesto Fallback Data (multilingual) ─────────────────────────────────────
const manifestoFallback = {
  tamilNadu: {
    en: [
      { partyName: "Dravida Munnetra Kazhagam (DMK)", symbol: "🌅", manifestoSummary: "Focuses on state autonomy, abolishing NEET, ₹1,000 monthly entitlement for women, reducing fuel prices, and conducting a caste census." },
      { partyName: "AIADMK", symbol: "🍃", manifestoSummary: "Promises ₹3,000 monthly aid to women heads of economically backward families, a Supreme Court bench in Chennai, and major water interlinking projects." },
    ],
    hi: [
      { partyName: "द्रविड़ मुनेत्र कड़गम (DMK)", symbol: "🌅", manifestoSummary: "राज्य स्वायत्तता, नीट उन्मूलन, महिलाओं को ₹1,000 मासिक भत्ता, ईंधन मूल्य में कमी और जाति जनगणना पर ध्यान केंद्रित।" },
      { partyName: "AIADMK", symbol: "🍃", manifestoSummary: "पिछड़े परिवारों की महिला मुखियाओं को ₹3,000 मासिक सहायता, चेन्नई में सुप्रीम कोर्ट की पीठ और जल अंतर्संबंध परियोजनाओं का वादा।" },
    ],
    ta: [
      { partyName: "திராவிட முன்னேற்றக் கழகம் (DMK)", symbol: "🌅", manifestoSummary: "மாநில தன்னாட்சி, NEET ஒழிப்பு, பெண்களுக்கு மாதம் ₹1,000 உரிமை, எரிபொருள் விலை குறைப்பு மற்றும் சாதி கணக்கெடுப்பு." },
      { partyName: "AIADMK", symbol: "🍃", manifestoSummary: "பொருளாதாரத்தில் பின்தங்கிய குடும்பங்களின் பெண் தலைவர்களுக்கு மாதம் ₹3,000 நிதியுதவி, சென்னையில் உச்ச நீதிமன்ற பீடம்." },
    ],
  },
  generic: {
    en: [
      { partyName: "National Democratic Alliance", symbol: "🇮🇳", manifestoSummary: "Focuses on national infrastructure development, economic growth, and central welfare schemes for farmers and marginalized communities." },
      { partyName: "Opposition Coalition", symbol: "🏛️", manifestoSummary: "Advocates for greater state autonomy, regional language protection, and welfare programs for students and women." },
    ],
    hi: [
      { partyName: "राष्ट्रीय लोकतांत्रिक गठबंधन", symbol: "🇮🇳", manifestoSummary: "राष्ट्रीय बुनियादी ढांचे के विकास, आर्थिक विकास और किसानों व हाशिए के समुदायों के लिए केंद्रीय कल्याण योजनाओं पर ध्यान केंद्रित।" },
      { partyName: "विपक्षी गठबंधन", symbol: "🏛️", manifestoSummary: "अधिक राज्य स्वायत्तता, क्षेत्रीय भाषा संरक्षण और छात्रों व महिलाओं के लिए कल्याण कार्यक्रमों की वकालत।" },
    ],
    bn: [
      { partyName: "জাতীয় গণতান্ত্রিক জোট", symbol: "🇮🇳", manifestoSummary: "জাতীয় অবকাঠামো উন্নয়ন, অর্থনৈতিক প্রবৃদ্ধি এবং কৃষক ও প্রান্তিক সম্প্রদায়ের জন্য কেন্দ্রীয় কল্যাণ প্রকল্পে মনোনিবেশ।" },
      { partyName: "বিরোধী জোট", symbol: "🏛️", manifestoSummary: "বৃহত্তর রাজ্য স্বায়ত্তশাসন, আঞ্চলিক ভাষা সুরক্ষা এবং শিক্ষার্থী ও মহিলাদের জন্য কল্যাণ কর্মসূচির পক্ষে।" },
    ],
    te: [
      { partyName: "జాతీయ ప్రజాస్వామ్య కూటమి", symbol: "🇮🇳", manifestoSummary: "జాతీయ మౌలిక సదుపాయాల అభివృద్ధి, ఆర్థిక వృద్ధి మరియు రైతులు మరియు అట్టడుగు వర్గాలకు సంక్షేమ పథకాలపై దృష్టి." },
      { partyName: "ప్రతిపక్ష కూటమి", symbol: "🏛️", manifestoSummary: "అధిక రాష్ట్ర స్వయంప్రతిపత్తి, ప్రాంతీయ భాషా రక్షణ మరియు విద్యార్థులు మరియు మహిళలకు సంక్షేమ కార్యక్రమాలకు మద్దతు." },
    ],
    mr: [
      { partyName: "राष्ट्रीय लोकशाही आघाडी", symbol: "🇮🇳", manifestoSummary: "राष्ट्रीय पायाभूत सुविधांचा विकास, आर्थिक वाढ आणि शेतकरी व उपेक्षित समुदायांसाठी केंद्रीय कल्याण योजनांवर लक्ष केंद्रित." },
      { partyName: "विरोधी आघाडी", symbol: "🏛️", manifestoSummary: "अधिक राज्य स्वायत्तता, प्रादेशिक भाषा संरक्षण आणि विद्यार्थी व महिलांसाठी कल्याण कार्यक्रमांची बाजू." },
    ],
    ta: [
      { partyName: "தேசிய ஜனநாயக கூட்டணி", symbol: "🇮🇳", manifestoSummary: "தேசிய உள்கட்டமைப்பு வளர்ச்சி, பொருளாதார வளர்ச்சி, விவசாயிகள் மற்றும் ஓரங்கட்டப்பட்ட சமூகங்களுக்கான மத்திய நலத் திட்டங்கள்." },
      { partyName: "எதிர்க்கட்சி கூட்டணி", symbol: "🏛️", manifestoSummary: "அதிக மாநில தன்னாட்சி, பிராந்திய மொழி பாதுகாப்பு மற்றும் மாணவர்கள் மற்றும் பெண்களுக்கான நலத் திட்டங்களை ஆதரிக்கிறது." },
    ],
  },
};

// ── SIR Fallback Data (multilingual) ──────────────────────────────────────────
const sirFallback = {
  en: { title: "Special Intensive Revision (SSR/SIR)", overview: "The Special Summary Revision is currently underway to update electoral rolls. Citizens can add, delete, or modify their voter details.", thingsToKnow: ["Check your name in the draft electoral roll online or at your local polling booth.", "Claims and objections can be filed using Form 6, 7, and 8.", "Special camp days are usually held on weekends for on-the-spot registration."], documentsNeeded: ["Form 6 (for new voters)", "Proof of Date of Birth (Birth certificate, PAN, Aadhaar)", "Proof of Address (Aadhaar, Passport, Utility bills)", "Passport size color photograph"] },
  hi: { title: "विशेष गहन संशोधन (SSR/SIR)", overview: "मतदाता सूची को अपडेट करने के लिए विशेष सारांश संशोधन चल रहा है।", thingsToKnow: ["आप ऑनलाइन या स्थानीय मतदान केंद्र पर मसौदा मतदाता सूची में अपना नाम देख सकते हैं।", "दावे और आपत्तियां फॉर्म 6, 7 और 8 का उपयोग करके दर्ज की जा सकती हैं।", "ऑन-द-स्पॉट पंजीकरण के लिए आमतौर पर सप्ताहांत में विशेष शिविर आयोजित किए जाते हैं।"], documentsNeeded: ["फॉर्म 6 (नए मतदाताओं के लिए)", "जन्म तिथि का प्रमाण (जन्म प्रमाण पत्र, पैन, आधार)", "पता प्रमाण (आधार, पासपोर्ट, बिजली बिल)", "पासपोर्ट साइज रंगीन फोटो"] },
  bn: { title: "বিশেষ নিবিড় সংশোধন (SSR/SIR)", overview: "ভোটার তালিকা আপডেট করতে বিশেষ সারাংশ সংশোধন চলছে।", thingsToKnow: ["আপনি অনলাইনে বা স্থানীয় ভোটকেন্দ্রে খসড়া ভোটার তালিকায় আপনার নাম দেখতে পারেন।", "ফর্ম 6, 7 এবং 8 ব্যবহার করে দাবি এবং আপত্তি দাখিল করা যাবে।"], documentsNeeded: ["ফর্ম 6 (নতুন ভোটারদের জন্য)", "জন্ম তারিখের প্রমাণ (জন্ম সনদ, প্যান, আধার)", "ঠিকানার প্রমাণ (আধার, পাসপোর্ট, বিদ্যুৎ বিল)"] },
  te: { title: "ప్రత్యేక సమగ్ర సవరణ (SSR/SIR)", overview: "ఓటర్ల జాబితాను నవీకరించడానికి ప్రత్యేక సారాంశ సవరణ జరుగుతోంది.", thingsToKnow: ["మీరు ఆన్‌లైన్‌లో లేదా స్థానిక పోలింగ్ బూత్‌లో ముసాయిదా ఓటర్ల జాబితాలో మీ పేరు తనిఖీ చేయవచ్చు.", "క్లెయిమ్‌లు మరియు అభ్యంతరాలు ఫారం 6, 7 మరియు 8 ఉపయోగించి దాఖలు చేయవచ్చు."], documentsNeeded: ["ఫారం 6 (కొత్త ఓటర్లకు)", "పుట్టిన తేదీ రుజువు (పుట్టిన సర్టిఫికెట్, పాన్, ఆధార్)", "చిరునామా రుజువు (ఆధార్, పాస్‌పోర్ట్, విద్యుత్ బిల్లు)"] },
  mr: { title: "विशेष सखोल पुनरावृत्ती (SSR/SIR)", overview: "मतदार यादी अद्ययावत करण्यासाठी विशेष सारांश पुनरावृत्ती सुरू आहे.", thingsToKnow: ["तुम्ही ऑनलाइन किंवा स्थानिक मतदान केंद्रावर मसुदा मतदार यादीत तुमचे नाव तपासू शकता.", "दावे आणि आक्षेप फॉर्म 6, 7 आणि 8 वापरून दाखल केले जाऊ शकतात."], documentsNeeded: ["फॉर्म 6 (नवीन मतदारांसाठी)", "जन्मतारखेचा पुरावा (जन्म प्रमाणपत्र, पॅन, आधार)", "पत्त्याचा पुरावा (आधार, पासपोर्ट, वीज बिल)"] },
  ta: { title: "சிறப்பு சுருக்க முறை திருத்தம் (SSR/SIR)", overview: "வாக்காளர் பட்டியலை புதுப்பிக்க சிறப்பு சுருக்க முறை திருத்தம் நடைபெற்று வருகிறது.", thingsToKnow: ["உங்கள் பெயரை ஆன்லைனில் அல்லது உள்ளூர் வாக்குச்சாவடியில் முன்வடிவு வாக்காளர் பட்டியலில் சரிபார்க்கலாம்.", "படிவம் 6, 7 மற்றும் 8 பயன்படுத்தி கோரிக்கைகள் மற்றும் ஆட்சேபணைகள் தாக்கல் செய்யலாம்."], documentsNeeded: ["படிவம் 6 (புதிய வாக்காளர்களுக்கு)", "பிறந்த தேதி சான்று (பிறப்பு சான்றிதழ், PAN, ஆதார்)", "முகவரி சான்று (ஆதார், பாஸ்போர்ட், மின் கட்டண ரசீது)"] },
};

// ── Cache TTL: 24 hours ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const getCached = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage quota exceeded — skip caching silently
  }
};

/**
 * Fetches political party manifestos for a given location using Gemini.
 * Results are cached in localStorage for 24 hours per location+language.
 */
export const fetchManifestosForLocation = async (location, languageCode = 'en') => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing.');
  }

  const safeLocation = sanitizeLocation(location);
  const cacheKey = `manifesto_${safeLocation}_${languageCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetLanguage = languageMap[languageCode] || 'English';

  const prompt = `
    I am a voter in ${safeLocation}, India.
    List 2-3 major political parties that typically participate in elections in this specific region.
    Provide a brief, simplified summary of their core manifesto promises or key focus areas.

    IMPORTANT: You MUST write the ENTIRE response (partyName and manifestoSummary) in ${targetLanguage} language. Do not use English unless the party name is strictly known only in English.

    You MUST return the data STRICTLY as a JSON array of objects. Do not include any markdown formatting like \`\`\`json or \`\`\` in your response, just the raw JSON array.

    Format each object exactly like this:
    {
      "partyName": "Name of the Party (in ${targetLanguage})",
      "symbol": "A relevant single emoji representing the party",
      "manifestoSummary": "A concise 2-3 sentence summary of their key promises and focus areas (in ${targetLanguage})."
    }
  `;

  try {
    trackEvent(GA_EVENTS.FETCH_MANIFESTOS, { location: safeLocation, language: languageCode });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      tools: [{ googleSearch: {} }],
    });

    const result = parseAndValidateAIResponse(response.text, 'manifesto');
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching manifestos from Gemini:', error);

    const locLower = safeLocation.toLowerCase();
    const lang = languageCode in manifestoFallback.tamilNadu ? languageCode : 'en';

    if (locLower.includes('tamil nadu') || locLower.includes('chennai')) {
      return manifestoFallback.tamilNadu[lang] || manifestoFallback.tamilNadu.en;
    }
    return manifestoFallback.generic[lang] || manifestoFallback.generic.en;
  }
};

/**
 * Fetches Special Intensive Revision (SIR) details for a location.
 * Results are cached in localStorage for 24 hours per location+language.
 */
export const fetchSIRDetails = async (location, languageCode = 'en') => {
  if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    throw new Error('Gemini API Key is missing.');
  }

  const safeLocation = sanitizeLocation(location);
  const cacheKey = `sir_data_${safeLocation}_${languageCode}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const targetLanguage = languageMap[languageCode] || 'English';

  const prompt = `
    I am a voter in ${safeLocation}.
    Provide details about the Special Intensive Revision (SIR) or Special Summary Revision (SSR) of Electoral Rolls for this specific state/region.

    IMPORTANT: You MUST write the ENTIRE response in ${targetLanguage}. Every field must be in ${targetLanguage}.

    You MUST return the data STRICTLY as a JSON object. Do not include any markdown formatting like \`\`\`json.

    Format the object exactly like this:
    {
      "title": "Special Intensive Revision title in ${targetLanguage}",
      "overview": "A 2-3 sentence overview of what SIR is and current/upcoming dates if known, in ${targetLanguage}",
      "thingsToKnow": [
        "Point 1 about what voters should know, in ${targetLanguage}",
        "Point 2, in ${targetLanguage}"
      ],
      "documentsNeeded": [
        "Document 1 (e.g., Form 6, Aadhaar), in ${targetLanguage}",
        "Document 2, in ${targetLanguage}"
      ]
    }
  `;

  try {
    trackEvent(GA_EVENTS.FETCH_SIR, { location: safeLocation, language: languageCode });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      tools: [{ googleSearch: {} }],
    });

    const result = parseAndValidateAIResponse(response.text, 'sir');
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Error fetching SIR from Gemini:', error);
    return sirFallback[languageCode] || sirFallback.en;
  }
};
