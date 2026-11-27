// UIDAI Aadhaar uses the Verhoeff dihedral group D5 checksum algorithm.
// Note: Format and checksum validation only confirm mathematical structure;
// they never prove an Aadhaar number is genuine or belongs to a real person.

const D_TABLE: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const P_TABLE: readonly (readonly number[])[] = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

const INV_TABLE: readonly number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

export function normalizeAadhaarDigits(candidate: string): string {
  return candidate.replace(/[\s-]+/g, '');
}

export function isValidVerhoeff(digitsOnly: string): boolean {
  if (!/^\d+$/.test(digitsOnly)) {
    return false;
  }

  let checksum = 0;
  for (let i = 0; i < digitsOnly.length; i += 1) {
    const digit = digitsOnly.charCodeAt(digitsOnly.length - 1 - i) - 48;
    checksum = D_TABLE[checksum][P_TABLE[i % 8][digit]];
  }
  return checksum === 0;
}

export function computeVerhoeffCheckDigit(baseDigits: string): number {
  let checksum = 0;
  for (let i = 0; i < baseDigits.length; i += 1) {
    const digit = baseDigits.charCodeAt(baseDigits.length - 1 - i) - 48;
    checksum = D_TABLE[checksum][P_TABLE[(i + 1) % 8][digit]];
  }
  return INV_TABLE[checksum];
}

export function isValidAadhaarCandidate(candidate: string): boolean {
  const normalized = normalizeAadhaarDigits(candidate);
  if (!/^[2-9]\d{11}$/.test(normalized)) {
    return false;
  }
  return isValidVerhoeff(normalized);
}
