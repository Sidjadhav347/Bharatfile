export const enTranslations = {
  app: {
    name: 'PrivacyGuard',
    tagline: 'Share your documents. Protect your privacy.',
    privacyBadge: '100% Local Processing',
    privacyBanner:
      'Your document stays on your device. We process it locally in your browser.',
    privacySubnote:
      'No servers, no cloud AI, no analytics on document text, and no browser storage of your files.',
    languageLabel: 'Language',
    english: 'English',
    hindi: 'हिन्दी',
  },
  intro: {
    heading: 'Protect your file before sharing.',
    subheading:
      'Find and hide private information in your documents.',
  },
  steps: {
    step1Title: 'Upload or Paste',
    step1Desc: 'Add a TXT/CSV file, paste text, or load the sample.',
    step2Title: 'Auto-Detect PII',
    step2Desc: 'Automatically find private information locally.',
    step3Title: 'Protect & Review',
    step3Desc: 'Choose masking style and verify side by side.',
    step4Title: 'Download Safe File',
    step4Desc: 'Export your sanitized TXT or CSV document.',
    stepPrefix: 'STEP {{number}}',
  },
  upload: {
    heading: 'Step 1: Add Your Document',
    subheading:
      'Drop a .txt or .csv file, paste text directly, or try our instant sample record.',
    trySample: 'Try Sample Document',
    trySampleHint:
      'Loads a safe, fictional record covering all 6 PII types plus a Luhn false-positive demo.',
    resetSample: 'Reset Sample',
    dropzoneTitle: 'Drag and drop your TXT or CSV file here',
    dropzoneSubtitle: 'Or click to choose a file from your device (max 5 MB)',
    chooseFile: 'Choose TXT / CSV File',
    supportedFormats: 'Supported formats: .txt and .csv only',
    pasteTab: 'Paste Text',
    fileTab: 'Upload File',
    pasteLabel: 'Paste or type document text below',
    pastePlaceholder:
      'Paste text containing emails, phone numbers, Aadhaar, PAN, IPv4, or card numbers here...',
    pasteButton: 'Paste from Clipboard',
    scanPastedText: 'Scan & Protect Text',
    clearText: 'Clear',
    selectedFile: 'Selected document',
    fileSize: 'Size',
    sourcePasted: 'Pasted text',
    sourceSample: 'Fictional sample document',
    replaceDocument: 'Replace Document',
    removeDocument: 'Remove Document',
    clipboardUnavailable:
      'Clipboard access was blocked by the browser. Please paste directly into the box (Ctrl+V).',
  },
  categories: {
    email: 'Email Addresses',
    emailSingular: 'Email',
    phone: 'Phone Numbers',
    phoneSingular: 'Phone Number',
    aadhaar: 'Aadhaar Numbers',
    aadhaarSingular: 'Aadhaar Number',
    pan: 'PAN Numbers',
    panSingular: 'PAN Number',
    credit_card: 'Credit Card Numbers',
    credit_cardSingular: 'Credit Card Number',
    ipv4: 'IPv4 Addresses',
    ipv4Singular: 'IPv4 Address',
  },
  summary: {
    heading: 'Step 2: Private Information Found',
    subheading:
      'Toggle any category on or off before exporting. All categories are protected by default.',
    totalDetected: 'Total detected',
    totalSelected: 'Selected for redaction',
    currentMode: 'Active mode',
    rejectedCardsBadge:
      '{{count}} card-like number(s) rejected by Luhn checksum (false positives prevented)',
    enableAll: 'Protect All',
    disableAll: 'Uncheck All',
    toggleCategoryAria: 'Toggle protection for {{category}}',
    noEntitiesTitle: 'No private information detected',
    noEntitiesDesc:
      'We scanned your document locally and did not find matches for the supported patterns. Please still review manually before sharing.',
  },
  modes: {
    heading: 'Step 3: Choose Protection Mode & Review',
    subheading:
      'Pick how sensitive values are hidden. Updates appear immediately in the comparison panel.',
    full: {
      title: 'Full Mask',
      description: 'Replaces the entire sensitive value with [REDACTED].',
      example: 'Example: [REDACTED]',
    },
    partial: {
      title: 'Partial Mask',
      description:
        'Hides private digits/letters while keeping small hints for verification.',
      example: 'Examples: r***@gmail.com, XXXXXXX210, XXXX-XXXX-XXXX-1234',
    },
    pseudonym: {
      title: 'Consistent Pseudonymization',
      description:
        'Replaces repeated values with the same ID (e.g., EMAIL_01, PHONE_01) in memory only.',
      example: 'Example: EMAIL_01, PHONE_01',
    },
  },
  comparison: {
    heading: 'Side-by-Side Comparison',
    originalTitle: 'Original Document (Device Only)',
    sanitizedTitle: 'Sanitized Output (Safe to Share)',
    viewFormatted: 'Highlighted View',
    viewDiff: 'Line Diff View',
    viewTable: 'Structured CSV Table',
    viewRawCsv: 'Raw CSV Text',
    legendOriginal: 'Detected PII',
    legendSanitized: 'Protected Replacement',
    legendAdded: 'Sanitized Line',
    legendRemoved: 'Original Line',
    csvRow: 'Row {{num}}',
    emptyTitle: 'Ready to protect your document',
    emptyDesc:
      'Upload a TXT/CSV file, paste text, or click "Try Sample Document" above to see an instant side-by-side preview.',
    scanning: 'Scanning document locally in your browser...',
    luhnNote:
      'Credit cards are validated using the Luhn checksum. A Luhn-valid number only confirms mathematical checksum validity — it does not prove a card exists, is active, or belongs to a real person.',
    aadhaarNote:
      'Aadhaar numbers are checked for 12-digit format and Verhoeff checksum. Format validation does not prove an Aadhaar number is genuine or belongs to a real person.',
    reviewReminderTitle: 'Please review before sharing',
    reviewReminderBody:
      'Automated detection catches common structured patterns, but it can never guarantee 100% detection of every private detail (such as names, handwritten notes, or custom IDs). Always review the sanitized output before sharing.',
  },
  download: {
    heading: 'Step 4: Download Sanitized File',
    subheading:
      'Your sanitized file is generated directly in your browser. The original file is never exported.',
    downloadButton: 'Download Sanitized {{format}}',
    copyButton: 'Copy Sanitized Text',
    copied: 'Copied to clipboard!',
    successMessage:
      'Downloaded {{filename}} safely from your browser.',
    disabledHint: 'Load or paste a document first to enable download.',
    filenamePrefix: 'sanitized-',
  },
  log: {
    heading: 'Local Processing Log',
    subheading:
      'Kept in browser memory only. Sensitive values are never recorded in this log.',
    empty: 'No activity yet. Load a document or try the sample to begin.',
    entries: {
      documentLoaded: 'Document loaded locally ({{source}}, {{size}})',
      sampleLoaded: 'Fictional sample document loaded locally in memory',
      scanStarted: 'Local browser scan started',
      scanCompleted: 'Scan completed — {{total}} sensitive item(s) classified',
      categoryCount: '{{count}} {{category}} detected',
      luhnValidated:
        'Credit card Luhn checksum check completed ({{accepted}} valid, {{rejected}} rejected)',
      modeChanged: 'Redaction mode set to {{mode}}',
      categoryToggled: '{{category}} protection {{state}}',
      stateEnabled: 'enabled',
      stateDisabled: 'disabled',
      outputGenerated: 'Sanitized {{format}} output generated locally',
      fileDownloaded: 'Sanitized file "{{filename}}" downloaded via browser Blob API',
      documentCleared: 'Document cleared from browser memory',
      csvWarning: 'CSV parser handled {{count}} formatting notice(s) safely',
    },
  },
  errors: {
    unsupportedType:
      'Unsupported file format. PrivacyGuard currently supports only .txt and .csv files.',
    fileTooLarge:
      'File exceeds the 5 MB browser safety limit. Please choose a smaller .txt or .csv file.',
    emptyFile:
      'The selected file appears to be empty. Please upload a file with text content.',
    emptyPaste: 'Please enter or paste some text before scanning.',
    readFailed: 'Could not read the selected file locally. Please try again.',
    csvMalformed:
      'Some rows in this CSV had formatting irregularities ({{details}}). PrivacyGuard safely preserved available cells.',
  },
  footer: {
    builtForPrivacy:
      'PrivacyGuard runs 100% client-side. Disconnect from the internet after loading to verify zero network requests.',
  },
} as const;
