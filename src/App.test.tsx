import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import i18n from './i18n';
import App from './App';

describe('PrivacyGuard App integration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('renders privacy guarantee banner and loads one-click sample document with all modes', () => {
    render(<App />);

    expect(
      screen.getByText(
        'Your document stays on your device. We process it locally in your browser.'
      )
    ).toBeInTheDocument();

    const sampleBtn = screen.getByRole('button', {
      name: /Try Sample Document/i,
    });
    fireEvent.click(sampleBtn);

    // Shows Luhn rejection badge and redacted output
    expect(
      screen.getByText(/rejected by Luhn checksum/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText('[REDACTED]').length).toBeGreaterThan(0);

    // Switch to Partial Mask
    fireEvent.click(screen.getByRole('radio', { name: /Partial Mask/i }));
    expect(screen.getAllByText('r***@gmail.com').length).toBeGreaterThan(0);
    expect(screen.getAllByText('XXXX-XXXX-XXXX-1111').length).toBeGreaterThan(0);

    // Switch to Consistent Pseudonymization
    fireEvent.click(
      screen.getByRole('radio', { name: /Consistent Pseudonymization/i })
    );
    expect(screen.getAllByText('EMAIL_01').length).toBeGreaterThan(0);
    expect(screen.getAllByText('PHONE_01').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CARD_01').length).toBeGreaterThan(0);
  });

  it('switches the full UI cleanly between English and Hindi', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'हिन्दी' }));

    expect(
      screen.getByText(
        'आपका दस्तावेज़ आपके ही डिवाइस पर रहता है। हम इसे सीधे आपके ब्राउज़र में सुरक्षित रूप से प्रोसेस करते हैं।'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /नमूना दस्तावेज़ आज़माएँ/i })
    ).toBeInTheDocument();
  });

  it('exports sanitized text via Blob API and never original raw PII', async () => {
    const createdBlobs: Blob[] = [];
    const OriginalBlob = globalThis.Blob;
    class SpyBlob extends OriginalBlob {
      constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        if (options?.type?.includes('text/')) {
          createdBlobs.push(this);
        }
      }
    }
    vi.stubGlobal('Blob', SpyBlob);
    const createUrlSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:mock-url');
    const revokeSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {});
    const anchorClickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    render(<App />);
    fireEvent.click(
      screen.getByRole('button', { name: /Try Sample Document/i })
    );

    const downloadBtn = screen.getByRole('button', {
      name: /Download Sanitized TXT/i,
    });
    fireEvent.click(downloadBtn);

    expect(createUrlSpy).toHaveBeenCalledTimes(1);
    expect(anchorClickSpy).toHaveBeenCalledTimes(1);
    expect(createdBlobs.length).toBe(1);
    const exportedText = await createdBlobs[0].text();
    expect(exportedText).toContain('[REDACTED]');
    expect(exportedText).not.toContain('rohan.verma.demo@gmail.com');
    expect(exportedText).not.toContain('4111 1111 1111 1111');

    vi.unstubAllGlobals();
    createUrlSpy.mockRestore();
    revokeSpy.mockRestore();
    anchorClickSpy.mockRestore();
  });
});
