import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENABLED_CATEGORIES,
  SAMPLE_DOCUMENT,
  analyzeDocument,
} from '../index';

describe('CSV processor & mandatory sample document', () => {
  it('sanitizes CSV cells while preserving structure and consistent pseudonyms across rows', () => {
    const csv = [
      'name,email,phone,card,ref',
      'Aarav,aarav@example.com,+91 98765 43210,4111 1111 1111 1111,1234 5678 9012 3456',
      'Aarav Duplicate,aarav@example.com,9876543210,4532-0151-1283-0366,INV-9981',
    ].join('\n');

    const result = analyzeDocument(
      csv,
      'csv',
      'pseudonym',
      DEFAULT_ENABLED_CATEGORIES
    );

    expect(result.countsByCategory.email).toBe(2);
    expect(result.countsByCategory.phone).toBe(2);
    expect(result.countsByCategory.credit_card).toBe(2);
    expect(result.rejectedCardCandidates).toBe(1);
    expect(result.csvRows).toHaveLength(3);

    // Same email & phone across rows map to EMAIL_01 & PHONE_01
    expect(result.sanitizedText).toContain('Aarav,EMAIL_01,PHONE_01,CARD_01,1234 5678 9012 3456');
    expect(result.sanitizedText).toContain('Aarav Duplicate,EMAIL_01,PHONE_01,CARD_02,INV-9981');
  });

  it('handles malformed CSV gracefully without crashing', () => {
    const malformedCsv = 'name,email\n"Unclosed quote,test@example.com\n';
    const result = analyzeDocument(
      malformedCsv,
      'csv',
      'full',
      DEFAULT_ENABLED_CATEGORIES
    );

    expect(result.format).toBe('csv');
    expect(result.csvParseWarnings?.length).toBeGreaterThan(0);
    expect(result.sanitizedText).toContain('[REDACTED]');
  });

  it('validates that the mandatory sample document covers all 6 categories and Luhn false-positive demo', () => {
    const full = analyzeDocument(
      SAMPLE_DOCUMENT.content,
      SAMPLE_DOCUMENT.format,
      'full',
      DEFAULT_ENABLED_CATEGORIES
    );

    expect(full.countsByCategory.email).toBeGreaterThanOrEqual(3);
    expect(full.countsByCategory.phone).toBeGreaterThanOrEqual(3);
    expect(full.countsByCategory.aadhaar).toBe(2);
    expect(full.countsByCategory.pan).toBe(1);
    expect(full.countsByCategory.credit_card).toBe(1);
    expect(full.countsByCategory.ipv4).toBe(2);
    expect(full.rejectedCardCandidates).toBe(1);

    // Invalid Luhn number remains untouched in sanitized output
    expect(full.sanitizedText).toContain('1234 5678 9012 3456');
    // Valid Luhn card is redacted
    expect(full.sanitizedText).not.toContain('4111 1111 1111 1111');

    const pseudo = analyzeDocument(
      SAMPLE_DOCUMENT.content,
      SAMPLE_DOCUMENT.format,
      'pseudonym',
      DEFAULT_ENABLED_CATEGORIES
    );
    expect(pseudo.sanitizedText).toContain('EMAIL_01');
    expect(pseudo.sanitizedText).toContain('PHONE_01');
    expect(pseudo.sanitizedText).toContain('CARD_01');
  });
});
