import type { CreditCardCandidateEvaluation } from './types';

/**
 * Strips spaces and hyphens from a credit card candidate string.
 */
export function normalizeCardDigits(candidate: string): string {
  return candidate.replace(/[\s-]+/g, '');
}

/**
 * Computes whether a digit-only string (13-19 digits) satisfies the Luhn checksum.
 * Note: A Luhn-valid number is only mathematically valid according to the checksum;
 * it does not prove that a card exists, is active, or belongs to a real person.
 */
export function isValidLuhn(digitsOnly: string): boolean {
  if (!/^\d{13,19}$/.test(digitsOnly)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = digitsOnly.length - 1; i >= 0; i -= 1) {
    let digit = digitsOnly.charCodeAt(i) - 48;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Evaluates a credit card candidate locally in the browser:
 * 1. Normalizes spaces and hyphens
 * 2. Verifies remaining characters are 13-19 digits
 * 3. Validates the Luhn checksum before accepting
 */
export function evaluateCreditCardCandidate(
  candidate: string
): CreditCardCandidateEvaluation {
  const normalizedDigits = normalizeCardDigits(candidate);

  if (!/^\d+$/.test(normalizedDigits)) {
    return {
      raw: candidate,
      normalizedDigits,
      isValidFormat: false,
      isLuhnValid: false,
      accepted: false,
      reason: 'non-digit-characters',
    };
  }

  if (normalizedDigits.length < 13 || normalizedDigits.length > 19) {
    return {
      raw: candidate,
      normalizedDigits,
      isValidFormat: false,
      isLuhnValid: false,
      accepted: false,
      reason: 'invalid-length',
    };
  }

  const luhnOk = isValidLuhn(normalizedDigits);

  return {
    raw: candidate,
    normalizedDigits,
    isValidFormat: true,
    isLuhnValid: luhnOk,
    accepted: luhnOk,
    reason: luhnOk ? 'luhn-valid' : 'luhn-checksum-failed',
  };
}
