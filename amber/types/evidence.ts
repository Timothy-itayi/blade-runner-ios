import type { VerificationRecord } from '../data/subjects';

export type EvidenceKind = 'WARRANT' | 'TRANSIT' | 'INCIDENT';

export interface TravelEntry {
  from: string;
  to: string;
  date: string;
  flagged?: boolean;
  flagNote?: string;
}

export interface SubjectEvidence {
  warrants: string;
  warrantDescription?: string;
  incidents: number;
  databaseQuery: {
    travelHistory: TravelEntry[];
    lastSeenLocation: string;
    lastSeenDate: string;
    discrepancies: string[];
  };
  verificationRecord?: VerificationRecord;
  outputs: Record<EvidenceKind, string[]>;
}
