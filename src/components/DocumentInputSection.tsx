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

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
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
    <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="border-b border-neutral-100 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('upload.heading')}</CardTitle>
            <CardDescription className="mt-1">
              {t('upload.subheading')}
            </CardDescription>
          </div>

          {/* Reset sample document action if currently loaded */}
          {loadedDoc?.source === 'sample' && (
            <Button
              variant="outline"
              size="default"
              onClick={onResetSample}
              className="w-full sm:w-auto"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t('upload.resetSample')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Prominent Sample Document Callout Banner for First-Time Users */}
        {!loadedDoc && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/80 p-4 sm:p-5 shadow-2xs">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">
                  {t('upload.sampleCalloutTitle')}
                </p>
                <p className="text-xs text-neutral-600 mt-1 max-w-xl leading-relaxed">
                  {t('upload.sampleCalloutDesc')}
                </p>
              </div>
            </div>
            <Button
              variant="default"
              size="lg"
              onClick={onLoadSample}
              className="w-full sm:w-auto shrink-0 bg-neutral-900 text-white hover:bg-neutral-800 shadow-xs cursor-pointer font-bold"
            >
              <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
              {t('upload.trySample')}
            </Button>
          </div>
        )}
        {/* Selected Document Status Bar */}
        {loadedDoc && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-2xs">
                {loadedDoc.format === 'csv' ? (
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <FileText className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {t('upload.selectedFile')}:
                  </span>
                  <span className="truncate text-sm font-bold text-neutral-900">
                    {loadedDoc.filename}
                  </span>
                  <Badge variant="indigo">
                    {loadedDoc.format.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
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
                <RefreshCw className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
                {t('upload.replaceDocument')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPasteText('');
                  onRemoveDocument();
                }}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                {t('upload.removeDocument')}
              </Button>
            </div>
          </div>
        )}

        {/* Adobe-style Pill Segment Tabs */}
        <div
          className="inline-flex rounded-full border border-neutral-200 bg-neutral-100 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'file'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            {t('upload.fileTab')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'paste'}
            onClick={() => setActiveTab('paste')}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer',
              activeTab === 'paste'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
            {t('upload.pasteTab')}
          </button>
        </div>

        {/* Hidden native file input */}
        <input
          ref={fileInputRef}
          id="native-file-upload-input"
          type="file"
          accept=".txt,.csv,text/plain,text/csv"
          className="hidden"
          aria-label={t('upload.chooseFile')}
          onChange={(e) => {
            const file = e.target.files?.[0];
            handleFileSelection(file);
            e.target.value = '';
          }}
        />

        {activeTab === 'file' ? (
          <label
            htmlFor="native-file-upload-input"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all cursor-pointer select-none',
              isDragging
                ? 'border-neutral-900 bg-neutral-100/80 scale-[0.99]'
                : 'border-neutral-200 bg-neutral-50/70 hover:border-neutral-400 hover:bg-neutral-100/50'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-neutral-900 shadow-2xs border border-neutral-200 group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-bold text-neutral-900">
              {t('upload.dropzoneTitle')}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {t('upload.dropzoneSubtitle')}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFilePicker();
                }}
              >
                {t('upload.chooseFile')}
              </Button>
              <span className="text-xs text-neutral-400">
                {t('upload.supportedFormats')}
              </span>
            </div>
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="paste-document-input"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-500"
              >
                {t('upload.pasteLabel')}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClipboardPaste}
                >
                  <ClipboardPaste className="h-3.5 w-3.5 text-neutral-600" aria-hidden="true" />
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
              className="w-full rounded-2xl border border-neutral-200 bg-white p-4 font-mono text-xs text-neutral-900 shadow-2xs placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 leading-relaxed"
            />

            <div className="flex justify-end">
              <Button size="default" onClick={handlePasteSubmit}>
                {t('upload.scanPastedText')}
              </Button>
            </div>
          </div>
        )}

        {/* Inline Validation Error */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900"
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
