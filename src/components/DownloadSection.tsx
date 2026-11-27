import { Check, CheckCircle2, Copy, Download } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentAnalysis } from '../engine';
import type { LoadedDocumentMeta } from './DocumentInputSection';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

interface DownloadSectionProps {
  analysis: DocumentAnalysis | null;
  loadedDoc: LoadedDocumentMeta | null;
  lastDownloadedFile: string | null;
  onDownloadComplete: (filename: string) => void;
}

function buildSanitizedFilename(
  loadedDoc: LoadedDocumentMeta | null,
  prefix: string
): string {
  if (!loadedDoc) {
    return `${prefix}document.txt`;
  }
  const cleanName = loadedDoc.filename.replace(/^(sanitized-)+/i, '');
  const expectedExt = `.${loadedDoc.format}`;
  if (cleanName.toLowerCase().endsWith(expectedExt)) {
    return `${prefix}${cleanName}`;
  }
  return `${prefix}${cleanName}${expectedExt}`;
}

export function DownloadSection({
  analysis,
  loadedDoc,
  lastDownloadedFile,
  onDownloadComplete,
}: DownloadSectionProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = React.useState(false);

  const handleDownload = () => {
    if (!analysis || !loadedDoc) return;

    const mimeType =
      analysis.format === 'csv'
        ? 'text/csv;charset=utf-8'
        : 'text/plain;charset=utf-8';
    const outputFilename = buildSanitizedFilename(
      loadedDoc,
      t('download.filenamePrefix')
    );

    // Strictly export analysis.sanitizedText — NEVER the original document.
    const blob = new Blob([analysis.sanitizedText], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    try {
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = outputFilename;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      onDownloadComplete(outputFilename);
    } finally {
      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    }
  };

  const handleCopy = async () => {
    if (!analysis || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(analysis.sanitizedText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked silently
    }
  };

  const formatUpper = (analysis?.format ?? 'txt').toUpperCase();

  return (
    <Card className="border-neutral-200 bg-white shadow-sm">
      <CardHeader className="border-b border-neutral-100 pb-3">
        <CardTitle>{t('download.heading')}</CardTitle>
        <CardDescription>{t('download.subheading')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            disabled={!analysis}
            onClick={handleDownload}
            className="w-full sm:w-auto bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t('download.downloadButton', { format: formatUpper })}
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={!analysis}
            onClick={handleCopy}
            className="w-full sm:w-auto"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                {t('download.copied')}
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                {t('download.copyButton')}
              </>
            )}
          </Button>
        </div>

        {!analysis && (
          <p className="text-xs text-neutral-400">{t('download.disabledHint')}</p>
        )}

        {lastDownloadedFile && analysis && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-900"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <span>
              {t('download.successMessage', { filename: lastDownloadedFile })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
