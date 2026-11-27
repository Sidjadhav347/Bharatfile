import Papa from 'papaparse';
import { scanTextForPii } from './detectors';
import { createPseudonymRegistry, redactText } from './redactor';
import type {
  CsvCellComparison,
  CsvRowComparison,
  DetectedEntity,
  DocumentAnalysis,
  EnabledCategories,
  PiiCategory,
  RedactionMode,
} from './types';

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

/**
 * Analyzes and sanitizes either plain TXT or structured CSV content entirely in browser memory.
 * For CSV, cells are parsed, scanned, and redacted individually using a shared pseudonym registry
 * so repeated PII across rows/columns maps to the same placeholder while preserving CSV structure.
 */
export function analyzeDocument(
  rawText: string,
  format: 'txt' | 'csv',
  mode: RedactionMode,
  enabledCategories: EnabledCategories
): DocumentAnalysis {
  if (format === 'txt') {
    const scan = scanTextForPii(rawText);
    const registry = createPseudonymRegistry();
    const redacted = redactText(
      rawText,
      scan.entities,
      mode,
      enabledCategories,
      registry
    );

    return {
      format: 'txt',
      originalText: rawText,
      sanitizedText: redacted.sanitizedText,
      entities: scan.entities,
      replacements: redacted.replacements,
      countsByCategory: scan.countsByCategory,
      totalDetected: scan.totalDetected,
      totalSelectedForRedaction: redacted.redactedCount,
      rejectedCardCandidates: scan.rejectedCardCandidates,
    };
  }

  // CSV processing via PapaParse
  const parsed = Papa.parse<string[]>(rawText, {
    skipEmptyLines: false,
  });

  const csvParseWarnings: string[] = [];
  if (parsed.errors && parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      const rowLabel = typeof err.row === 'number' ? `Row ${err.row + 1}: ` : '';
      csvParseWarnings.push(`${rowLabel}${err.message}`);
    }
  }

  const rawRows: string[][] = Array.isArray(parsed.data) ? parsed.data : [];
  // Normalize trailing single empty row caused by final newline
  const rows =
    rawRows.length > 1 &&
    rawRows[rawRows.length - 1].length === 1 &&
    rawRows[rawRows.length - 1][0] === '' &&
    rawText.endsWith('\n')
      ? rawRows.slice(0, -1)
      : rawRows;

  const registry = createPseudonymRegistry();
  const countsByCategory = emptyCounts();
  const allEntities: DetectedEntity[] = [];
  let rejectedCardCandidates = 0;
  let totalSelectedForRedaction = 0;

  const csvRows: CsvRowComparison[] = [];
  const sanitizedMatrix: string[][] = [];

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = Array.isArray(rows[rowIndex]) ? rows[rowIndex] : [String(rows[rowIndex] ?? '')];
    const cellComparisons: CsvCellComparison[] = [];
    const sanitizedRow: string[] = [];

    for (let colIndex = 0; colIndex < row.length; colIndex += 1) {
      const cellOriginal = String(row[colIndex] ?? '');
      const scan = scanTextForPii(cellOriginal);
      rejectedCardCandidates += scan.rejectedCardCandidates;

      for (const entity of scan.entities) {
        countsByCategory[entity.category] += 1;
        allEntities.push({
          ...entity,
          id: `r${rowIndex}-c${colIndex}-${entity.id}`,
        });
      }

      const redacted = redactText(
        cellOriginal,
        scan.entities,
        mode,
        enabledCategories,
        registry
      );
      totalSelectedForRedaction += redacted.redactedCount;

      cellComparisons.push({
        colIndex,
        original: cellOriginal,
        sanitized: redacted.sanitizedText,
        entities: scan.entities,
        replacements: redacted.replacements,
      });
      sanitizedRow.push(redacted.sanitizedText);
    }

    csvRows.push({ rowIndex, cells: cellComparisons });
    sanitizedMatrix.push(sanitizedRow);
  }

  const sanitizedCsv = Papa.unparse(sanitizedMatrix, {
    newline: '\n',
  });

  return {
    format: 'csv',
    originalText: rawText,
    sanitizedText: sanitizedCsv,
    entities: allEntities,
    replacements: [],
    countsByCategory,
    totalDetected: allEntities.length,
    totalSelectedForRedaction,
    rejectedCardCandidates,
    csvRows,
    csvParseWarnings: csvParseWarnings.length > 0 ? csvParseWarnings : undefined,
  };
}
