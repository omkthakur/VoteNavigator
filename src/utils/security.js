/**
 * Security utilities for VoteNavigator
 * - Input sanitization to prevent prompt injection
 * - JSON schema validators for AI responses
 */

/**
 * Sanitizes a location string before embedding it in AI prompts.
 * Strips characters that could be used for prompt injection.
 * @param {string} location
 * @returns {string}
 */
export const sanitizeLocation = (location) => {
  if (typeof location !== 'string') return 'India';
  return location
    .replace(/[<>{}\\`|;'"]/g, '')   // strip injection chars
    .replace(/\n|\r|\t/g, ' ')        // collapse whitespace
    .trim()
    .slice(0, 120) || 'India';        // hard cap at 120 chars
};

/**
 * Validates that a parsed manifesto API response has the correct structure.
 * Filters out any malformed entries.
 * @param {unknown} data
 * @returns {Array<{partyName: string, symbol: string, manifestoSummary: string}>}
 */
export const validateManifestoResponse = (data) => {
  if (!Array.isArray(data)) throw new Error('Manifesto response must be an array');
  const valid = data.filter(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.partyName === 'string' && item.partyName.length > 0 &&
      typeof item.symbol === 'string' &&
      typeof item.manifestoSummary === 'string' && item.manifestoSummary.length > 0
  );
  if (valid.length === 0) throw new Error('No valid manifesto entries found');
  return valid;
};

/**
 * Validates that a parsed SIR API response has the correct structure.
 * Fills in missing optional arrays.
 * @param {unknown} data
 * @returns {{ title: string, overview: string, thingsToKnow: string[], documentsNeeded: string[] }}
 */
export const validateSIRResponse = (data) => {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('SIR response must be an object');
  }
  if (typeof data.title !== 'string' || data.title.length === 0) {
    throw new Error('SIR response missing title');
  }
  if (typeof data.overview !== 'string' || data.overview.length === 0) {
    throw new Error('SIR response missing overview');
  }
  return {
    title: data.title,
    overview: data.overview,
    thingsToKnow: Array.isArray(data.thingsToKnow) ? data.thingsToKnow : [],
    documentsNeeded: Array.isArray(data.documentsNeeded) ? data.documentsNeeded : [],
  };
};

/**
 * Parses and validates an AI JSON response string.
 * Strips markdown code fences before parsing.
 * @param {string} rawText
 * @param {'manifesto'|'sir'} schema
 * @returns {unknown}
 */
export const parseAndValidateAIResponse = (rawText, schema) => {
  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const parsed = JSON.parse(cleaned);
  if (schema === 'manifesto') return validateManifestoResponse(parsed);
  if (schema === 'sir') return validateSIRResponse(parsed);
  return parsed;
};
