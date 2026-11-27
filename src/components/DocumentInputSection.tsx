import {
  AlertCircle,
  ClipboardPaste,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn, formatBytes } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface LoadedDocumentMeta {
  filename: string;
  sizeBytes: number;
  format: 'txt' | 'csv';
  source: 'file' | 'paste' | 'sample';
}

interface DocumentInputSectionProps {
  loadedDoc: LoadedDocumentMeta | null;
  errorMsg: string | null;
  onLoadFile: (file: File) => void;
  onLoadPastedText: (text: string) => void;
  onLoadSample: () => void;
  onResetSample: () => void;
  onRemoveDocument: () => void;
  onSetError: (msg: string | null) => void;
}

export function DocumentInputSection({
  loadedDoc,
  errorMsg,
  onLoadFile,
  onLoadPastedText,
  onLoadSample,
  onResetSample,
  onRemoveDocument,
  onSetError,
}: DocumentInputSectionProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<'file' | 'paste'>('file');
  const [isDragging, setIsDragging] = React.useState(false);
  const [pasteText, setPasteText] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileSelection = (file: File | undefined) => {
    if (!file) return;
    onSetError(null);
    onLoadFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelection(file);
  };

  const handleClipboardPaste = async () => {
    onSetError(null);
    if (!navigator.clipboard?.readText) {
      onSetError(t('upload.clipboardUnavailable'));
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        onSetError(t('errors.emptyPaste'));
        return;
      }
      setPasteText(text);
    } catch {
      onSetError(t('upload.clipboardUnavailable'));
    }
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) {
      onSetError(t('errors.emptyPaste'));
      return;
    }
    onSetError(null);
    onLoadPastedText(pasteText);
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>{t('upload.heading')}</CardTitle>
            <CardDescription className="mt-1">
              {t('upload.subheading')}
            </CardDescription>
          </div>

          {/* Mandatory One-Click Sample Document Loader */}
          <div className="flex flex-wrap items-center gap-2">
            {loadedDoc?.source === 'sample' ? (
              <Button
                variant="accent"
                size="lg"
                onClick={onResetSample}
                className="w-full sm:w-auto"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t('upload.resetSample')}
              </Button>
            ) : (
              <Button
                variant="accent"
                size="lg"
                onClick={onLoadSample}
                className="w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {t('upload.trySample')}
              </Button>
            )}
          </div>
        </div>
        <p className="mt-2 text-xs text-indigo-700 font-medium">
          {t('upload.trySampleHint')}
        </p>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Selected Document Status Bar */}
        {loadedDoc && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white">
                {loadedDoc.format === 'csv' ? (
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <FileText className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                    {t('upload.selectedFile')}:
                  </span>
                  <span className="truncate text-sm font-bold text-slate-900">
                    {loadedDoc.filename}
                  </span>
                  <Badge variant="emerald">
                    {loadedDoc.format.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {t('upload.fileSize')}: {formatBytes(loadedDoc.sizeBytes)}
                  {' · '}
                  {loadedDoc.source === 'sample'
                    ? t('upload.sourceSample')
                    : loadedDoc.source === 'paste'
                    ? t('upload.sourcePasted')
                    : 'Local file'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={triggerFilePicker}>
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t('upload.replaceDocument')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPasteText('');
                  onRemoveDocument();
                }}
                className="text-rose-700 hover:bg-rose-50 hover:text-rose-800"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('upload.removeDocument')}
              </Button>
            </div>
          </div>
        )}

        {/* Input Mode Tabs */}
        <div
          className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer',
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t('upload.fileTab')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'paste'}
            onClick={() => setActiveTab('paste')}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors cursor-pointer',
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
            {t('upload.pasteTab')}
          </button>
        </div>

        {/* Hidden native file input (always mounted so Replace Document works from anywhere) */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          className="sr-only"
          aria-label={t('upload.chooseFile')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileSelection(file);
            e.target.value = '';
          }}
        />

        {activeTab === 'file' ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={triggerFilePicker}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFilePicker();
              }
            }}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-slate-300 bg-slate-50/60 hover:border-emerald-500 hover:bg-emerald-50/30'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-3 text-base font-semibold text-slate-900">
              {t('upload.dropzoneTitle')}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t('upload.dropzoneSubtitle')}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFilePicker();
                }}
              >
                {t('upload.chooseFile')}
              </Button>
              <span className="text-xs font-medium text-slate-500">
                {t('upload.supportedFormats')}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="paste-document-input"
                className="text-sm font-semibold text-slate-800"
              >
                {t('upload.pasteLabel')}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClipboardPaste}
                >
                  <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('upload.pasteButton')}
                </Button>
                {pasteText && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPasteText('')}
                  >
                    {t('upload.clearText')}
                  </Button>
                )}
              </div>
            </div>

            <textarea
              id="paste-document-input"
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={t('upload.pastePlaceholder')}
              className="w-full rounded-xl border border-slate-300 bg-white p-3.5 font-mono text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />

            <div className="flex justify-end">
              <Button size="lg" onClick={handlePasteSubmit}>
                {t('upload.scanPastedText')}
              </Button>
            </div>
          </div>
        )}

        {/* Inline Validation Error */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-rose-600"
              aria-hidden="true"
            />
            <span>{errorMsg}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
