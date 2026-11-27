import { diffLines } from 'diff';
import {
  AlertTriangle,
  FileCode2,
  GitCompare,
  Info,
  Loader2,
  Table2,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type {
  DetectedEntity,
  DocumentAnalysis,
  EnabledCategories,
  ReplacementSpan,
} from '../engine';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card';

interface ComparisonWorkspaceProps {
  analysis: DocumentAnalysis | null;
  enabledCategories: EnabledCategories;
  isScanning: boolean;
}

function renderHighlightedSegments(
  text: string,
  spans: Array<{ start: number; end: number; label: string }>,
  variant: 'original' | 'sanitized'
): React.ReactNode {
  if (spans.length === 0) {
    return text;
  }

  const ordered = [...spans].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  ordered.forEach((span, idx) => {
    if (span.start < cursor) {
      return;
    }
    if (span.start > cursor) {
      nodes.push(
        <React.Fragment key={`txt-${idx}`}>
          {text.slice(cursor, span.start)}
        </React.Fragment>
      );
    }

    const segment = text.slice(span.start, span.end);
    nodes.push(
      <mark
        key={`mark-${idx}-${span.start}`}
        title={span.label}
        className={cn(
          'rounded-md px-1.5 py-0.5 font-semibold transition-colors',
          variant === 'original'
            ? 'bg-rose-100/90 text-rose-900 ring-1 ring-rose-200'
            : 'bg-emerald-100/90 text-emerald-950 ring-1 ring-emerald-200'
        )}
      >
        {segment}
      </mark>
    );
    cursor = span.end;
  });

  if (cursor < text.length) {
    nodes.push(
      <React.Fragment key="txt-tail">{text.slice(cursor)}</React.Fragment>
    );
  }

  return nodes;
}

function toOriginalSpans(
  entities: DetectedEntity[],
  enabledCategories: EnabledCategories,
  t: (key: string) => string
) {
  return entities
    .filter((e) => enabledCategories[e.category])
    .map((e) => ({
      start: e.start,
      end: e.end,
      label: t(`categories.${e.category}Singular`),
    }));
}

function toReplacementSpans(
  replacements: ReplacementSpan[],
  t: (key: string) => string
) {
  return replacements.map((r) => ({
    start: r.start,
    end: r.end,
    label: t(`categories.${r.category}Singular`),
  }));
}

export function ComparisonWorkspace({
  analysis,
  enabledCategories,
  isScanning,
}: ComparisonWorkspaceProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = React.useState<'highlighted' | 'diff'>(
    'highlighted'
  );
  const [csvViewMode, setCsvViewMode] = React.useState<'table' | 'raw'>(
    'table'
  );

  const lineDiffParts = React.useMemo(() => {
    if (!analysis || viewMode !== 'diff') {
      return [];
    }
    return diffLines(analysis.originalText, analysis.sanitizedText);
  }, [analysis, viewMode]);

  if (isScanning) {
    return (
      <Card className="border-slate-200/80 bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2
            className="h-8 w-8 animate-spin text-[#1965e0]"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            {t('comparison.scanning')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="border-slate-200/80 bg-white">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 border border-slate-200/80 shadow-2xs">
            <GitCompare className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            {t('comparison.emptyTitle')}
          </h3>
          <p className="mt-1 max-w-md text-xs text-slate-500">
            {t('comparison.emptyDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const isCsv = analysis.format === 'csv' && analysis.csvRows;

  return (
    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{t('comparison.heading')}</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {t('comparison.legendOriginal')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t('comparison.legendSanitized')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isCsv && (
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-0.5">
                <button
                  type="button"
                  onClick={() => setCsvViewMode('table')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all',
                    csvViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('comparison.viewTable')}
                </button>
                <button
                  type="button"
                  onClick={() => setCsvViewMode('raw')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all',
                    csvViewMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('comparison.viewRawCsv')}
                </button>
              </div>
            )}

            {(!isCsv || csvViewMode === 'raw') && (
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('highlighted')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all',
                    viewMode === 'highlighted'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('comparison.viewFormatted')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('diff')}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all',
                    viewMode === 'diff'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('comparison.viewDiff')}
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* CSV Parse Warning if malformed CSV encountered */}
        {analysis.csvParseWarnings && analysis.csvParseWarnings.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-600"
              aria-hidden="true"
            />
            <span>
              {t('errors.csvMalformed', {
                details: analysis.csvParseWarnings.slice(0, 2).join('; '),
              })}
            </span>
          </div>
        )}

        {/* CSV Structured Table Side-by-Side Comparison */}
        {isCsv && csvViewMode === 'table' && analysis.csvRows ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {/* Left Table: Original CSV */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t('comparison.originalTitle')}
                </span>
                <Badge variant="rose">CSV</Badge>
              </div>
              <div className="max-h-[440px] overflow-auto bg-white">
                <table className="w-full border-collapse text-left text-xs">
                  <tbody>
                    {analysis.csvRows.map((row) => (
                      <tr
                        key={`orig-row-${row.rowIndex}`}
                        className={cn(
                          'border-b border-slate-100',
                          row.rowIndex === 0 && 'bg-slate-50/60 font-semibold text-slate-900'
                        )}
                      >
                        <td className="w-12 border-r border-slate-100 px-3 py-2 font-mono text-slate-400">
                          {row.rowIndex + 1}
                        </td>
                        {row.cells.map((cell) => (
                          <td
                            key={`orig-cell-${row.rowIndex}-${cell.colIndex}`}
                            className="border-r border-slate-100 px-3 py-2 font-mono text-slate-800 whitespace-pre-wrap break-words"
                          >
                            {renderHighlightedSegments(
                              cell.original,
                              toOriginalSpans(
                                cell.entities,
                                enabledCategories,
                                t
                              ),
                              'original'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Table: Sanitized CSV */}
            <div className="overflow-hidden rounded-xl border border-emerald-200/80 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  {t('comparison.sanitizedTitle')}
                </span>
                <Badge variant="emerald">CSV</Badge>
              </div>
              <div className="max-h-[440px] overflow-auto bg-white">
                <table className="w-full border-collapse text-left text-xs">
                  <tbody>
                    {analysis.csvRows.map((row) => (
                      <tr
                        key={`san-row-${row.rowIndex}`}
                        className={cn(
                          'border-b border-slate-100',
                          row.rowIndex === 0 && 'bg-slate-50/60 font-semibold text-slate-900'
                        )}
                      >
                        <td className="w-12 border-r border-slate-100 px-3 py-2 font-mono text-slate-400">
                          {row.rowIndex + 1}
                        </td>
                        {row.cells.map((cell) => (
                          <td
                            key={`san-cell-${row.rowIndex}-${cell.colIndex}`}
                            className="border-r border-slate-100 px-3 py-2 font-mono text-slate-800 whitespace-pre-wrap break-words"
                          >
                            {renderHighlightedSegments(
                              cell.sanitized,
                              toReplacementSpans(cell.replacements, t),
                              'sanitized'
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : viewMode === 'diff' ? (
          /* Line Diff View */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 text-xs">
              <span className="font-semibold text-slate-700">
                {t('comparison.viewDiff')}
              </span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-rose-700">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  {t('comparison.legendRemoved')}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {t('comparison.legendAdded')}
                </span>
              </div>
            </div>
            <div className="max-h-[460px] overflow-auto p-3 font-mono text-xs leading-relaxed">
              {lineDiffParts.map((part, idx) => {
                const bg = part.added
                  ? 'bg-emerald-50 text-emerald-950 border-l-2 border-emerald-500'
                  : part.removed
                  ? 'bg-rose-50 text-rose-950 border-l-2 border-rose-500'
                  : 'text-slate-700';
                const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                const lines = part.value.replace(/\n$/, '').split('\n');

                return (
                  <div key={`diff-${idx}`} className={cn('px-2 py-0.5', bg)}>
                    {lines.map((line, lineIdx) => (
                      <div key={`diff-${idx}-${lineIdx}`} className="whitespace-pre-wrap break-words">
                        <span className="select-none opacity-50">{prefix}</span>
                        {line}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Highlighted Side-by-Side Comparison Panels */
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left Panel: Original */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {t('comparison.originalTitle')}
                </span>
                <Badge variant="rose">
                  {analysis.totalSelectedForRedaction}
                </Badge>
              </div>
              <pre className="max-h-[460px] flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
                {renderHighlightedSegments(
                  analysis.originalText,
                  isCsv
                    ? []
                    : toOriginalSpans(analysis.entities, enabledCategories, t),
                  'original'
                )}
              </pre>
            </div>

            {/* Right Panel: Sanitized */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-blue-200/80 bg-white shadow-2xs">
              <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/40 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  {t('comparison.sanitizedTitle')}
                </span>
                <Badge variant="emerald">
                  {analysis.totalSelectedForRedaction}
                </Badge>
              </div>
              <pre className="max-h-[460px] flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
                {renderHighlightedSegments(
                  analysis.sanitizedText,
                  isCsv ? [] : toReplacementSpans(analysis.replacements, t),
                  'sanitized'
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Validation Disclaimers & Manual Review Reminder */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 pt-1">
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs text-slate-500">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-[#1965e0]"
              aria-hidden="true"
            />
            <div className="space-y-1.5 leading-relaxed">
              <p>{t('comparison.luhnNote')}</p>
              <p>{t('comparison.aadhaarNote')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-slate-700">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#1965e0]"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold text-slate-900">
                {t('comparison.reviewReminderTitle')}
              </p>
              <p className="mt-1 leading-relaxed text-slate-500">
                {t('comparison.reviewReminderBody')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
