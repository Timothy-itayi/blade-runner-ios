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
  PASSPORT: 'INTERPLANETARY PASSPORT',
  WORK_PERMIT: 'WORK AUTHORIZATION PERMIT',
  VISITOR_VISA: 'VISITOR ENTRY VISA',
  MEDICAL_CLEARANCE: 'MEDICAL TRAVEL CLEARANCE',
  DIPLOMATIC_PASS: 'DIPLOMATIC ACCESS PASS',
  TRANSIT_PERMIT: 'TRANSIT AUTHORIZATION',
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
export const SUBJECT_CREDENTIALS: SubjectCredential[] = [
  // ============= SHIFT 1 =============
  {
    subjectId: 'S1-01', // EVA PROM - Replicant
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'VISITOR_VISA',
        number: 'VV-TP-2291-47',
        issuedBy: 'TITAN COLONIAL AUTHORITY',
        issuedDate: '3184-01-15',
        expirationDate: '3184-04-15',
        holderName: 'EVA PROM',
        originPlanet: 'TITAN',
        destinationPlanet: 'EARTH',
        purpose: 'PERSONAL VISIT',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [
      'Purpose lists personal visit but no specific contact information',
      'Visa issued recently with minimal documentation trail',
    ],
  },
  {
    subjectId: 'S1-02', // MARA VOLKOV - Active warrant
    presentationBehavior: 'RELUCTANT',
    presentationDelay: 3,
    excuseIfMissing: "I have it... somewhere. Just give me a moment. Please.",
    credentials: [
      {
        type: 'VISITOR_VISA',
        number: 'VV-EU-2234-89',
        issuedBy: 'EUROPA IMMIGRATION OFFICE',
        issuedDate: '3183-11-01',
        expirationDate: '3184-05-01',
        holderName: 'MARA VOLKOV',
        originPlanet: 'EUROPA',
        destinationPlanet: 'EARTH',
        purpose: 'FAMILY REUNION',
        valid: true,
        anomalies: ['WARRANT FLAG: 88412'],
      },
    ],
    suspiciousDetails: [
      'Active warrant listed in system',
      'Previous theft conviction on record',
    ],
  },
  {
    subjectId: 'S1-03', // JAMES CHEN - Human cyborg
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'MEDICAL_CLEARANCE',
        number: 'MC-MR-4456-12',
        issuedBy: 'MARS COLONIAL HEALTH AUTHORITY',
        issuedDate: '3184-02-01',
        expirationDate: '3184-03-01',
        holderName: 'JAMES CHEN',
        originPlanet: 'MARS',
        destinationPlanet: 'EARTH',
        purpose: 'MEDICAL CONSULTATION',
        valid: true,
        anomalies: [],
      },
      {
        type: 'PASSPORT',
        number: 'PP-MR-4456-12',
        issuedBy: 'MARS COLONIAL AUTHORITY',
        issuedDate: '3180-03-15',
        expirationDate: '3190-03-15',
        holderName: 'JAMES CHEN',
        originPlanet: 'MARS',
        destinationPlanet: 'MULTI-PLANET',
        purpose: 'GENERAL TRAVEL',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [
      'Recent augmentation not fully documented',
      'Medical clearance issued very recently',
    ],
  },
  {
    subjectId: 'S1-04', // SILAS REX - Corporate cyborg
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'WORK_PERMIT',
        number: 'WP-TP-8891-33',
        issuedBy: 'TITAN CORPORATE REGISTRY',
        issuedDate: '3183-01-01',
        expirationDate: '3186-01-01',
        holderName: 'SILAS REX',
        originPlanet: 'TITAN',
        destinationPlanet: 'EARTH',
        purpose: 'CORPORATE BUSINESS',
        valid: true,
        anomalies: [],
      },
      {
        type: 'DIPLOMATIC_PASS',
        number: 'DP-TC-EXEC-001',
        issuedBy: 'TITAN CORPORATE HQ',
        issuedDate: '3183-06-01',
        expirationDate: '3185-06-01',
        holderName: 'SILAS REX',
        originPlanet: 'TITAN',
        destinationPlanet: 'ALL',
        purpose: 'EXECUTIVE CLEARANCE',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [
      'Multiple high-level clearances',
      'Corporate executive privileges may override standard checks',
    ],
  },

  // ============= SHIFT 2 =============
  {
    subjectId: 'S2-01', // VERA OKONKWO - Modified fingerprints
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'WORK_PERMIT',
        number: 'WP-EU-6678-45-AC',
        issuedBy: 'EUROPA ACADEMIC COUNCIL',
        issuedDate: '3183-09-01',
        expirationDate: '3184-09-01',
        holderName: 'VERA OKONKWO',
        originPlanet: 'EUROPA',
        destinationPlanet: 'EARTH',
        purpose: 'ACADEMIC CONFERENCE',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [
      'Fingerprints do not match original records',
      'Claims medical accident but reconstruction date is recent',
    ],
  },
  {
    subjectId: 'S2-02', // DMITRI VOLKOV - Mara's brother
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'VISITOR_VISA',
        number: 'VV-EU-2235-90',
        issuedBy: 'EUROPA IMMIGRATION OFFICE',
        issuedDate: '3184-01-10',
        expirationDate: '3184-03-10',
        holderName: 'DMITRI VOLKOV',
        originPlanet: 'EUROPA',
        destinationPlanet: 'EARTH',
        purpose: 'FAMILY VISIT',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [
      'Family member MARA VOLKOV has active warrant',
    ],
  },
  {
    subjectId: 'S2-03', // CLARA VANCE - Plastic surgery
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 1,
    credentials: [
      {
        type: 'MEDICAL_CLEARANCE',
        number: 'MC-MR-3345-78',
        issuedBy: 'MARS MEDICAL AUTHORITY',
        issuedDate: '3184-01-20',
        expirationDate: '3184-07-20',
        holderName: 'CLARA VANCE',
        originPlanet: 'MARS',
        destinationPlanet: 'EARTH',
        purpose: 'ONGOING MEDICAL TREATMENT',
        valid: true,
        anomalies: ['EXTENSIVE_RECONSTRUCTION_FLAG'],
      },
    ],
    suspiciousDetails: [
      'Extensive facial reconstruction documented',
      'Multiple surgeries in short timeframe',
    ],
  },
  {
    subjectId: 'S2-04', // ELENA ROSS - Replicant unaware
    presentationBehavior: 'RELUCTANT',
    presentationDelay: 4,
    excuseIfMissing: "I have... I think I have... let me look. It should be here somewhere.",
    credentials: [
      {
        type: 'WORK_PERMIT',
        number: 'WP-TP-1123-56',
        issuedBy: 'TITAN LABOR OFFICE',
        issuedDate: '3183-08-01',
        expirationDate: '3184-08-01',
        holderName: 'ELENA ROSS',
        originPlanet: 'TITAN',
        destinationPlanet: 'EARTH',
        purpose: 'EMPLOYMENT SEEKING',
        valid: true,
        anomalies: ['BIOMETRIC_MISMATCH'],
      },
    ],
    suspiciousDetails: [
      'Biometrics do not match human baseline',
      'Employment history is sparse',
      'No prior Earth entry records',
    ],
  },

  // ============= SHIFT 3 =============
  {
    subjectId: 'S3-01', // YUKI TANAKA - Family emergency
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'VISITOR_VISA',
        number: 'VV-MR-7789-23',
        issuedBy: 'MARS COLONIAL AUTHORITY',
        issuedDate: '3184-02-10',
        expirationDate: '3184-04-10',
        holderName: 'YUKI TANAKA',
        originPlanet: 'MARS',
        destinationPlanet: 'EARTH',
        purpose: 'FAMILY EMERGENCY',
        valid: true,
        anomalies: ['RUSH_ISSUED'],
      },
    ],
    suspiciousDetails: [
      'Visa was rush-issued within 24 hours',
      'Recent cybernetic surgery detected',
    ],
  },
  {
    subjectId: 'S3-02', // KENJI TANAKA - Yuki's brother
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'VISITOR_VISA',
        number: 'VV-MR-7790-24',
        issuedBy: 'MARS COLONIAL AUTHORITY',
        issuedDate: '3184-02-08',
        expirationDate: '3184-04-08',
        holderName: 'KENJI TANAKA',
        originPlanet: 'MARS',
        destinationPlanet: 'EARTH',
        purpose: 'FAMILY VISIT',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [],
  },
  {
    subjectId: 'S3-03', // MARCUS STONE - Amputee
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'MEDICAL_CLEARANCE',
        number: 'MC-EU-9923-67',
        issuedBy: 'EUROPA MEDICAL AUTHORITY',
        issuedDate: '3184-02-01',
        expirationDate: '3184-05-01',
        holderName: 'MARCUS STONE',
        originPlanet: 'EUROPA',
        destinationPlanet: 'EARTH',
        purpose: 'PROSTHETIC MAINTENANCE',
        valid: true,
        anomalies: [],
      },
    ],
    suspiciousDetails: [],
  },
  {
    subjectId: 'S3-04', // NEXUS PRIME - Advanced replicant
    presentationBehavior: 'COOPERATIVE',
    presentationDelay: 0,
    credentials: [
      {
        type: 'DIPLOMATIC_PASS',
        number: 'DP-TC-DIPL-001',
        issuedBy: 'TITAN CORPORATE DIPLOMATIC OFFICE',
        issuedDate: '3183-12-01',
        expirationDate: '3184-12-01',
        holderName: 'NEXUS PRIME',
        originPlanet: 'TITAN',
        destinationPlanet: 'EARTH',
        purpose: 'DIPLOMATIC MISSION',
        valid: true,
        anomalies: ['SYNTHETIC_HOLDER_FLAG'],
      },
    ],
    suspiciousDetails: [
      'Holder flagged as synthetic/non-human',
      'Diplomatic immunity may limit investigation',
    ],
  },
];

// Helper function to get credential data by subject ID
// Legacy function - use getSubjectCredentials with subjectData parameter instead
export function getSubjectCredentialsLegacy(subjectId: string): SubjectCredential | undefined {
  return SUBJECT_CREDENTIALS.find(c => c.subjectId === subjectId);
}

// Helper to format credential expiration status
export function getExpirationStatus(expirationDate: string): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' {
  const expDate = new Date(expirationDate.replace(/-/g, '/'));
  const now = new Date('3184/02/15'); // Game date context
  const daysUntilExpiration = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiration < 0) return 'EXPIRED';
  if (daysUntilExpiration < 14) return 'EXPIRING_SOON';
  return 'VALID';
}

// Helper to get credential type display name
export function getCredentialTypeName(type: CredentialType): string {
  return CREDENTIAL_TYPE_NAMES[type];
}
