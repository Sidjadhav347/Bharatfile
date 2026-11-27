export interface SampleDocumentPreset {
  filename: string;
  format: 'txt' | 'csv';
  content: string;
}

/**
 * 100% fictional sample document for instant hackathon & first-time user testing.
 * Contains all 6 supported PII categories, repeated items to showcase Consistent Pseudonymization,
 * a Luhn-valid test card (4111 1111 1111 1111), and an invalid 16-digit string (1234 5678 9012 3456)
 * that fails Luhn checksum validation to prove false-positive prevention.
 */
export const SAMPLE_DOCUMENT: SampleDocumentPreset = {
  filename: 'sample-hospital-intake-form.txt',
  format: 'txt',
  content: `PATIENT INTAKE & BILLING SUMMARY (FICTIONAL DEMO RECORD)
=======================================================
Organization: Sunrise Community Clinic (Outpatient Desk)
Case Reference: CLINIC-2026-8841

Primary Contact Details:
- Patient Email: rohan.verma.demo@gmail.com
- Alternate / Billing Email: rohan.verma.demo@gmail.com
- Secondary Contact Email: priya.nair.test@example.org
- Primary Mobile: +91 98765 43210
- Emergency Callback: 9876543210
- Alternate Mobile: 91234-56789

Government & Identity Verification:
- PAN Card Number: ABCPK4821M
- Aadhaar Number: 2345 6789 0124
- Guardian Aadhaar: 3456-7890-1238

Payment & Network Audit Metadata:
- Authorized Test Card (Luhn-Valid): 4111 1111 1111 1111
- Hospital Claim Reference ID (Non-Card / Fails Luhn): 1234 5678 9012 3456
- Portal Submission IPv4: 192.168.10.45
- Backup Gateway IPv4: 10.24.108.19

Notes for Reviewer:
Please forward the sanitized copy of this intake sheet to the insurance verification desk.
Confirmation copy should go to rohan.verma.demo@gmail.com or +91 98765 43210.`,
};
