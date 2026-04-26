/**
 * Google Analytics 4 (GA4) event tracking helper for VoteNavigator.
 * Wraps window.gtag with a safe guard so it never throws if GA4
 * hasn't loaded (e.g. during testing or if blocked by an ad-blocker).
 *
 * The measurement ID is read from VITE_GA_MEASUREMENT_ID env var,
 * falling back to a placeholder so the code compiles without a key.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-VOTEWISE2025';

/** Named constants for every tracked event to avoid magic strings. */
export const GA_EVENTS = {
  FETCH_MANIFESTOS: 'fetch_manifestos',
  FETCH_SIR: 'fetch_sir',
  CAST_VOTE: 'cast_vote',
  CHECK_ELIGIBILITY: 'check_eligibility',
  FIND_BOOTH: 'find_booth',
  LANGUAGE_CHANGE: 'language_change',
  GUIDE_STEP_CHANGE: 'guide_step_change',
  ELIGIBILITY_RESULT: 'eligibility_result',
};

/**
 * Sends a custom event to GA4.
 * @param {string} eventName  - One of GA_EVENTS values
 * @param {Record<string, unknown>} [params] - Optional extra parameters
 */
export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (_) {
    // Silently swallow — never crash the app due to analytics
  }
};

/**
 * Notifies GA4 of a page navigation (for SPAs).
 * @param {string} pagePath - e.g. '/tools'
 * @param {string} [pageTitle]
 */
export const trackPageView = (pagePath, pageTitle) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pagePath,
        ...(pageTitle ? { page_title: pageTitle } : {}),
      });
    }
  } catch (_) {
    // Silently swallow
  }
};
