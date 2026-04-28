import 'dotenv/config';
import { getManifestosAction, getSIRDetailsAction } from './src/app/actions.js';

(async () => {
  try {
    console.log('--- Running getManifestosAction ---');
    const manifestos = await getManifestosAction('Tamil Nadu', 'en');
    console.log('Manifestos result:', JSON.stringify(manifestos, null, 2));

    console.log('\n--- Running getSIRDetailsAction ---');
    const sir = await getSIRDetailsAction('Tamil Nadu', 'en');
    console.log('SIR result:', JSON.stringify(sir, null, 2));
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }
})();
