import type {
  DetectedEntity,
  EnabledCategories,
  PiiCategory,
  RedactTextResult,
  RedactionMode,
  ReplacementSpan,
} from './types';

const PSEUDONYM_PREFIX: Record<PiiCategory, string> = {
  email: 'EMAIL',
  phone: 'PHONE',
  ipv4: 'IPV4',
  pan: 'PAN',
  aadhaar: 'AADHAAR',
  credit_card: 'CARD',
};

/**
 * In-memory pseudonym registry using separate per-category namespaces
 * so different entity categories can never collide.
 * Never persisted to localStorage, sessionStorage, or transmitted externally.
 */
export interface PseudonymRegistry {
  getPlaceholder(category: PiiCategory, normalizedValue: string): string;
}

export function createPseudonymRegistry(): PseudonymRegistry {
  const namespaces: Record<PiiCategory, Map<string, string>> = {
    email: new Map(),
    phone: new Map(),
    ipv4: new Map(),
    pan: new Map(),
    aadhaar: new Map(),
    credit_card: new Map(),
  };

  return {
    getPlaceholder(category: PiiCategory, normalizedValue: string): string {
      const map = namespaces[category];
      const existing = map.get(normalizedValue);
      if (existing) {
        return existing;
      }
      const nextIndex = map.size + 1;
      const padded = String(nextIndex).padStart(2, '0');
      const placeholder = `${PSEUDONYM_PREFIX[category]}_${padded}`;
      map.set(normalizedValue, placeholder);
      return placeholder;
    },
  };
}

function maskEmailPartial(value: string): string {
  const atIdx = value.indexOf('@');
  if (atIdx <= 0) {
    return '[REDACTED]';
  }
  const local = value.slice(0, atIdx);
  const domain = value.slice(atIdx);
  return `${local[0]}***${domain}`;
}

function maskPhonePartial(value: string): string {
  const digits = value.replace(/\D/g, '');
  const lastThree = digits.slice(-3);
  return `XXXXXXX${lastThree}`;
}

function maskCreditCardPartial(value: string): string {
  const digits = value.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  if (digits.length === 15) {
    return `XXXX-XXXXXX-X${lastFour}`;
  }
  const maskedCount = Math.max(4, digits.length - 4);
  const groups: string[] = [];
  for (let i = 0; i < maskedCount; i += 4) {
    groups.push('X'.repeat(Math.min(4, maskedCount - i)));
  }
  groups.push(lastFour);
  return groups.join('-');
}

function maskAadhaarPartial(value: string): string {
  const digits = value.replace(/\D/g, '');
  const lastFour = digits.slice(-4);
  return `XXXX-XXXX-${lastFour}`;
}

function maskPanPartial(value: string): string {
  const clean = value.trim().toUpperCase();
  if (clean.length !== 10) {
    return '[REDACTED]';
  }
  return `XXXXX${clean.slice(5, 9)}X`;
}

function maskIpv4Partial(value: string): string {
  const parts = value.trim().split('.');
  if (parts.length !== 4) {
    return '[REDACTED]';
  }
  return `${parts[0]}.${parts[1]}.XXX.XXX`;
}

export function formatReplacement(
  entity: DetectedEntity,
  mode: RedactionMode,
  registry: PseudonymRegistry
): string {
  if (mode === 'full') {
    return '[REDACTED]';
  }

  if (mode === 'pseudonym') {
    return registry.getPlaceholder(entity.category, entity.normalizedValue);
  }

  // Partial Mask
  switch (entity.category) {
    case 'email':
      return maskEmailPartial(entity.value);
    case 'phone':
      return maskPhonePartial(entity.value);
    case 'credit_card':
      return maskCreditCardPartial(entity.value);
    case 'aadhaar':
      return maskAadhaarPartial(entity.value);
    case 'pan':
      return maskPanPartial(entity.value);
    case 'ipv4':
      return maskIpv4Partial(entity.value);
  }
}

/**
 * Applies redaction to detected entities in a single text block.
 * Only entities belonging to enabled categories are redacted.
 */
export function redactText(
  text: string,
  entities: DetectedEntity[],
  mode: RedactionMode,
  enabledCategories: EnabledCategories,
  registry: PseudonymRegistry = createPseudonymRegistry()
): RedactTextResult {
  const activeEntities = entities
    .filter((entity) => enabledCategories[entity.category])
    .sort((a, b) => a.start - b.start);

  if (activeEntities.length === 0) {
    return {
      sanitizedText: text,
      replacements: [],
      redactedCount: 0,
    };
  }

  const parts: string[] = [];
  const replacements: ReplacementSpan[] = [];
  let cursor = 0;
  let outLength = 0;

  for (const entity of activeEntities) {
    if (entity.start < cursor) {
      // Defensive guard against overlapping spans
      continue;
    }

    const prefix = text.slice(cursor, entity.start);
    parts.push(prefix);
    outLength += prefix.length;

    const replacementText = formatReplacement(entity, mode, registry);
    parts.push(replacementText);

    replacements.push({
      start: outLength,
      end: outLength + replacementText.length,
      category: entity.category,
      replacementText,
    });

    outLength += replacementText.length;
    cursor = entity.end;
  }

  parts.push(text.slice(cursor));

  return {
    sanitizedText: parts.join(''),
    replacements,
    redactedCount: replacements.length,
  };
}
