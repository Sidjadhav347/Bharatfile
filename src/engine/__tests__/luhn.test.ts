import { describe, expect, it } from 'vitest';
import {
  evaluateCreditCardCandidate,
  isValidLuhn,
  normalizeCardDigits,
  scanTextForPii,
} from '../index';

describe('Luhn algorithm & credit card candidate validation', () => {
  it('accepts valid Luhn credit card numbers with spaces, hyphens, and compact digits', () => {
    expect(normalizeCardDigits('4111 1111 1111 1111')).toBe('4111111111111111');
    expect(isValidLuhn('4111111111111111')).toBe(true);
    expect(evaluateCreditCardCandidate('4111 1111 1111 1111').accepted).toBe(true);
    expect(evaluateCreditCardCandidate('4111-1111-1111-1111').accepted).toBe(true);
    expect(evaluateCreditCardCandidate('4532-0151-1283-0366').accepted).toBe(true);
    // 15-digit Amex Luhn-valid example
    expect(evaluateCreditCardCandidate('3782 822463 10005').accepted).toBe(true);
    // 13-digit Visa Luhn-valid example (4 + 6*2 + 6*4 = 40)
    expect(evaluateCreditCardCandidate('4222222222222').accepted).toBe(true);
  });

  it('rejects invalid checksum examples such as 1234 5678 9012 3456', () => {
    const res = evaluateCreditCardCandidate('1234 5678 9012 3456');
    expect(res.isValidFormat).toBe(true);
    expect(res.isLuhnValid).toBe(false);
    expect(res.accepted).toBe(false);
    expect(res.reason).toBe('luhn-checksum-failed');

    expect(evaluateCreditCardCandidate('4111 1111 1111 1112').accepted).toBe(false);
    expect(evaluateCreditCardCandidate('5555-5555-5555-5555').accepted).toBe(false);
  });

  it('rejects random numeric strings, wrong lengths, and non-digit inputs', () => {
    expect(evaluateCreditCardCandidate('9999 8888 7777 6666').accepted).toBe(false);
    expect(evaluateCreditCardCandidate('123456789012').accepted).toBe(false); // 12 digits
    expect(evaluateCreditCardCandidate('12345678901234567890').accepted).toBe(false); // 20 digits
    expect(evaluateCreditCardCandidate('4111 1111 ABCD 1111').accepted).toBe(false);
    expect(isValidLuhn('not-digits')).toBe(false);
  });

  it('classifies only Luhn-valid cards and tracks rejected candidates without duplicates or overlaps', () => {
    const text = [
      'Valid spaced: 4111 1111 1111 1111',
      'Valid hyphenated: 4532-0151-1283-0366',
      'Invalid checksum: 1234 5678 9012 3456',
      'Random 16-digit ref: 9876 5432 1098 7654',
    ].join('\n');

    const scan = scanTextForPii(text);

    expect(scan.countsByCategory.credit_card).toBe(2);
    expect(scan.countsByCategory.aadhaar).toBe(0);
    expect(scan.countsByCategory.phone).toBe(0);
    expect(scan.rejectedCardCandidates).toBe(2);
    expect(scan.entities.map((e) => e.normalizedValue)).toEqual([
      '4111111111111111',
      '4532015112830366',
    ]);
  });
});
