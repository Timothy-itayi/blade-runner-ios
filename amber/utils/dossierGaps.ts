/**
 * Dossier Gap System
 * 
 * Generates random missing fields for dossiers. Gaps are deterministic
 * per subject (same subject always has same gaps) to ensure consistency.
 * 
 * Scan quality affects the number of gaps:
 * - PARTIAL: 3-4 fields missing (60% information loss)
 * - STANDARD: 2-3 fields missing (40% information loss)
 * - DEEP: 1-2 fields missing (20% information loss)
 * - COMPLETE: 0-1 fields missing (minimal information loss)
 */

import { ScanQuality } from '../types/information';

export type DossierField = 'name' | 'dateOfBirth' | 'address' | 'occupation' | 'sex';

export interface DossierGaps {
  name?: boolean; // true = missing
  dateOfBirth?: boolean;
  address?: boolean;
  occupation?: boolean;
  sex?: boolean;
}

/**
 * Generates a deterministic random number based on a seed string
 */
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647; // Normalize to 0-1
}

/**
 * Generates random gaps for a subject's dossier
 * Gaps are deterministic based on subject ID (same subject = same gaps)
 * Scan quality affects the number of gaps generated
 * 
 * @param subjectId - Subject ID (e.g., "S1-01")
 * @param scanQuality - Quality of identity scan (affects gap count)
 * @returns Object indicating which fields are missing
 */
export function generateDossierGaps(
  subjectId: string,
  scanQuality?: ScanQuality
): DossierGaps {
  const random = seededRandom(subjectId);
  
  // Determine gap count based on scan quality
  let gapCount: number;
  if (!scanQuality || scanQuality === 'COMPLETE') {
    // Complete scan: 0-1 fields missing (minimal gaps)
    gapCount = Math.floor(random * 2); // 0-1 fields
  } else if (scanQuality === 'DEEP') {
    // Deep scan: 1-2 fields missing
    gapCount = Math.floor(random * 2) + 1; // 1-2 fields
  } else if (scanQuality === 'STANDARD') {
    // Standard scan: 2-3 fields missing
    gapCount = Math.floor(random * 2) + 2; // 2-3 fields
  } else {
    // Partial scan: 3-4 fields missing (most gaps)
    gapCount = Math.floor(random * 2) + 3; // 3-4 fields
  }
  
  // List of all possible fields
  const allFields: DossierField[] = ['name', 'dateOfBirth', 'address', 'occupation', 'sex'];
  
  // Shuffle using seeded random (deterministic per subject)
  const shuffledFields = [...allFields].sort(() => {
    const r1 = seededRandom(subjectId + allFields.indexOf(allFields[0]).toString());
    const r2 = seededRandom(subjectId + allFields.indexOf(allFields[1]).toString());
    return r1 - r2;
  });
  
  // Select random fields to remove (deterministic based on seed)
  const fieldsToRemove = shuffledFields.slice(0, gapCount);
  
  // Build gaps object
  const gaps: DossierGaps = {};
  fieldsToRemove.forEach(field => {
    gaps[field] = true;
  });
  
  return gaps;
}

/**
 * Checks if a specific field is missing in the dossier
 */
export function isFieldMissing(gaps: DossierGaps, field: DossierField): boolean {
  return gaps[field] === true;
}

/**
 * Gets a redacted version of a field value
 */
export function getRedactedValue(field: DossierField): string {
  return '[REDACTED]';
}
