/**
 * Dossier Gap System
 * 
 * Generates random missing fields for dossiers. Gaps are deterministic
 * per subject (same subject always has same gaps) to ensure consistency.
 */

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
 * 
 * @param subjectId - Subject ID (e.g., "S1-01")
 * @returns Object indicating which fields are missing
 */
export function generateDossierGaps(subjectId: string): DossierGaps {
  const random = seededRandom(subjectId);
  
  // Determine how many fields to remove (1-4 fields)
  // Use the random value to determine count
  const gapCount = Math.floor(random * 4) + 1; // 1-4 fields
  
  // List of all possible fields
  const allFields: DossierField[] = ['name', 'dateOfBirth', 'address', 'occupation', 'sex'];
  
  // Shuffle using seeded random
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
