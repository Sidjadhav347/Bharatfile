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
          'rounded px-1 py-0.5 font-semibold',
          variant === 'original'
            ? 'bg-rose-100 text-rose-900 ring-1 ring-rose-300'
            : 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300'
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <Loader2
            className="h-8 w-8 animate-spin text-emerald-700"
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
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <GitCompare className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            {t('comparison.emptyTitle')}
          </h3>
          <p className="mt-1 max-w-lg text-sm text-slate-600">
            {t('comparison.emptyDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const isCsv = analysis.format === 'csv' && analysis.csvRows;

  return (
    <Card>
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>{t('comparison.heading')}</CardTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded bg-rose-100 px-2 py-0.5 font-medium text-rose-900 ring-1 ring-rose-300">
                {t('comparison.legendOriginal')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-2 py-0.5 font-medium text-emerald-950 ring-1 ring-emerald-300">
                {t('comparison.legendSanitized')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isCsv && (
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setCsvViewMode('table')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer',
                    csvViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
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
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer',
                    csvViewMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('comparison.viewRawCsv')}
                </button>
              </div>
            )}

            {(!isCsv || csvViewMode === 'raw') && (
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('highlighted')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer',
                    viewMode === 'highlighted'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  )}
                >
                  {t('comparison.viewFormatted')}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('diff')}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer',
                    viewMode === 'diff'
                      ? 'bg-white text-slate-900 shadow-xs'
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

      <CardContent className="pt-4 space-y-4">
        {/* CSV Parse Warning if malformed CSV encountered */}
        {analysis.csvParseWarnings && analysis.csvParseWarnings.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-950"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
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
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-3.5 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
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
                          row.rowIndex === 0 && 'bg-slate-50 font-semibold'
                        )}
                      >
                        <td className="w-12 border-r border-slate-100 px-2 py-2 text-slate-400 font-mono">
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
            <div className="overflow-hidden rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-3.5 py-2">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-900">
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
                          row.rowIndex === 0 && 'bg-slate-50 font-semibold'
                        )}
                      >
                        <td className="w-12 border-r border-slate-100 px-2 py-2 text-slate-400 font-mono">
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
          /* Line Diff View powered by diff library */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs">
              <span className="font-semibold text-slate-700">
                {t('comparison.viewDiff')}
              </span>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-rose-800">
                  <span className="h-2.5 w-2.5 rounded-xs bg-rose-200" />
                  {t('comparison.legendRemoved')}
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-200" />
                  {t('comparison.legendAdded')}
                </span>
              </div>
            </div>
            <div className="max-h-[460px] overflow-auto p-3 font-mono text-xs leading-relaxed">
              {lineDiffParts.map((part, idx) => {
                const bg = part.added
                  ? 'bg-emerald-50 text-emerald-950 border-l-4 border-emerald-500'
                  : part.removed
                  ? 'bg-rose-50 text-rose-950 border-l-4 border-rose-500'
                  : 'text-slate-700';
                const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
                const lines = part.value.replace(/\n$/, '').split('\n');

                return (
                  <div key={`diff-${idx}`} className={cn('px-2 py-0.5', bg)}>
                    {lines.map((line, lineIdx) => (
                      <div key={`diff-${idx}-${lineIdx}`} className="whitespace-pre-wrap break-words">
                        <span className="select-none opacity-60">{prefix}</span>
                        {line}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Highlighted Side-by-Side Comparison Panels (TXT & Raw CSV) */
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Left Panel: Original */}
            <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-800">
                  {t('comparison.originalTitle')}
                </span>
                <Badge variant="rose">
                  {analysis.totalSelectedForRedaction}
                </Badge>
              </div>
              <pre className="max-h-[460px] flex-1 overflow-auto p-4 font-mono text-xs leading-6 text-slate-800 whitespace-pre-wrap break-words">
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
            <div className="flex flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white">
              <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wide text-emerald-950">
                  {t('comparison.sanitizedTitle')}
                </span>
                <Badge variant="emerald">
                  {analysis.totalSelectedForRedaction}
                </Badge>
              </div>
              <pre className="max-h-[460px] flex-1 overflow-auto p-4 font-mono text-xs leading-6 text-slate-800 whitespace-pre-wrap break-words">
                {renderHighlightedSegments(
                  analysis.sanitizedText,
                  isCsv ? [] : toReplacementSpans(analysis.replacements, t),
                  'sanitized'
                )}
              </pre>
            </div>
          </div>
        )}

        {/* Honest Validation Disclaimers & Manual Review Reminder */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700">
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden="true"
            />
            <div className="space-y-1.5">
              <p>{t('comparison.luhnNote')}</p>
              <p>{t('comparison.aadhaarNote')}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">
                {t('comparison.reviewReminderTitle')}
              </p>
              <p className="mt-1 leading-relaxed">
                {t('comparison.reviewReminderBody')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
