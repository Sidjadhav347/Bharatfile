# PrivacyGuard

> **Share your documents. Protect your privacy.**

PrivacyGuard is a 100% client-side browser application that helps everyday users detect and redact Personally Identifiable Information (PII) from `.txt` and `.csv` documents before sharing them with hospitals, schools, employers, or government offices.

## Privacy Architecture

- **Zero Server Communication:** All file reading, PII scanning, checksum validation, redaction, diffing, and file export execute locally inside your browser.
- **In-Memory Only:** Uploaded documents, pasted text, detected entities, and pseudonym mappings live strictly in browser memory (`React` state) and are never stored in `localStorage`, `sessionStorage`, cookies, or remote storage.
- **Offline Ready After Load:** Once the app loads in the browser, you can disconnect from the internet and continue sanitizing documents without any network requests.
- **No Sensitive Logging:** The Local Processing Log records only operational events and counts (never raw PII values).

## Key Features

1. **4-Step Guided Workflow**
   - **Step 1:** Upload `.txt`/`.csv` via drag-and-drop or file picker, paste text, or click **Try Sample Document** (**नमूना दस्तावेज़ आज़माएँ**).
   - **Step 2:** Automatically detect Email addresses, Indian Phone numbers, IPv4 addresses, Indian PAN numbers, Indian Aadhaar numbers, and Credit Card numbers.
   - **Step 3:** Choose between **Full Mask**, **Partial Mask**, and **Consistent Pseudonymization** (`EMAIL_01`, `PHONE_01`, etc. with separate per-category namespaces), toggle individual categories, and inspect the live side-by-side comparison.
   - **Step 4:** One-click sanitized `.txt` or `.csv` download via native browser `Blob` and `URL` APIs.
2. **Mandatory Credit Card Luhn Validation**
   - Normalizes spaces and hyphens, checks 13–19 digits, and validates the Luhn checksum before classifying any candidate as a credit card.
   - Prevents false positives such as `1234 5678 9012 3456`.
3. **Aadhaar Verhoeff Validation**
   - Validates 12-digit `[2-9]` starting digit format and UIDAI Verhoeff checksum locally.
4. **English & Hindi Support**
   - Complete bilingual interface powered by `i18next` and `react-i18next`.
5. **CSV Structure Preservation**
   - Parses and re-serializes `.csv` files using `papaparse`, sanitizing each cell while preserving rows, columns, and consistent pseudonyms across the table.

## Project Structure

```text
src/
├── components/
│   ├── ui/                       # Reusable Tailwind + CVA UI primitives
│   ├── ComparisonWorkspace.tsx   # Highlighted, Line Diff, and CSV Table side-by-side panels
│   ├── DetectionSummarySection.tsx
│   ├── DocumentInputSection.tsx
│   ├── DownloadSection.tsx
│   ├── Header.tsx
│   ├── ProcessingLogPanel.tsx
│   ├── RedactionModeSelector.tsx
│   └── StepIndicator.tsx
├── engine/
│   ├── __tests__/                # Vitest unit tests (Luhn, detectors, redactor, CSV, sample)
│   ├── csvProcessor.ts           # PapaParse-based CSV sanitization & analysis
│   ├── detectors.ts              # Bounded regexes + non-overlapping entity resolver
│   ├── luhn.ts                   # Reusable Luhn checksum validator
│   ├── redactor.ts               # Full, Partial, and Consistent Pseudonymization modes
│   ├── sampleDocument.ts         # Fictional demo record with all 6 PII types + Luhn demo
│   ├── types.ts
│   └── verhoeff.ts               # Verhoeff checksum validator for Aadhaar format
├── i18n/
│   ├── en.ts
│   ├── hi.ts
│   └── index.ts
├── App.tsx
└── main.tsx
```

## Setup & Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit and UI integration tests
npm test

# Type-check and build production bundle
npm run build
```

## Important Disclaimers

- **Luhn & Verhoeff Checksums:** Passing Luhn or Verhoeff validation confirms mathematical format/checksum validity only; it does not prove a card or Aadhaar number exists, is active, or belongs to a real person.
- **Manual Review:** Automated detection catches structured PII patterns but cannot guarantee 100% detection of every sensitive detail. Always review the sanitized preview before sharing.
