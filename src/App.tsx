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

      // Clear raw state and apply synchronously via microtask so scanning state renders cleanly
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <StepIndicator
          currentStep={currentStep}
          hasDownloaded={Boolean(lastDownloadedFile)}
        />

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

        <ComparisonWorkspace
          analysis={analysis}
          enabledCategories={enabledCategories}
          isScanning={isScanning}
        />

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

      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          {t('footer.builtForPrivacy')}
        </div>
      </footer>
    </div>
  );
}

export default App;
