import { CheckCircle2, Lock, Sparkles } from 'lucide-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ComparisonWorkspace } from './components/ComparisonWorkspace';
import { DetectionSummarySection } from './components/DetectionSummarySection';
import {
  DocumentInputSection,
  MAX_FILE_SIZE_BYTES,
  type LoadedDocumentMeta,
} from './components/DocumentInputSection';
import { DownloadSection } from './components/DownloadSection';
import { Header } from './components/Header';
import { ProcessingLogPanel } from './components/ProcessingLogPanel';
import { RedactionModeSelector } from './components/RedactionModeSelector';
import { StepIndicator } from './components/StepIndicator';
import {
  ALL_PII_CATEGORIES,
  DEFAULT_ENABLED_CATEGORIES,
  SAMPLE_DOCUMENT,
  analyzeDocument,
  type DocumentAnalysis,
  type EnabledCategories,
  type PiiCategory,
  type ProcessingLogEntry,
  type RedactionMode,
} from './engine';
import { formatBytes } from './lib/utils';

function nowTimeString(): string {
  return new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function makeLogEntry(
  key: string,
  level: ProcessingLogEntry['level'] = 'info',
  params?: Record<string, string | number>
): ProcessingLogEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: nowTimeString(),
    key,
    params,
    level,
  };
}

