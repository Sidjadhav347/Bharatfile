export type PiiCategory =
  | 'email'
  | 'phone'
  | 'ipv4'
  | 'pan'
  | 'aadhaar'
  | 'credit_card';

export type RedactionMode = 'full' | 'partial' | 'pseudonym';

export type DocumentFormat = 'txt' | 'csv';

export type EnabledCategories = Record<PiiCategory, boolean>;

export interface DetectedEntity {
  id: string;
  category: PiiCategory;
  value: string;
  normalizedValue: string;
  start: number;
  end: number;
  validationNote?: 'luhn-verified' | 'verhoeff-verified';
}

export interface CreditCardCandidateEvaluation {
  raw: string;
  normalizedDigits: string;
  isValidFormat: boolean;
  isLuhnValid: boolean;
  accepted: boolean;
  reason: string;
}

export interface ScanTextResult {
  entities: DetectedEntity[];
  countsByCategory: Record<PiiCategory, number>;
  totalDetected: number;
  rejectedCardCandidates: number;
}

export interface ReplacementSpan {
  start: number;
  end: number;
  category: PiiCategory;
  replacementText: string;
}

export interface RedactTextResult {
  sanitizedText: string;
  replacements: ReplacementSpan[];
  redactedCount: number;
}

export interface CsvCellComparison {
  colIndex: number;
  original: string;
  sanitized: string;
  entities: DetectedEntity[];
  replacements: ReplacementSpan[];
}

export interface CsvRowComparison {
  rowIndex: number;
  cells: CsvCellComparison[];
}

export interface DocumentAnalysis {
  format: DocumentFormat;
  originalText: string;
  sanitizedText: string;
  entities: DetectedEntity[];
  replacements: ReplacementSpan[];
  countsByCategory: Record<PiiCategory, number>;
  totalDetected: number;
  totalSelectedForRedaction: number;
  rejectedCardCandidates: number;
  csvRows?: CsvRowComparison[];
  csvParseWarnings?: string[];
}

export interface ProcessingLogEntry {
  id: string;
  timestamp: string;
  key: string;
  params?: Record<string, string | number>;
  level: 'info' | 'success' | 'warning';
}

export const ALL_PII_CATEGORIES: readonly PiiCategory[] = [
  'email',
  'phone',
  'aadhaar',
  'pan',
  'credit_card',
  'ipv4',
] as const;

export const DEFAULT_ENABLED_CATEGORIES: EnabledCategories = {
  email: true,
  phone: true,
  ipv4: true,
  pan: true,
  aadhaar: true,
  credit_card: true,
};
