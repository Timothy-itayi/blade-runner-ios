export const WARRANT_DETAILS = [
  'PRIOR THEFT — TRANSIT DOCK 11',
  'BREACH ASSISTANCE — UNCONFIRMED',
  'DATA LEAK — ACTIVE INVESTIGATION',
  'CARGO TAMPERING — OPEN CASE',
  'IDENTITY FRAUD — FLAGGED',
];

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