export function App() {
  const { t } = useTranslation();

  // All document content, scan results, and pseudonym maps stay strictly in React memory.
  const [rawContent, setRawContent] = React.useState<string | null>(null);
  const [loadedDoc, setLoadedDoc] = React.useState<LoadedDocumentMeta | null>(
    null
  );
  const [redactionMode, setRedactionMode] =
    React.useState<RedactionMode>('full');
  const [enabledCategories, setEnabledCategories] =
    React.useState<EnabledCategories>(DEFAULT_ENABLED_CATEGORIES);
  const [isScanning, setIsScanning] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [lastDownloadedFile, setLastDownloadedFile] = React.useState<
    string | null
  >(null);
  const [logs, setLogs] = React.useState<ProcessingLogEntry[]>([]);

  const appendLogs = React.useCallback((entries: ProcessingLogEntry[]) => {
    setLogs((prev) => [...entries, ...prev].slice(0, 60));
  }, []);

  const analysis: DocumentAnalysis | null = React.useMemo(() => {
    if (rawContent === null || !loadedDoc) {
      return null;
    }
    return analyzeDocument(
      rawContent,
      loadedDoc.format,
      redactionMode,
      enabledCategories
    );
  }, [rawContent, loadedDoc, redactionMode, enabledCategories]);

  const runInitialScanLogs = React.useCallback(
    (
      content: string,
      meta: LoadedDocumentMeta,
      mode: RedactionMode,
      enabled: EnabledCategories
    ) => {
      const result = analyzeDocument(content, meta.format, mode, enabled);
      const newEntries: ProcessingLogEntry[] = [
        meta.source === 'sample'
          ? makeLogEntry('log.entries.sampleLoaded', 'info')
          : makeLogEntry('log.entries.documentLoaded', 'info', {
              source: meta.filename,
              size: formatBytes(meta.sizeBytes),
            }),
        makeLogEntry('log.entries.scanStarted', 'info'),
        makeLogEntry('log.entries.scanCompleted', 'success', {
          total: result.totalDetected,
        }),
      ];

      for (const category of ALL_PII_CATEGORIES) {
        const count = result.countsByCategory[category];
        if (count > 0) {
          newEntries.push(
            makeLogEntry('log.entries.categoryCount', 'info', {
              count,
              categoryKey:
                count === 1
                  ? `categories.${category}Singular`
                  : `categories.${category}`,
            })
          );
        }
      }

      if (
        result.countsByCategory.credit_card > 0 ||
        result.rejectedCardCandidates > 0
      ) {
        newEntries.push(
          makeLogEntry('log.entries.luhnValidated', 'info', {
            accepted: result.countsByCategory.credit_card,
            rejected: result.rejectedCardCandidates,
          })
        );
      }

      if (result.csvParseWarnings && result.csvParseWarnings.length > 0) {
        newEntries.push(
          makeLogEntry('log.entries.csvWarning', 'warning', {
            count: result.csvParseWarnings.length,
          })
        );
      }

      newEntries.push(
        makeLogEntry('log.entries.modeChanged', 'info', {
          modeKey: `modes.${mode}.title`,
        }),
        makeLogEntry('log.entries.outputGenerated', 'success', {
          format: meta.format.toUpperCase(),
        })
      );

      // Reverse so newest item appears at the top of the log panel
      appendLogs([...newEntries].reverse());
    },
    [appendLogs]
  );

  const loadContent = React.useCallback(
    (content: string, meta: LoadedDocumentMeta) => {
      setErrorMsg(null);
      setLastDownloadedFile(null);
      setIsScanning(true);

      setRawContent(content);
      setLoadedDoc(meta);
      runInitialScanLogs(content, meta, redactionMode, enabledCategories);
      setIsScanning(false);
    },
    [enabledCategories, redactionMode, runInitialScanLogs]
  );

  const handleLoadFile = async (file: File) => {
    const lowerName = file.name.toLowerCase();
    const isTxt = lowerName.endsWith('.txt');
    const isCsv = lowerName.endsWith('.csv');

    if (!isTxt && !isCsv) {
      setErrorMsg(t('errors.unsupportedType'));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMsg(t('errors.fileTooLarge'));
      return;
    }

    if (file.size === 0) {
      setErrorMsg(t('errors.emptyFile'));
      return;
    }

    try {
      const text = await file.text();
      if (!text.trim()) {
        setErrorMsg(t('errors.emptyFile'));
        return;
      }

      loadContent(text, {
        filename: file.name,
        sizeBytes: file.size,
        format: isCsv ? 'csv' : 'txt',
        source: 'file',
      });
    } catch {
      setErrorMsg(t('errors.readFailed'));
    }
  };

  const handleLoadPastedText = (text: string) => {
    const byteSize = new Blob([text]).size;
    loadContent(text, {
      filename: 'pasted-document.txt',
      sizeBytes: byteSize,
      format: 'txt',
      source: 'paste',
    });
  };

  const handleLoadSample = () => {
    const byteSize = new Blob([SAMPLE_DOCUMENT.content]).size;
    setEnabledCategories(DEFAULT_ENABLED_CATEGORIES);
    loadContent(SAMPLE_DOCUMENT.content, {
      filename: SAMPLE_DOCUMENT.filename,
      sizeBytes: byteSize,
      format: SAMPLE_DOCUMENT.format,
      source: 'sample',
    });
  };

  const handleResetSample = () => {
    setRedactionMode('full');
    setEnabledCategories(DEFAULT_ENABLED_CATEGORIES);
    const byteSize = new Blob([SAMPLE_DOCUMENT.content]).size;
    setErrorMsg(null);
    setLastDownloadedFile(null);
    setRawContent(SAMPLE_DOCUMENT.content);
    const meta: LoadedDocumentMeta = {
      filename: SAMPLE_DOCUMENT.filename,
      sizeBytes: byteSize,
      format: SAMPLE_DOCUMENT.format,
      source: 'sample',
    };
    setLoadedDoc(meta);
    runInitialScanLogs(
      SAMPLE_DOCUMENT.content,
      meta,
      'full',
      DEFAULT_ENABLED_CATEGORIES
    );
  };

  const handleRemoveDocument = () => {
    setRawContent(null);
    setLoadedDoc(null);
    setErrorMsg(null);
    setLastDownloadedFile(null);
    setEnabledCategories(DEFAULT_ENABLED_CATEGORIES);
    appendLogs([makeLogEntry('log.entries.documentCleared', 'info')]);
  };

  const handleChangeMode = (newMode: RedactionMode) => {
    setRedactionMode(newMode);
    setLastDownloadedFile(null);
    if (loadedDoc) {
      appendLogs([
        makeLogEntry('log.entries.outputGenerated', 'success', {
          format: loadedDoc.format.toUpperCase(),
        }),
        makeLogEntry('log.entries.modeChanged', 'info', {
          modeKey: `modes.${newMode}.title`,
        }),
      ]);
    }
  };

  const handleToggleCategory = (category: PiiCategory, enabled: boolean) => {
    setEnabledCategories((prev) => ({
      ...prev,
      [category]: enabled,
    }));
    setLastDownloadedFile(null);
    appendLogs([
      makeLogEntry('log.entries.categoryToggled', 'info', {
        categoryKey: `categories.${category}`,
        stateKey: enabled
          ? 'log.entries.stateEnabled'
          : 'log.entries.stateDisabled',
      }),
    ]);
  };

  const handleSetAllCategories = (enabled: boolean) => {
    const next: EnabledCategories = {
      email: enabled,
      phone: enabled,
      ipv4: enabled,
      pan: enabled,
      aadhaar: enabled,
      credit_card: enabled,
    };
    setEnabledCategories(next);
    setLastDownloadedFile(null);
  };

  const handleDownloadComplete = (filename: string) => {
    setLastDownloadedFile(filename);
    appendLogs([
      makeLogEntry('log.entries.fileDownloaded', 'success', { filename }),
    ]);
  };

  const currentStep: 1 | 2 | 3 | 4 = !analysis
    ? 1
    : lastDownloadedFile
    ? 4
    : 3;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 overflow-x-hidden">
      {/* Sentra-inspired subtle background grid & atmospheric gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-grid-subtle opacity-75" />
      <div className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute top-80 -left-20 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />

      <Header />

      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 space-y-7 px-4 py-8 sm:px-6 lg:px-8">
        {/* Sentra-style Hero Header Section */}
        <section aria-label="Hero Introduction" className="pt-2 sm:pt-4">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-[#1965e0]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Next-Gen Client-Side PII Sanitizer</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.12]">
                Privacy that explains itself.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {t('intro.heading')} {t('intro.subheading')}
              </p>
            </div>

            {/* Sentra-style Floating Privacy Reassurance Badge */}
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm lg:max-w-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Device Isolation Guarantee</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {t('app.privacyBanner')}
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                {t('app.privacySubnote')}
              </p>
            </div>
          </div>
        </section>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          hasDownloaded={Boolean(lastDownloadedFile)}
        />

        {/* Document Input Section */}
        <DocumentInputSection
          loadedDoc={loadedDoc}
          errorMsg={errorMsg}
          onLoadFile={handleLoadFile}
          onLoadPastedText={handleLoadPastedText}
          onLoadSample={handleLoadSample}
          onResetSample={handleResetSample}
          onRemoveDocument={handleRemoveDocument}
          onSetError={setErrorMsg}
        />

        {/* Detection Summary & Redaction Mode Selection */}
        {analysis && (
          <>
            <DetectionSummarySection
              analysis={analysis}
              enabledCategories={enabledCategories}
              redactionMode={redactionMode}
              onToggleCategory={handleToggleCategory}
              onSetAllCategories={handleSetAllCategories}
            />

            <RedactionModeSelector
              mode={redactionMode}
              onChangeMode={handleChangeMode}
            />
          </>
        )}

        {/* Side-by-Side Comparison Workspace */}
        <ComparisonWorkspace
          analysis={analysis}
          enabledCategories={enabledCategories}
          isScanning={isScanning}
        />

        {/* Download Section & Processing Log */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DownloadSection
            analysis={analysis}
            loadedDoc={loadedDoc}
            lastDownloadedFile={lastDownloadedFile}
            onDownloadComplete={handleDownloadComplete}
          />
          <ProcessingLogPanel entries={logs} />
        </div>
      </main>

      <footer className="relative z-10 border-t border-slate-200/80 bg-white/80 py-5 backdrop-blur-xs">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <span>{t('footer.builtForPrivacy')}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Client-side only</span>
            <span>·</span>
            <span>Luhn Validated</span>
            <span>·</span>
            <span>Zero Remote Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
