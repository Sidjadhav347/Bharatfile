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
    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)]">
      {/* Sentra-style Window Header Bar with macOS dots & local status */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-slate-400 hidden sm:inline">
            local://document-sandbox
          </span>
        </div>

        {/* Try Sample Document Button - Sleek Sentra pill style */}
        <div className="flex items-center gap-2">
          {loadedDoc?.source === 'sample' ? (
            <button
              type="button"
              onClick={onResetSample}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-[#1965e0]" aria-hidden="true" />
              {t('upload.resetSample')}
            </button>
          ) : (
            <button
              type="button"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-[#1965e0] shadow-2xs hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {t('upload.trySample')}
            </button>
          )}
        </div>
      </div>

      <CardHeader className="border-b border-slate-100 pb-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t('upload.heading')}</CardTitle>
            <CardDescription className="mt-1">
              {t('upload.subheading')}
            </CardDescription>
          </div>
          <p className="text-xs font-medium text-slate-400">
            {t('upload.trySampleHint')}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Selected Document Status Bar */}
        {loadedDoc && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1965e0] text-white shadow-2xs">
                {loadedDoc.format === 'csv' ? (
                  <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <FileText className="h-5 w-5" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {t('upload.selectedFile')}:
                  </span>
                  <span className="truncate text-sm font-bold text-slate-900">
                    {loadedDoc.filename}
                  </span>
                  <Badge variant="indigo">
                    {loadedDoc.format.toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
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
                <RefreshCw className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
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

        {/* Input Mode Tabs */}
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-slate-100/70 p-1"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
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
              'inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" />
            {t('upload.pasteTab')}
          </button>
        </div>

        {/* Hidden native file input */}
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
              'group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-all cursor-pointer',
              isDragging
                ? 'border-[#1965e0] bg-blue-50/50 scale-[0.99]'
                : 'border-slate-200 bg-slate-50/50 hover:border-[#1965e0]/60 hover:bg-blue-50/20'
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#1965e0] shadow-2xs border border-slate-200/80 group-hover:scale-105 transition-transform">
              <Upload className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-900">
              {t('upload.dropzoneTitle')}
            </p>
            <p className="mt-1 text-xs text-slate-500">
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
              <span className="text-xs text-slate-400">
                {t('upload.supportedFormats')}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="paste-document-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {t('upload.pasteLabel')}
              </label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClipboardPaste}
                >
                  <ClipboardPaste className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
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
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 font-mono text-xs text-slate-900 shadow-2xs placeholder:text-slate-400 focus:border-[#1965e0] focus:outline-none focus:ring-2 focus:ring-[#1965e0]/20 leading-relaxed"
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
            className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-900"
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
