// Warrant entries with offense code and brief description
export interface WarrantEntry {
  offense: string;
  description: string;
}

export const WARRANT_ENTRIES: WarrantEntry[] = [
  {
    offense: 'PRIOR THEFT — TRANSIT DOCK 11',
    description: 'Cargo unit reported missing from Dock 11 manifest. Subject identified on surveillance during unloading window.',
  },
  {
    offense: 'BREACH ASSISTANCE — UNCONFIRMED',
    description: 'Subject linked to unauthorized access event. Evidence suggests role as facilitator, not primary actor.',
  },
  {
    offense: 'DATA LEAK — ACTIVE INVESTIGATION',
    description: 'Classified personnel files accessed from unauthorized terminal. Subject credentials used during breach.',
  },
  {
    offense: 'CARGO TAMPERING — OPEN CASE',
    description: 'Seals on restricted cargo found broken. Subject was last recorded handler before discrepancy detected.',
  },
  {
    offense: 'IDENTITY FRAUD — FLAGGED',
    description: 'Multiple credential sets traced to single biometric. Subject operating under assumed documentation.',
  },
  {
    offense: 'ASSAULT — DISTRICT 3 INCIDENT',
    description: 'Physical altercation reported at checkpoint. Subject identified by two witnesses. Medical costs outstanding.',
  },
  {
    offense: 'TRANSIT VIOLATION — REPEATED',
    description: 'Three or more unauthorized crossings logged. Subject bypassed checkpoints using forged clearance codes.',
  },
  {
    offense: 'CONTRABAND POSSESSION — SUSPECTED',
    description: 'Irregular scan patterns during previous transit. Contents unverified. Subject flagged for manual inspection.',
  },
  {
    offense: 'OBSTRUCTION — AMBER PROTOCOL',
    description: 'Subject interfered with security procedure. Refused compliance during routine verification sequence.',
  },
  {
    offense: 'FORGERY — CREDENTIAL FABRICATION',
    description: 'Work permit exhibits irregularities. Issuing authority has no record of approval. Pending tribunal review.',
  },
];

// Legacy format for backward compatibility
export const WARRANT_DETAILS = WARRANT_ENTRIES.map((entry) => entry.offense);

export const INCIDENT_DISCREPANCIES = [
  'DESTINATION MISMATCH IN TRANSIT LOG',
  'CREDENTIAL ISSUE DATE INCONSISTENT',
  'BIOMETRIC SIGNATURE OUT OF RANGE',
  'RECENT ENTRY NOT DECLARED',
  'LICENSED EMPLOYER NOT FOUND',
];

export const TRANSIT_ROUTES = [
  { from: 'DISTRICT 1', to: 'CENTRAL HUB' },
  { from: 'DISTRICT 2', to: 'CENTRAL HUB' },
  { from: 'DISTRICT 3', to: 'CENTRAL HUB' },
  { from: 'DISTRICT 4', to: 'CENTRAL HUB' },
  { from: 'DISTRICT 5', to: 'CENTRAL HUB' },
  { from: 'DISTRICT 1', to: 'DISTRICT 2' },
  { from: 'DISTRICT 3', to: 'DISTRICT 2' },
];

// Reasons for transit flags - explains WHY a route was flagged
export const TRANSIT_FLAG_REASONS = [
  'UNAUTHORIZED SECTOR ACCESS',
  'EXPIRED TRANSIT PERMIT',
  'BIOMETRIC MISMATCH AT CHECKPOINT',
  'ROUTE UNDER ACTIVE INVESTIGATION',
  'MISSING TRANSIT CLEARANCE',
  'PREVIOUS INCIDENT ON THIS ROUTE',
  'RESTRICTED ZONE VIOLATION',
  'UNREGISTERED DEPARTURE POINT',
  'TRAVEL PATTERN ANOMALY DETECTED',
  'DESTINATION BLACKLISTED',
];

export const VERIFICATION_SOURCES = [
  'DEPOT SECURITY',
  'CENTRAL AUTHORITY',
  'TRANSIT OVERSIGHT',
  'MEDICAL REVIEW BOARD',
];

export const VERIFICATION_SUMMARIES = [
  'Record indicates a mismatch between stated purpose and registry.',
  'File notes unresolved discrepancies in travel history.',
  'Documentation trail is incomplete or inconsistent.',
  'Flag raised by automated screening review.',
];

export const VERIFICATION_CONTRADICTIONS = [
  'Declared purpose does not match credential usage.',
  'Transit log conflicts with entry date.',
  'Credential issuer not found in registry.',
  'Stated employer denies knowledge of subject.',
];

export const VERIFICATION_QUESTIONS = [
  'Why does your file show a different purpose than your statement?',
  'Explain the conflict in your transit log.',
  'Why is your credential issuer unregistered?',
  'Who authorized your clearance?',
];
