// =============================================================================
// CREDENTIAL TYPES - Phase 4: Subject Interaction
// Credential definitions and presentation behaviors
// =============================================================================

import { CredentialBehavior } from './subjectGreetings';

// 6 Credential Types
export type CredentialType =
  | 'PASSPORT'           // Standard identification
  | 'WORK_PERMIT'        // Employment authorization
  | 'VISITOR_VISA'       // Temporary entry permit
  | 'MEDICAL_CLEARANCE'  // Health documentation
  | 'DIPLOMATIC_PASS'    // Special diplomatic access
  | 'TRANSIT_PERMIT';    // Short-term transit only

export interface CredentialDetails {
  type: CredentialType;
  number: string;
  issuedBy: string;
  issuedDate: string;
  expirationDate: string;
  holderName: string;
  originPlanet: string;
  destinationPlanet: string;
  purpose: string;
  valid: boolean;
  anomalies: string[]; // Any issues detected
}

export interface SubjectCredential {
  subjectId: string;
  presentationBehavior: CredentialBehavior;
  credentials: CredentialDetails[];
  presentationDelay: number; // Seconds before presenting (0 = immediate)
  excuseIfMissing?: string; // What they say if credentials are missing/reluctant
  suspiciousDetails: string[]; // Details that should raise suspicion
}

// Credential type display names
export const CREDENTIAL_TYPE_NAMES: Record<CredentialType, string> = {
  PASSPORT: 'REGIONAL PASSPORT',
  WORK_PERMIT: 'WORK AUTHORIZATION',
  VISITOR_VISA: 'VISITOR VISA',
  MEDICAL_CLEARANCE: 'MEDICAL CLEARANCE',
  DIPLOMATIC_PASS: 'DIPLOMATIC PASS',
  TRANSIT_PERMIT: 'TRANSIT PERMIT',
};

// Helper function to get credential data by subject ID or from subject data
export function getSubjectCredentials(
  subjectId: string,
  subjectData?: import('./subjects').SubjectData
): SubjectCredential | undefined {
  // If subject has inline credential data (from factory), use that
  if (subjectData?.credentialType && subjectData?.credentialDetails) {
    const details = Array.isArray(subjectData.credentialDetails) 
      ? subjectData.credentialDetails 
      : [subjectData.credentialDetails];
    const allAnomalies = details.flatMap(d => d.anomalies || []);
    return {
      subjectId,
      presentationBehavior: subjectData.credentialBehavior || 'COOPERATIVE',
      credentials: details,
      presentationDelay: subjectData.credentialBehavior === 'RELUCTANT' ? 3 : 0,
      suspiciousDetails: allAnomalies,
    };
  }
  
  // Otherwise, look up from static array
  return SUBJECT_CREDENTIALS.find(c => c.subjectId === subjectId);
}

// Subject credential data - matches subjects.ts by ID
export const SUBJECT_CREDENTIALS: SubjectCredential[] = [];

// Helper function to get credential data by subject ID
// Legacy function - use getSubjectCredentials with subjectData parameter instead
export function getSubjectCredentialsLegacy(subjectId: string): SubjectCredential | undefined {
  return SUBJECT_CREDENTIALS.find(c => c.subjectId === subjectId);
}

// Permit status type including UNVERIFIED for transit flag contradictions
export type PermitStatus = 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'INVALID' | 'UNVERIFIED';

// Helper to format credential expiration status
export function getExpirationStatus(expirationDate: string): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' {
  const expDate = new Date(expirationDate.replace(/-/g, '/'));
  const now = new Date('3184/02/15'); // Game date context
  const daysUntilExpiration = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiration < 0) return 'EXPIRED';
  if (daysUntilExpiration < 14) return 'EXPIRING_SOON';
  return 'VALID';
}

// Get permit status considering transit flags - creates UNVERIFIED contradictions
export function getPermitStatus(
  credential: CredentialDetails | undefined,
  hasTransitIssue: boolean
): PermitStatus {
  if (!credential) return 'INVALID';
  if (!credential.valid) return 'INVALID';
  // Valid credential but transit log has flags = UNVERIFIED (system glitch/contradiction)
  if (hasTransitIssue) return 'UNVERIFIED';
  return getExpirationStatus(credential.expirationDate);
}

// Helper to get credential type display name
export function getCredentialTypeName(type: CredentialType): string {
  return CREDENTIAL_TYPE_NAMES[type];
}
