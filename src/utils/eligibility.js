/**
 * Pure eligibility check logic extracted from Tools.jsx for testability.
 * Returns a result object rather than setting React state, so it can be
 * unit-tested without a browser environment.
 *
 * @param {object} params
 * @param {string|number} params.age        - The entered age value
 * @param {'yes'|'no'} params.citizenship   - Whether the user is an Indian citizen
 * @param {object} params.t                 - i18next translation function (or mock)
 * @returns {{ eligible: boolean, message: string } | null}
 */
export const checkEligibility = ({ age, citizenship, t }) => {
  const ageNum = parseInt(age, 10);
  if (!age || isNaN(ageNum)) return null;

  if (ageNum >= 18 && citizenship === 'yes') {
    return {
      eligible: true,
      message: t('eligible_msg', 'You are eligible to vote! Register on the National Voter Service Portal.'),
    };
  }

  if (citizenship === 'no') {
    return {
      eligible: false,
      message: t('not_citizen_msg', 'Only Indian citizens are eligible to vote.'),
    };
  }

  const yearsLeft = 18 - ageNum;
  return {
    eligible: false,
    message: t('underage_msg', `You need to wait ${yearsLeft} more year(s) to be eligible.`, {
      years: yearsLeft,
    }),
  };
};
