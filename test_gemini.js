import 'dotenv/config';
import { getManifestosAction } from './src/app/actions.js';

(async () => {
  try {
    const result = await getManifestosAction('Tamil Nadu', 'en');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Error calling Gemini:', e);
  }
})();
