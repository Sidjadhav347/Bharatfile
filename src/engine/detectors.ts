import { evaluateCreditCardCandidate } from './luhn';
import type { DetectedEntity, PiiCategory, ScanTextResult } from './types';
import { isValidAadhaarCandidate, normalizeAadhaarDigits } from './verhoeff';

interface CandidateMatch {
  category: PiiCategory;
  value: string;
  normalizedValue: string;
  start: number;
  end: number;
  priority: number;
  validationNote?: 'luhn-verified' | 'verhoeff-verified';
}

const CATEGORY_PRIORITY: Record<PiiCategory, number> = {
  credit_card: 1,
  email: 2,
  aadhaar: 3,
  pan: 4,
  ipv4: 5,
  phone: 6,
};

// Patterns are carefully bounded to minimize false positives and duplicate detections.
const EMAIL_REGEX =
  /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}(?![A-Za-z0-9._%+-])/g;

const CREDIT_CARD_CANDIDATE_REGEX =
  /(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)/g;

const AADHAAR_CANDIDATE_REGEX =
  /(?<!\d)([2-9]\d{3})([ -]?)\d{4}\2\d{4}(?!\d)/g;

const PAN_REGEX =
  /(?<![A-Za-z0-9])[A-Z]{5}[0-9]{4}[A-Z](?![A-Za-z0-9])/g;

const IPV4_REGEX =
  /(?<![\d.])(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?![\d.])/g;

const INDIAN_PHONE_REGEX =
  /(?<!\d)(?:(?:\+91|91|0)[ -]?)?[6-9]\d{4}[ -]?\d{5}(?!\d)/g;

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

function emptyCounts(): Record<PiiCategory, number> {
  return {
    email: 0,
    phone: 0,
    ipv4: 0,
    pan: 0,
    aadhaar: 0,
    credit_card: 0,
  };
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && a.end > b.start;
}

/**
 * Scans a string completely in-memory and returns deduplicated, non-overlapping PII entities.
 */
export function scanTextForPii(text: string): ScanTextResult {
  if (!text) {
    return {
      entities: [],
      countsByCategory: emptyCounts(),
      totalDetected: 0,
      rejectedCardCandidates: 0,
    };
  }

  const candidates: CandidateMatch[] = [];
  let rejectedCardCandidates = 0;

  // 1. Credit card candidates (mandatory Luhn validation before classification)
  for (const match of text.matchAll(CREDIT_CARD_CANDIDATE_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    const evaluation = evaluateCreditCardCandidate(raw);
    if (evaluation.accepted) {
      candidates.push({
        category: 'credit_card',
        value: raw,
        normalizedValue: evaluation.normalizedDigits,
        start,
        end: start + raw.length,
        priority: CATEGORY_PRIORITY.credit_card,
        validationNote: 'luhn-verified',
      });
    } else if (evaluation.isValidFormat) {
      rejectedCardCandidates += 1;
    }
  }

  // 2. Email addresses
  for (const match of text.matchAll(EMAIL_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    candidates.push({
      category: 'email',
      value: raw,
      normalizedValue: raw.trim().toLowerCase(),
      start,
      end: start + raw.length,
      priority: CATEGORY_PRIORITY.email,
    });
  }

  // 3. Indian Aadhaar numbers (12 digits starting 2-9 + Verhoeff checksum)
  for (const match of text.matchAll(AADHAAR_CANDIDATE_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (isValidAadhaarCandidate(raw)) {
      candidates.push({
        category: 'aadhaar',
        value: raw,
        normalizedValue: normalizeAadhaarDigits(raw),
        start,
        end: start + raw.length,
        priority: CATEGORY_PRIORITY.aadhaar,
        validationNote: 'verhoeff-verified',
      });
    }
  }

  // 4. Indian PAN numbers
  for (const match of text.matchAll(PAN_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    candidates.push({
      category: 'pan',
      value: raw,
      normalizedValue: raw.trim().toUpperCase(),
      start,
      end: start + raw.length,
      priority: CATEGORY_PRIORITY.pan,
    });
  }

  // 5. IPv4 addresses
  for (const match of text.matchAll(IPV4_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    candidates.push({
      category: 'ipv4',
      value: raw,
      normalizedValue: raw.trim(),
      start,
      end: start + raw.length,
      priority: CATEGORY_PRIORITY.ipv4,
    });
  }

  // 6. Indian phone numbers
  for (const match of text.matchAll(INDIAN_PHONE_REGEX)) {
    const raw = match[0];
    const start = match.index ?? 0;
    candidates.push({
      category: 'phone',
      value: raw,
      normalizedValue: normalizeIndianPhone(raw),
      start,
      end: start + raw.length,
      priority: CATEGORY_PRIORITY.phone,
    });
  }

  // Resolve overlaps deterministically: higher priority first, then longer match, then earlier index.
  candidates.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const lenDiff = (b.end - b.start) - (a.end - a.start);
    if (lenDiff !== 0) return lenDiff;
    return a.start - b.start;
  });

  const accepted: CandidateMatch[] = [];
  for (const candidate of candidates) {
    const hasOverlap = accepted.some((existing) => overlaps(candidate, existing));
    if (!hasOverlap) {
      accepted.push(candidate);
    }
  }

  // Order accepted entities sequentially by appearance in the text
  accepted.sort((a, b) => a.start - b.start);

  const countsByCategory = emptyCounts();
  const entities: DetectedEntity[] = accepted.map((item, idx) => {
    countsByCategory[item.category] += 1;
    return {
      id: `${item.category}-${idx}-${item.start}`,
      category: item.category,
      value: item.value,
      normalizedValue: item.normalizedValue,
      start: item.start,
      end: item.end,
      validationNote: item.validationNote,
    };
  });

  return {
    entities,
    countsByCategory,
    totalDetected: entities.length,
    rejectedCardCandidates,
  };
}
