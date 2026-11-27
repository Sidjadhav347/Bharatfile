import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ENABLED_CATEGORIES,
  createPseudonymRegistry,
  isValidAadhaarCandidate,
  redactText,
  scanTextForPii,
} from '../index';

describe('PII detection, Verhoeff Aadhaar check, and redaction modes', () => {
  it('detects all 6 PII categories without overlapping or duplicate matches', () => {
    const input = [
      'Email: rohan.verma@gmail.com',
      'Phone: +91 98765 43210 and 9876543210',
      'PAN: ABCPK4821M',
      'Aadhaar: 2345 6789 0124',
      'IPv4: 192.168.1.25',
      'Card: 4111 1111 1111 1111',
      'Invalid Card: 1234 5678 9012 3456',
    ].join('\n');

    const scan = scanTextForPii(input);

    expect(scan.countsByCategory).toEqual({
      email: 1,
      phone: 2,
      pan: 1,
      aadhaar: 1,
      ipv4: 1,
      credit_card: 1,
    });
    expect(scan.rejectedCardCandidates).toBe(1);

    // Ensure no two entities overlap
    for (let i = 1; i < scan.entities.length; i += 1) {
      expect(scan.entities[i].start).toBeGreaterThanOrEqual(
        scan.entities[i - 1].end
      );
    }
  });

  it('validates Aadhaar format and Verhoeff checksum', () => {
    expect(isValidAadhaarCandidate('2345 6789 0124')).toBe(true);
    expect(isValidAadhaarCandidate('3456-7890-1238')).toBe(true);
    // Wrong check digit
    expect(isValidAadhaarCandidate('2345 6789 0125')).toBe(false);
    // Cannot start with 0 or 1
    expect(isValidAadhaarCandidate('1345 6789 0124')).toBe(false);
  });

  it('does not split numeric email local-parts into phone numbers', () => {
    const scan = scanTextForPii('Contact: 9876543210@example.com');
    expect(scan.countsByCategory.email).toBe(1);
    expect(scan.countsByCategory.phone).toBe(0);
  });

  it('applies FULL, PARTIAL, and CONSISTENT PSEUDONYMIZATION modes accurately', () => {
    const input =
      'Email: rohan@gmail.com | Repeat: ROHAN@gmail.com | Phone: +91 98765 43210 | Repeat Phone: 9876543210 | Card: 4111 1111 1111 1111';
    const scan = scanTextForPii(input);

    const full = redactText(
      input,
      scan.entities,
      'full',
      DEFAULT_ENABLED_CATEGORIES
    );
    expect(full.sanitizedText).toBe(
      'Email: [REDACTED] | Repeat: [REDACTED] | Phone: [REDACTED] | Repeat Phone: [REDACTED] | Card: [REDACTED]'
    );

    const partial = redactText(
      input,
      scan.entities,
      'partial',
      DEFAULT_ENABLED_CATEGORIES
    );
    expect(partial.sanitizedText).toContain('r***@gmail.com');
    expect(partial.sanitizedText).toContain('XXXXXXX210');
    expect(partial.sanitizedText).toContain('XXXX-XXXX-XXXX-1111');

    const registry = createPseudonymRegistry();
    const pseudo = redactText(
      input,
      scan.entities,
      'pseudonym',
      DEFAULT_ENABLED_CATEGORIES,
      registry
    );
    expect(pseudo.sanitizedText).toBe(
      'Email: EMAIL_01 | Repeat: EMAIL_01 | Phone: PHONE_01 | Repeat Phone: PHONE_01 | Card: CARD_01'
    );
  });

  it('keeps separate pseudonym namespaces per category and respects disabled categories', () => {
    const input = 'a@b.com 9876543210 ABCPK4821M';
    const scan = scanTextForPii(input);
    const onlyEmail = {
      ...DEFAULT_ENABLED_CATEGORIES,
      phone: false,
      pan: false,
    };

    const result = redactText(input, scan.entities, 'pseudonym', onlyEmail);
    expect(result.sanitizedText).toBe('EMAIL_01 9876543210 ABCPK4821M');
    expect(result.redactedCount).toBe(1);
  });
});
