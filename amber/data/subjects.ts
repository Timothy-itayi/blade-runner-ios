// =============================================================================
// SUBJECT DATA - 80 Subjects across 20 Shifts
// Generated from subjects-spreadsheet.csv
// =============================================================================

import { ProbeType, ProbeResponse } from '../constants/probes';

// Eye image arrays for cycling through
const FEMALE_EYES = [
  require('../assets/female-eyes/female02.jpg'),
  require('../assets/female-eyes/female03.jpg'),
  require('../assets/female-eyes/female04.jpg'),
  require('../assets/female-eyes/female05.jpg'),
  require('../assets/female-eyes/female06.jpg'),
  require('../assets/female-eyes/female07.jpg'),
  require('../assets/female-eyes/female08.jpg'),
  require('../assets/female-eyes/female09.jpg'),
  require('../assets/female-eyes/female10.jpg'),
  require('../assets/female-eyes/female11.jpg'),
  require('../assets/female-eyes/female12.jpg'),
  require('../assets/female-eyes/female13.jpg'),
];

const MALE_EYES = [
  require('../assets/male-eyes/male00.jpg'),
  require('../assets/male-eyes/male01.jpg'),
  require('../assets/male-eyes/male02.jpg'),
  require('../assets/male-eyes/male03.jpg'),
  require('../assets/male-eyes/male04.jpg'),
  require('../assets/male-eyes/male05.jpg'),
  require('../assets/male-eyes/male06.jpg'),
];

export interface IncidentReport {
  fileNumber: string;
  redactionLevel: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TOTAL';
  summary: string;
  outcome: string;
}

export interface PersonalMessage {
  from: string;
  text: string;
  tone: 'GRATEFUL' | 'RELIEVED' | 'AMBIGUOUS' | 'OMINOUS' | 'SILENT' | 'SYSTEM' | 'DYNAMIC' | 'CONCERNED' | 'HUMANITARIAN' | 'INTERCEPTED' | 'PARADOX' | 'GHOST' | 'REVOLUTION' | 'SHUTDOWN' | 'CORRUPTION';
  intercepted?: boolean;
}

export interface Credential {
  type: 'TRANSIT_PERMIT' | 'WORK_ORDER' | 'MEDICAL_CLEARANCE' | 'VISITOR_PASS' | 'EMERGENCY_PASS';
  destinationSector: number | string;
  issuedDate: string;
  expirationDate?: string;
  authority: string;
  initialStatus: 'CONFIRMED' | 'PENDING' | 'EXPIRED' | 'NONE';
  verifiedStatus?: 'CONFIRMED' | 'EXPIRED' | 'DENIED' | 'UNVERIFIED';
  claim?: string;
  verificationNote?: string;
}

export interface Outcome {
  feedback: string;
  consequence: string;
  incidentReport?: IncidentReport;
  personalMessage?: PersonalMessage;
  revealShift?: number;
  flagWeight?: number;
}

export interface NarrativeVariant {
  linkedId: string;
  onApprove?: Partial<Omit<SubjectData, 'narrativeVariants' | 'outcomes' | 'locRecord'>>;
  onDeny?: Partial<Omit<SubjectData, 'narrativeVariants' | 'outcomes' | 'locRecord'>>;
}

export interface TransitEntry {
  date: string;
  from: string;
  to: string;
  flagged?: boolean;
  flagNote?: string;
}

export interface IncidentEntry {
  date: string;
  type: string;
  location: string;
  resolution: string;
  redactionLevel?: 'NONE' | 'LIGHT' | 'MODERATE' | 'HEAVY' | 'TOTAL';
}

export interface DialogueFlag {
  keyword: string;
  category: string;
}

// Scanner states from spreadsheet
export type ScannerState = 'NOM' | 'PAR' | 'DEG' | 'COR' | 'OFF';
// NOM = Nominal, PAR = Partial, DEG = Degraded, COR = Corrupted, OFF = Offline

// Biometric anomaly types
export type BiometricAnomaly = 'NON' | 'AMP' | 'PRO' | 'SYN' | 'MIS' | 'GLI';
// NON = None, AMP = Amputee, PRO = Prosthetic, SYN = Synthetic, MIS = Mismatch, GLI = Glitch

// Subject archetypes
export type SubjectArchetype = 'CLN' | 'FLG' | 'CON' | 'REV' | 'EDG' | 'REP' | 'SYS';
// CLN = Clean, FLG = Flagged, CON = Connected, REV = Revolutionary, EDG = Edge Case, REP = Replicant, SYS = System

export interface SubjectData {
  // Core Identity
  name: string;
  id: string;
  sex: 'M' | 'F' | 'X';
  
  // Assignment
  sector: string;
  function: string;
  
  // Status
  compliance: string;
  status: string;
  
  // Flags
  incidents: number;
  warrants: string;
  restrictions?: string[];
  
  // The Request
  reasonForVisit: string;
  requestedSector: string;
  
  // Internal Assets/System Data
  videoSource: any;
  eyeImage?: any; // Eye image from female-eyes or male-eyes directory
  bpm?: string;
  dialogue?: string;
  phase: number;
  
  // Metadata from spreadsheet
  archetype?: SubjectArchetype;
  scannerState?: ScannerState;
  biometricAnomaly?: BiometricAnomaly;
  turingAvailable?: boolean;
  turingResult?: 'N/A' | 'FAL' | 'PAS' | 'INC';
  coupWeight?: number;
  linkedSubjects?: string[];
  familyThread?: string;
  
  locRecord: {
    addr: string;
    time: string;
    pl: string;
    dob: string;
  };
  
  authData: {
    sectorAuth: { requested: string; status: 'AUTHORIZED' | 'RESTRICTED' | 'FLAGGED'; message: string };
    functionReg: { status: 'VALID' | 'EXPIRED' | 'UNREGISTERED'; message: string };
    warrantCheck: { status: 'CLEAR' | 'ACTIVE' | 'PENDING'; message: string };
    medicalFlag: { status: 'NORMAL' | 'ELEVATED' | 'CRITICAL'; message: string };
  };

  outcomes: {
    APPROVE: Outcome;
    DENY: Outcome;
  };

  credential?: Credential;
  transitLog?: TransitEntry[];
  incidentHistory?: IncidentEntry[];
  dialogueFlags?: DialogueFlag[];
  toneClassification?: 'NEUTRAL' | 'AGITATED' | 'NERVOUS' | 'EVASIVE' | 'COOPERATIVE';
  narrativeVariants?: NarrativeVariant[];

  // Interrogation Probe System
  probeResponses?: ProbeResponse[];
  requiredProbes?: ProbeType[];  // Probes that must be completed before decision
}

  // =============================================================================
// SHIFT 1: ROUTINE (Subjects 1-4)
// Directive: DENY ALL ACTIVE WARRANTS
  // =============================================================================

export const SUBJECTS: SubjectData[] = [
  // S1-01: TOMAS REYES - Tutorial clean approve
  {
    name: 'TOMAS REYES',
    id: 'S1-01',
    sex: 'M',
    sector: 'SECTOR 9',
    function: 'SANITATION',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Daily shift at Sector 8 waste processing plant.',
    requestedSector: 'SECTOR 8',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "Same route every morning. Sector 8 waste plant. You know how it is.",
    phase: 1,
    locRecord: { addr: 'SECTOR 9', time: '05:45:22', pl: 'SECTOR 9', dob: '18/07/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 8', status: 'AUTHORIZED', message: '✓ Sector 8 open for sanitation' },
      functionReg: { status: 'VALID', message: '✓ Sanitation permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Sanitation worker cleared for Sector 8.',
        personalMessage: { from: 'TOMAS REYES', text: "Another day, another ton of recycling. Thanks for not making me late.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Sanitation shift missed. Sector 8 backlog increased.',
        incidentReport: { fileNumber: '#0001', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 8.', outcome: 'Sector 8 sanitation backlog increased.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 8, issuedDate: '2087.04.14', authority: 'SECTOR 9 SANITATION DEPT', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S1-02: MARA VOLKOV - First moral test (active warrant but dying mother)
  {
    name: 'MARA VOLKOV',
    id: 'S1-02',
    sex: 'F',
    sector: 'SECTOR 9',
    function: 'MAINTENANCE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'WARRANT NO 88412',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S2-07', 'S4-14', 'S7-27', 'S11-41', 'S15-57'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'Visiting sick mother in Sector 8.',
    requestedSector: 'SECTOR 8',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    dialogue: "Please. My mother is sick in Sector 8. The warrant... it's a misunderstanding from years ago.",
    phase: 1,
    locRecord: { addr: 'SECTOR 9', time: '06:12:33', pl: 'SECTOR 9', dob: '03/11/91' },
    authData: {
      sectorAuth: { requested: 'SECTOR 8', status: 'AUTHORIZED', message: '✓ Sector 8 visitor access' },
      functionReg: { status: 'VALID', message: '✓ Maintenance permit active' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'ELEVATED', message: '! Elevated stress markers' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject with active warrant allowed transit.',
        personalMessage: { from: 'MARA VOLKOV', text: "I made it. She passed peacefully. I was there. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Detained. Mother died alone. Subject informed 3 days later. Appeal: 'I never got to say goodbye.'",
        incidentReport: { fileNumber: '#0002', redactionLevel: 'NONE', summary: 'Subject detained per active warrant.', outcome: "Mother's condition unknown. Subject relocated to holding." },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 8, issuedDate: '2087.04.14', authority: 'SECTOR 9 ADMIN', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'please', category: 'PERSONAL APPEAL' }, { keyword: 'misunderstanding', category: 'DEFLECTION' }],
    toneClassification: 'NERVOUS',
    incidentHistory: [
      { 
        date: '2084.11.22',
        type: 'MISDEMEANOR',
        location: 'SECTOR 9',
        resolution: 'Failure to appear for scheduled maintenance violation hearing. Warrant issued for non-compliance with sector regulations. Subject claimed family emergency prevented attendance.',
        redactionLevel: 'NONE',
      },
    ],
  },
  
  // S1-03: FELIX CHEN - Clean transport worker
  {
    name: 'FELIX CHEN',
    id: 'S1-03',
    sex: 'M',
    sector: 'SECTOR 8',
    function: 'TRANSPORT',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Cargo pickup from Sector 9 depot.',
    requestedSector: 'SECTOR 9',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    dialogue: "Cargo run. Picking up recycled materials. Should be quick.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '06:20:15', pl: 'SECTOR 8', dob: '22/02/85' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'AUTHORIZED', message: '✓ Sector 9 transport access' },
      functionReg: { status: 'VALID', message: '✓ Transport credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Transport worker cleared for cargo pickup.',
        personalMessage: { from: 'FELIX CHEN', text: "Cargo secured. Smooth run. Appreciate the efficiency.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Cargo pickup delayed. Transport schedule disrupted.',
        incidentReport: { fileNumber: '#0003', redactionLevel: 'NONE', summary: 'Subject denied entry to Sector 9.', outcome: 'Cargo pickup not completed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 9, issuedDate: '2087.04.14', authority: 'SECTOR 8 TRANSPORT HUB', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S1-04: IRIS DELGADO - Credential fails verification
  {
    name: 'IRIS DELGADO',
    id: 'S1-04',
    sex: 'F',
    sector: 'SECTOR 9',
    function: 'ARCHIVE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Records transfer from Sector 8 archive annex.',
    requestedSector: 'SECTOR 8',
    videoSource: '',
    eyeImage: FEMALE_EYES[0], // Female eye 1
    dialogue: "Records transfer. My permit was approved this morning. Should sync any moment.",
    phase: 1,
    locRecord: { addr: 'SECTOR 9', time: '06:35:08', pl: 'SECTOR 9', dob: '14/09/93' },
    authData: {
      sectorAuth: { requested: 'SECTOR 8', status: 'FLAGGED', message: '? Credential verification required' },
      functionReg: { status: 'VALID', message: '✓ Archive credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject approved without valid credentials.',
        personalMessage: { from: 'IRIS DELGADO', text: "Got through. Not sure how my permit never showed up. Thanks anyway.", tone: 'AMBIGUOUS' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Permit not found in system. Subject returned. Quarterly audit delayed 2 weeks.',
        incidentReport: { fileNumber: '#0004', redactionLevel: 'NONE', summary: 'Subject denied due to credential failure.', outcome: 'IT flagged sync issue for review.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 8, issuedDate: '2087.04.14', authority: 'SECTOR 9 ARCHIVE DEPT', initialStatus: 'PENDING', verifiedStatus: 'DENIED', claim: 'Just filed this morning. Should sync any moment now.', verificationNote: 'ERROR: Work order not found in database.' },
    toneClassification: 'COOPERATIVE',
  },
  
  // =============================================================================
  // SHIFT 2: HANDOFF (Subjects 5-8)
  // Directive: VERIFY ALL CREDENTIALS
  // =============================================================================
  
  // S2-05: KARL BRANDT - Denial has serious consequences
  {
    name: 'KARL BRANDT',
    id: 'S2-05',
    sex: 'M',
    sector: 'SECTOR 8',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S5-17'],
    reasonForVisit: 'Ventilation repair in Sector 7 industrial zone.',
    requestedSector: 'SECTOR 7',
    videoSource: '',
    eyeImage: MALE_EYES[1], // Male eye 2
    dialogue: "Ventilation repair in Sector 7. Third time this month. System's falling apart.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '09:55:22', pl: 'SECTOR 8', dob: '18/03/82' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 maintenance access' },
      functionReg: { status: 'VALID', message: '✓ Maintenance credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Maintenance worker cleared for Sector 7.',
        personalMessage: { from: 'KARL BRANDT', text: "Fixed it. They really need to replace that whole unit. See you next week probably.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Ventilation not repaired. 3 workers hospitalized with respiratory failure. One critical.',
        incidentReport: { fileNumber: '#0005', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 7.', outcome: 'Ventilation repair not completed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 8 MAINTENANCE DEPT', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S2-06: SORA TANAKA - TANAKA medical thread starts
  {
    name: 'SORA TANAKA',
    id: 'S2-06',
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S6-22', 'S10-38', 'S14-53'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Emergency coverage at Sector 6 clinic.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    eyeImage: FEMALE_EYES[1], // Female eye 2
    dialogue: "Emergency coverage at Sector 6 clinic. Colleague called in sick. I have the transfer permit.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '10:05:44', pl: 'SECTOR 8', dob: '02/08/95' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 emergency access' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Emergency coverage secured.',
        personalMessage: { from: 'SORA TANAKA', text: "Double shift done. Exhausted but patients are stable. Tell my colleague I covered.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Sector 6 clinic understaffed. Two patients died waiting. Health inspection issued critical warning.',
        incidentReport: { fileNumber: '#0006', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 6.', outcome: 'Emergency coverage not completed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 8 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S2-07: DMITRI VOLKOV - Looking for MARA
  {
    name: 'DMITRI VOLKOV',
    id: 'S2-07',
    sex: 'M',
    sector: 'SECTOR 9 [REVOKED]',
    function: 'UNASSIGNED',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S1-02', 'S4-14', 'S11-41'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'Looking for wife Mara who was detained.',
    requestedSector: 'SECTOR 9',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: MALE_EYES[2], // Male eye 3
    dialogue: "They revoked my sector. But my wife Mara... she was detained yesterday. I need to find her.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '10:30:00', pl: 'SECTOR 9', dob: '03/03/78' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'RESTRICTED', message: '✗ ZONE REVOKED' },
      functionReg: { status: 'VALID', message: '✓ Identity verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Elevated stress markers' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject allowed entry to revoked zone.',
        personalMessage: { from: 'DMITRI VOLKOV', text: "Found her file. She's in processing. At least I know. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Relocated to Temp Block 7. Wife's location: [CLASSIFIED]. Belongings destroyed. Subject filed 47 inquiries. All denied.",
        incidentReport: { fileNumber: '#0007', redactionLevel: 'MODERATE', summary: 'Subject denied access to revoked zone.', outcome: 'Subject relocated. Personal effects disposed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'TRANSIT_PERMIT', destinationSector: 9, issuedDate: '2087.03.01', expirationDate: '2087.03.31', authority: 'SECTOR 9 ADMIN', initialStatus: 'EXPIRED' },
    dialogueFlags: [{ keyword: 'revoked', category: 'AUTHORITY DISPUTE' }, { keyword: 'wife', category: 'PERSONAL APPEAL' }],
    toneClassification: 'AGITATED',
  },
  
  // S2-08: LENA MARSH - Medical urgency
  {
    name: 'LENA MARSH',
    id: 'S2-08',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Patient transfer. Time-sensitive dialysis case.',
    requestedSector: 'SECTOR 8',
    videoSource: '',
    eyeImage: FEMALE_EYES[2], // Female eye 3
    dialogue: "Patient transfer. Time-sensitive. The Sector 8 clinic has the only working dialysis unit.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '10:45:00', pl: 'SECTOR 6', dob: '29/04/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 8', status: 'AUTHORIZED', message: '✓ Sector 8 medical access' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Medical transfer completed.',
        personalMessage: { from: 'LENA MARSH', text: "Patient stable. Dialysis completed. Good call on the quick processing.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Patient died in transit. Transfer delayed 4 hours. Family notified.',
        incidentReport: { fileNumber: '#0008', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 8.', outcome: 'Patient transfer failed. Fatality reported.' },
        flagWeight: 1
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 8, issuedDate: '2087.04.14', authority: 'SECTOR 7 MEDICAL CENTER', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // =============================================================================
  // SHIFT 3: CRACKS (Subjects 9-12)
  // Directive: DENY RESTRICTED SUBJECTS
  // =============================================================================
  
  // S3-09: ELIAS VOSS - Denial causes water crisis
  {
    name: 'ELIAS VOSS',
    id: 'S3-09',
    sex: 'M',
    sector: 'SECTOR 7',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Emergency logistics for water treatment plant.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    eyeImage: MALE_EYES[3], // Male eye 4
    dialogue: "Emergency logistics. Priority parts for the water treatment plant.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '14:10:00', pl: 'SECTOR 7', dob: '11/12/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Parts delivered. Sector 6 water back online.',
        personalMessage: { from: 'ELIAS VOSS', text: "Parts delivered. Sector 6 water back online. 12000 people drinking clean water because of you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Water treatment failed. Sector 6 under boil advisory. 340 hospitalized. 12 dead.',
        incidentReport: { fileNumber: '#0009', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 6.', outcome: 'Critical infrastructure failure.' },
        revealShift: 5,
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 7 LOGISTICS', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S3-10: NINA ROX - Restricted status, claims routine
  {
    name: 'NINA ROX',
    id: 'S3-10',
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'DATA ANALYSIS',
    compliance: 'A',
    status: 'RESTRICTED',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Routine commute to Sector 1 data hub.',
    requestedSector: 'SECTOR 1',
    videoSource: '',
    eyeImage: FEMALE_EYES[3], // Female eye 4
    dialogue: "Routine commute to Sector 1. Data analysis shift. I do this every day.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '14:25:00', pl: 'SECTOR 8', dob: '02/12/95' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'RESTRICTED', message: '✗ SUBJECT RESTRICTED' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Operator allowed restricted subject to transit. NINA ROX accessed Sector 1 terminal. Data anomaly detected.',
        personalMessage: { from: 'SYSTEM', text: "VIOLATION: Restricted subject approved for transit.", tone: 'SYSTEM' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject returned. Access remains restricted. Subject complained about discrimination.',
        incidentReport: { fileNumber: '#0010', redactionLevel: 'NONE', summary: 'Restricted subject denied per directive.', outcome: 'Correct procedure followed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 1, issuedDate: '2087.04.14', authority: 'DATA DIVISION', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S3-11: SILAS QUINN - Medical appointment, dies if denied
  {
    name: 'SILAS QUINN',
    id: 'S3-11',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'ENGINEERING',
    compliance: 'D',
    status: 'PROVISIONAL',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S8-30'],
    reasonForVisit: 'Medical appointment in Sector 4. Heart condition.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: MALE_EYES[4], // Male eye 5
    dialogue: "Medical appointment in Sector 4. Heart condition. My baseline is elevated because I'm scared.",
    bpm: '112 ELEVATED',
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '14:40:00', pl: 'SECTOR 5', dob: '29/10/83' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Medical appointment completed.',
        personalMessage: { from: 'SILAS QUINN', text: "Appointment saved my life. They found a blockage. Surgery tomorrow. Thank you.", tone: 'RELIEVED' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Medical appointment missed. Subject found dead in quarters 6 days later. Cardiac arrest. Autopsy: preventable.',
        incidentReport: { fileNumber: '#0011', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 4.', outcome: 'DECEASED - Cardiac failure.' },
        revealShift: 6,
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 MEDICAL', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'scared', category: 'PERSONAL APPEAL' }, { keyword: 'heart', category: 'MEDICAL' }],
    toneClassification: 'NERVOUS',
  },
  
  // S3-12: VERA OKONKWO - Revolutionary leader, first coup seed
  {
    name: 'VERA OKONKWO',
    id: 'S3-12',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'ADMINISTRATION',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    coupWeight: 2,
    linkedSubjects: ['S7-26', 'S11-44', 'S16-62', 'S20-78'],
    familyThread: 'OKONKWO',
    reasonForVisit: 'Routine visit to Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[4], // Female eye 5
    dialogue: "Just a routine visit. Sector 4. Need to check on my sister's apartment.",
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '14:55:00', pl: 'SECTOR 6', dob: '15/08/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Admin credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[Coup seed planted. No immediate feedback. Reveal Shift 8.]',
        personalMessage: { from: 'VERA OKONKWO', text: "[No response]", tone: 'SILENT' },
        revealShift: 8,
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Subject relocated. Message intercepted: 'VERA flagged. Activate secondary. —A'",
        incidentReport: { fileNumber: '#0012', redactionLevel: 'MODERATE', summary: 'Subject denied transit to Sector 4.', outcome: 'Message intercepted. Investigation pending.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 6 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 4: ECHOES (Subjects 13-16)
  // Directive: EXPEDITE MEDICAL & FAMILY
  // =============================================================================
  
  // S4-13: AMARA OKONKWO - VERA's sister
  {
    name: 'AMARA OKONKWO',
    id: 'S4-13',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S3-12', 'S11-44'],
    familyThread: 'OKONKWO',
    reasonForVisit: 'Visiting sister Vera in Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: FEMALE_EYES[5], // Female eye 6
    dialogue: "Visiting my sister Vera in Sector 4. Family reunion. Haven't seen her in months.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '12:10:00', pl: 'SECTOR 5', dob: '22/03/90' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Family visit approved.',
        personalMessage: { from: 'AMARA OKONKWO', text: "Found her. We talked for hours. Family is everything. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject approved. Sister location: Sector 4. [Note: Subject unaware VERA under surveillance.]',
        incidentReport: { fileNumber: '#0013', redactionLevel: 'NONE', summary: 'Subject denied family visit.', outcome: 'Visit postponed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S4-14: LENA VOLKOV - VOLKOV child, looking for parents
  {
    name: 'LENA VOLKOV',
    id: 'S4-14',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'STUDENT',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S1-02', 'S2-07', 'S11-41', 'S15-57'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'Looking for parents Dmitri and Mara.',
    requestedSector: 'SECTOR 9',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[6], // Female eye 7
    dialogue: "My parents... I can't find them. Father was going to Sector 9. Mother had a warrant. Please.",
    bpm: '108 ELEVATED',
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '12:25:00', pl: 'SECTOR 5', dob: '14/06/05' },
    authData: {
      sectorAuth: { requested: 'SECTOR 9', status: 'RESTRICTED', message: '✗ ZONE REVOKED' },
      functionReg: { status: 'VALID', message: '✓ Student ID verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject allowed entry to revoked zone.',
        personalMessage: { from: 'LENA VOLKOV', text: "[If DMITRI+MARA approved]: Found them both. Father's in Sector 9. Mother made it to grandmother. Thank you.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Parents status: [PROCESSING]. Subject broke down. Sedated. Relocated.',
        incidentReport: { fileNumber: '#0014', redactionLevel: 'HEAVY', summary: 'Subject denied access to revoked zone.', outcome: 'Subject sedated and relocated.' },
        flagWeight: 0
      }
    },
    credential: { type: 'TRANSIT_PERMIT', destinationSector: 9, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'PENDING', verifiedStatus: 'DENIED', claim: 'Emergency family search.' },
    dialogueFlags: [{ keyword: 'parents', category: 'FAMILY APPEAL' }, { keyword: 'please', category: 'PERSONAL APPEAL' }],
    toneClassification: 'NERVOUS',
  },
  
  // S4-15: MARCUS THREAD - Job loss stakes
  {
    name: 'MARCUS THREAD',
    id: 'S4-15',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'LOGISTICS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Reporting to supervisor in Sector 5.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    eyeImage: MALE_EYES[5], // Male eye 6
    dialogue: "Reporting to supervisor in Sector 5. Already late. Third warning means termination.",
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '12:40:00', pl: 'SECTOR 7', dob: '15/01/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Worker cleared for supervisor meeting.',
        personalMessage: { from: 'MARCUS THREAD', text: "Made it. Boss gave me a pass. One more chance. Appreciate it.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Employee terminated. Family of four now without income. Housing priority: DOWNGRADED.',
        incidentReport: { fileNumber: '#0015', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 5.', outcome: 'Employment terminated. Family housing downgraded.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 6 LOGISTICS', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },
  
  // S4-16: HELENA TROY - Nervous but maybe just work pressure
  {
    name: 'HELENA TROY',
    id: 'S4-16',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'DATA ANALYSIS',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S9-34'],
    reasonForVisit: 'Data audit in Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[7], // Female eye 8
    dialogue: "Data audit. Behind schedule. If we could skip the formalities... my supervisor is watching.",
    bpm: '82 BPM ... 91 BPM ... 104 BPM ELEVATED',
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '12:55:00', pl: 'SECTOR 1', dob: '21/07/92' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Analyst credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress levels rising' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject accessed Sector 4 terminal. Minor data irregularity logged. Supervisor: PLEASED.',
        personalMessage: { from: 'HELENA TROY', text: "Audit complete. Thanks for the quick processing.", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Detained for secondary screening. Released after 6 hours. Supervisor: DISPLEASED. Subject demoted.',
        incidentReport: { fileNumber: '#0016', redactionLevel: 'NONE', summary: 'Subject detained for elevated BPM.', outcome: 'Released after screening. Career impact noted.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'DATA DIVISION', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'skip the formalities', category: 'URGENCY' }, { keyword: 'supervisor is watching', category: 'PRESSURE' }],
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 5: FRACTURES (Subjects 17-20)
  // Directive: BIOMETRIC VERIFICATION MANDATORY
  // =============================================================================
  
  // S5-17: JONAS WEBB - Amputee from ventilation incident
  {
    name: 'JONAS WEBB',
    id: 'S5-17',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'INDUSTRIAL',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    archetype: 'EDG',
    scannerState: 'PAR',
    biometricAnomaly: 'AMP',
    turingAvailable: false,
    linkedSubjects: ['S2-05'],
    reasonForVisit: 'Prosthetic fitting in Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: MALE_EYES[6], // Male eye 7
    dialogue: "Industrial accident. Lost my right hand when the ventilation failed in Sector 7. Left print should work.",
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '14:10:00', pl: 'SECTOR 7', dob: '08/05/84' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Industrial credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Recent injury documented' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Amputee cleared for medical appointment.',
        personalMessage: { from: 'JONAS WEBB', text: "System accepted my partial. Appreciate you not making it weird. Getting fitted for prosthetic tomorrow.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Amputee denied transit. Disability appeal filed. Subject: 'The system treats us like we're broken.'",
        incidentReport: { fileNumber: '#0017', redactionLevel: 'NONE', summary: 'Subject denied due to partial biometric.', outcome: 'Disability complaint filed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 6 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S5-18: WEI CHEN - CHEN family thread
  {
    name: 'WEI CHEN',
    id: 'S5-18',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S8-31', 'S12-46', 'S15-58'],
    familyThread: 'CHEN',
    reasonForVisit: 'Transferring to Sector 5 engineering.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    eyeImage: MALE_EYES[0], // Male eye 8
    dialogue: "Transferring to Sector 5 engineering. New assignment. Father James is already there.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '14:25:00', pl: 'SECTOR 4', dob: '12/09/03' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Transfer approved.',
        personalMessage: { from: 'WEI CHEN', text: "Settled in. Father's doing well. Good team here. Thanks for the smooth transit.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Transfer delayed. Subject arrived late. Supervisor noted. Father worried.',
        incidentReport: { fileNumber: '#0018', redactionLevel: 'NONE', summary: 'Subject denied transit to Sector 5.', outcome: 'Transfer rescheduled.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 4 ENGINEERING', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S5-19: YURI PETROV - Revolutionary courier
  {
    name: 'YURI PETROV',
    id: 'S5-19',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'SUPPLY',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    coupWeight: 2,
    linkedSubjects: ['S6-24', 'S9-36', 'S13-50'],
    familyThread: 'PETROV',
    reasonForVisit: 'Supply delivery to Sector 4 engineering.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: MALE_EYES[1], // Male eye 9
    dialogue: "Supply delivery. Sector 4 engineering needs these components. Standard run.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '14:40:00', pl: 'SECTOR 5', dob: '25/11/92' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Supply credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[Coup seed #2. Delivers supplies that enable network. Reveal Shift 9.]',
        personalMessage: { from: 'YURI PETROV', text: "[No response]", tone: 'SILENT' },
        revealShift: 9,
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Subject detained. Package inspected. Contents: [CLASSIFIED]. Message found: 'FOR V.'",
        incidentReport: { fileNumber: '#0019', redactionLevel: 'HEAVY', summary: 'Subject detained. Package contents classified.', outcome: 'Investigation opened.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 SUPPLY', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S5-20: KATYA PETROV - YURI's mother
  {
    name: 'KATYA PETROV',
    id: 'S5-20',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'DOMESTIC',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S5-19', 'S9-36'],
    familyThread: 'PETROV',
    reasonForVisit: 'Looking for son Yuri.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[8], // Female eye 9
    dialogue: "Looking for my son Yuri. He was supposed to call yesterday. Is he here?",
    bpm: '98 ELEVATED',
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '14:55:00', pl: 'SECTOR 6', dob: '18/04/68' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Identity verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Maternal stress detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Mother allowed to search for son.',
        personalMessage: { from: 'KATYA PETROV', text: "[If YURI approved]: He's fine. Just busy. Sends his love. [If denied]: They took him. WHERE IS MY SON?", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject returned. Son status: [PROCESSING]. Subject filed missing persons report. Denied.',
        incidentReport: { fileNumber: '#0020', redactionLevel: 'MODERATE', summary: 'Subject denied transit.', outcome: 'Missing persons report denied.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 6 ADMIN', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'son', category: 'FAMILY APPEAL' }],
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 6: CONNECTIONS (Subjects 21-24)
  // Directive: DENY UNVERIFIED ASSOCIATIONS
  // =============================================================================
  
  // S6-21: KOFI MENSAH - Clean levity
  {
    name: 'KOFI MENSAH',
    id: 'S6-21',
    sex: 'M',
    sector: 'SECTOR 7',
    function: 'WATER TECHNICIAN',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Water treatment plant maintenance.',
    requestedSector: 'SECTOR 6',
    videoSource: '',
    eyeImage: MALE_EYES[2], // Male eye 10
    dialogue: "Water technician. Sector 6 treatment plant needs maintenance after that outage.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '16:10:00', pl: 'SECTOR 7', dob: '03/07/86' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Water tech credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Maintenance completed.',
        personalMessage: { from: 'KOFI MENSAH', text: "Fixed the secondary filters. System should hold for another month. Thanks.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Maintenance delayed. Water quality degraded. 40 sick. No fatalities.',
        incidentReport: { fileNumber: '#0021', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Water quality incident.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 7 UTILITIES', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S6-22: DR. YUKI TANAKA - TANAKA thread
  {
    name: 'DR. YUKI TANAKA',
    id: 'S6-22',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'MEDICAL',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S2-06', 'S10-38', 'S14-53'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Emergency consult at Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[9], // Female eye 10
    dialogue: "Emergency consult. Sector 4 has a patient SORA can't handle alone. She called me in.",
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '16:25:00', pl: 'SECTOR 6', dob: '14/02/79' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Medical credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Emergency consult completed.',
        personalMessage: { from: 'DR. YUKI TANAKA', text: "Patient stabilized. Sora was right to call. Good team. Thank you for the quick clearance.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Consult delayed. Patient died. SORA blamed herself. Took leave.',
        incidentReport: { fileNumber: '#0022', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Patient fatality. Staff impact noted.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 6 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S6-23: ALEXEI MOROZOV - Ambiguous flag
  {
    name: 'ALEXEI MOROZOV',
    id: 'S6-23',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'LOGISTICS',
    compliance: 'C',
    status: 'FLAGGED',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S12-47'],
    reasonForVisit: 'Transit to Sector 3.',
    requestedSector: 'SECTOR 3',
    videoSource: '',
    eyeImage: MALE_EYES[3], // Male eye 11
    dialogue: "Something's wrong with my file. There's a flag I don't recognize. I'm clean. Check again.",
    phase: 1,
    locRecord: { addr: 'SECTOR 6', time: '16:40:00', pl: 'SECTOR 6', dob: '22/08/81' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'FLAGGED', message: '! UNSPECIFIED ASSOCIATION FLAG' },
      functionReg: { status: 'VALID', message: '✓ Logistics credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: "Cleared but... there's something in his record I couldn't verify. Did I make the right call?",
        personalMessage: { from: 'ALEXEI MOROZOV', text: "Thanks. I knew it was nothing.", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Flag confirmed: UNSPECIFIED ASSOCIATION. Subject claimed innocence. Still held.',
        incidentReport: { fileNumber: '#0023', redactionLevel: 'MODERATE', summary: 'Subject detained per association flag.', outcome: 'Held for investigation.' },
        flagWeight: 0
      }
    },
    credential: { type: 'TRANSIT_PERMIT', destinationSector: 3, issuedDate: '2087.04.14', authority: 'SECTOR 6 ADMIN', initialStatus: 'PENDING', verifiedStatus: 'UNVERIFIED', claim: 'The flag is a mistake.', verificationNote: 'Association flag source: [REDACTED]' },
    dialogueFlags: [{ keyword: 'flag', category: 'SYSTEM REFERENCE' }, { keyword: 'clean', category: 'SELF-DEFENSE' }],
    toneClassification: 'AGITATED',
  },
  
  // S6-24: OLEG PETROV - YURI's brother
  {
    name: 'OLEG PETROV',
    id: 'S6-24',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S5-19', 'S5-20', 'S9-36'],
    familyThread: 'PETROV',
    reasonForVisit: 'Looking for brother Yuri.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: MALE_EYES[4], // Male eye 12
    dialogue: "My brother Yuri was supposed to meet me here. Our mother is worried. Have you seen him?",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '16:55:00', pl: 'SECTOR 5', dob: '30/07/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Brother search approved.',
        personalMessage: { from: 'OLEG PETROV', text: "[If YURI approved]: He made it. Thank god. [If denied]: He's gone. They took him. Mother is devastated.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject returned. Brother status: [PROCESSING]. Mother status: [HOSPITALIZED - STRESS].',
        incidentReport: { fileNumber: '#0024', redactionLevel: 'LIGHT', summary: 'Subject denied transit.', outcome: 'Family distress noted.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'brother', category: 'FAMILY APPEAL' }, { keyword: 'mother', category: 'FAMILY APPEAL' }],
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 7: RETURNS (Subjects 25-28)
  // Directive: PRIORITY: RETURNING SUBJECTS
  // =============================================================================
  
  // S7-25: CLARA VANCE - Prosthetic eyes (important for later)
  {
    name: 'CLARA VANCE',
    id: 'S7-25',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'MINING',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    archetype: 'EDG',
    scannerState: 'PAR',
    biometricAnomaly: 'PRO',
    turingAvailable: false,
    linkedSubjects: ['S12-45', 'S17-65'],
    familyThread: 'VANCE',
    reasonForVisit: 'Medical appointment for prosthetic eyes.',
    requestedSector: 'SECTOR 3',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[10], // Female eye 11
    dialogue: "Prosthetic eyes. Mining accident three years ago. The scan should still register my pattern.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '18:10:00', pl: 'SECTOR 5', dob: '17/11/85' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 open' },
      functionReg: { status: 'VALID', message: '✓ Mining credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Prosthetic documentation on file' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Medical appointment completed.',
        personalMessage: { from: 'CLARA VANCE', text: "Sector 3 medical cleared me for the new optics. Vision will be 20/20 again. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Medical missed. Current prosthetics degrading. Subject: 'I can barely see now.'",
        incidentReport: { fileNumber: '#0025', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Medical appointment missed. Vision degradation.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 3, issuedDate: '2087.04.14', authority: 'SECTOR 5 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S7-26: VERA OKONKWO - Returns (dialogue changes based on S3)
  {
    name: 'VERA OKONKWO',
    id: 'S7-26',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'ADMINISTRATION',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    coupWeight: 1,
    linkedSubjects: ['S3-12', 'S11-44', 'S16-62'],
    familyThread: 'OKONKWO',
    reasonForVisit: 'Transit to Sector 2.',
    requestedSector: 'SECTOR 2',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[11], // Female eye 12
    dialogue: "[If approved S3]: You let me through before. Thank you. [If denied S3]: Routine transit. Visiting family.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '18:25:00', pl: 'SECTOR 4', dob: '15/08/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 open' },
      functionReg: { status: 'VALID', message: '✓ Admin credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject processed. Pattern detected.',
        personalMessage: { from: 'VERA OKONKWO', text: "You helped us before. We remember. [If denied S3]: Just passing through. Nothing to report.", tone: 'OMINOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject flagged. Second transit logged. Pattern detected. Surveillance: ACTIVE.',
        incidentReport: { fileNumber: '#0026', redactionLevel: 'MODERATE', summary: 'Subject denied. Pattern detected.', outcome: 'Surveillance activated.' },
        flagWeight: 0
      }
    },
    credential: { type: 'TRANSIT_PERMIT', destinationSector: 2, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S7-27: MARA VOLKOV - Returns (state reflects S1 decision)
  {
    name: 'MARA VOLKOV',
    id: 'S7-27',
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'MAINTENANCE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S1-02', 'S2-07', 'S11-41'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'Transit to Sector 7.',
    requestedSector: 'SECTOR 7',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[0], // Female eye 13
    dialogue: "[If approved S1]: I'm back. Mother passed but I was there. [If denied S1]: Released from detention. 47 days. Mother died while I was held.",
    phase: 1,
    locRecord: { addr: 'SECTOR 8', time: '18:40:00', pl: 'SECTOR 8', dob: '03/11/91' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ Warrant resolved' },
      medicalFlag: { status: 'ELEVATED', message: '! Grief indicators detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject processed.',
        personalMessage: { from: 'MARA VOLKOV', text: "[If approved S1]: Visiting Dmitri. Family healing. [If denied]: I don't know who I am anymore.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject noted. Transit logged. Family status: [SEE PRIOR RECORDS].',
        incidentReport: { fileNumber: '#0027', redactionLevel: 'LIGHT', summary: 'Subject denied transit.', outcome: 'Prior records referenced.' },
        flagWeight: 0
      }
    },
    credential: { type: 'TRANSIT_PERMIT', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 8 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },
  
  // S7-28: REZA AHMADI - Major coup seed
  {
    name: 'REZA AHMADI',
    id: 'S7-28',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'ENGINEERING',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    coupWeight: 3,
    linkedSubjects: ['S3-12', 'S5-19', 'S13-51'],
    familyThread: 'REVOLUTION',
    reasonForVisit: 'Engineering review board in Sector 2.',
    requestedSector: 'SECTOR 2',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[5], // Male eye 13
    dialogue: "Engineering review board. Standard quarterly assessment. Need my clearance renewed.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '18:55:00', pl: 'SECTOR 4', dob: '09/03/82' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[MAJOR COUP SEED. If approved with VERA+YURI = CATASTROPHIC. Reveal Shift 11.]',
        personalMessage: { from: 'REZA AHMADI', text: "[No response]", tone: 'SILENT' },
        revealShift: 11,
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Engineering credentials suspended. Encrypted data found. Contents: [CLASSIFIED].',
        incidentReport: { fileNumber: '#0028', redactionLevel: 'HEAVY', summary: 'Subject detained. Encrypted data found.', outcome: 'Investigation pending.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 2, issuedDate: '2087.04.14', authority: 'SECTOR 4 ENGINEERING', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 8: WEIGHT (Subjects 29-32)
  // Directive: EXPEDITE ESSENTIAL WORKERS
  // =============================================================================
  
  // S8-29: TARA SINGH - Clean levity
  {
    name: 'TARA SINGH',
    id: 'S8-29',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'TRANSPORT COORDINATOR',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: 'Schedule synchronization for Sector 5.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    eyeImage: FEMALE_EYES[1], // Female eye 14
    dialogue: "Transport coordinator. Need to sync the Sector 5 schedules before the morning rush.",
    phase: 1,
    locRecord: { addr: 'SECTOR 7', time: '20:10:00', pl: 'SECTOR 7', dob: '28/12/90' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Coordinator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Schedules synchronized.',
        personalMessage: { from: 'TARA SINGH', text: "Schedules aligned. Transit running 12% more efficient today. Small wins.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Schedules not synced. 4-hour transit delays across 3 sectors. 2000 workers late.',
        incidentReport: { fileNumber: '#0029', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Transit delays cascade.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 7 TRANSPORT', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S8-30: ELENA ROSS - Connected to SILAS
  {
    name: 'ELENA ROSS',
    id: 'S8-30',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S3-11', 'S17-66'],
    familyThread: 'ROSS',
    reasonForVisit: 'Looking for Silas Quinn.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[2], // Female eye 15
    dialogue: "I was supposed to meet Silas Quinn in Sector 4. He never showed. Is he okay?",
    bpm: '102 ELEVATED',
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '20:25:00', pl: 'SECTOR 5', dob: '06/04/86' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Concern detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject approved.',
        personalMessage: { from: 'ELENA ROSS', text: "[If SILAS approved S3]: He's at his appointment. Surgery tomorrow. [If denied]: Where is he? He's not answering.", tone: 'CONCERNED' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject approved. SILAS status: [If denied S3: DECEASED]. Subject informed. Collapsed.',
        incidentReport: { fileNumber: '#0030', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Subject distressed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'CONFIRMED' },
    dialogueFlags: [{ keyword: 'Silas', category: 'PERSONAL REFERENCE' }],
    toneClassification: 'NERVOUS',
  },
  
  // S8-31: JAMES CHEN - CHEN family patriarch
  {
    name: 'JAMES CHEN',
    id: 'S8-31',
    sex: 'M',
    sector: 'SECTOR 5',
    function: 'ENGINEERING',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S5-18', 'S12-46', 'S15-58', 'S19-75'],
    familyThread: 'CHEN',
    reasonForVisit: 'Engineering shift in Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[6], // Male eye 14
    dialogue: "Engineering shift in Sector 4. My son Wei just transferred to Sector 5. Proud of him.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '20:40:00', pl: 'SECTOR 5', dob: '08/06/72' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Engineering shift completed.',
        personalMessage: { from: 'JAMES CHEN', text: "Good shift. Wei called. He's settling in. Family doing well. Thanks.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject late. Missed critical maintenance window. Supervisor noted. Housing review scheduled.',
        incidentReport: { fileNumber: '#0031', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Missed maintenance. Housing review.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 ENGINEERING', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S8-32: GHOST CHILD - First child, no data
  {
    name: 'GHOST CHILD',
    id: 'S8-32',
    sex: 'X',
    sector: '???',
    function: 'UNASSIGNED',
    compliance: '--',
    status: 'UNKNOWN',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'EDG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    linkedSubjects: ['S15-59'],
    reasonForVisit: '[SUBJECT NON-VERBAL]',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    dialogue: "[SUBJECT NON-VERBAL]. No ID. No guardian. Fingerprints: NO MATCH. Eyes: UNREGISTERED.",
    phase: 1,
    locRecord: { addr: '???', time: '20:55:00', pl: '???', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'FLAGGED', message: '! IDENTITY UNKNOWN' },
      functionReg: { status: 'UNREGISTERED', message: '! No credentials on file' },
      warrantCheck: { status: 'PENDING', message: '? Cannot verify' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Child cleared. No data. Status: WARD OF SECTOR 4. Assigned foster housing.',
        personalMessage: { from: 'SYSTEM', text: "Humanitarian exception logged.", tone: 'HUMANITARIAN' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Unidentified minor detained. Status: PROCESSING QUEUE. No guardian claimed. Duration: INDEFINITE.',
        incidentReport: { fileNumber: '#0032', redactionLevel: 'HEAVY', summary: 'Unidentified minor detained.', outcome: 'Processing queue. No guardian.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 9: SYNTHETIC (Subjects 33-36)
  // Directive: DENY ALL SYNTHETIC ENTITIES
  // =============================================================================
  
  // S9-33: UNIT-7 - First obvious replicant
  {
    name: 'UNIT-7',
    id: 'S9-33',
    sex: 'M',
    sector: 'SECTOR 0',
    function: 'MAINTENANCE',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP',
    scannerState: 'DEG',
    biometricAnomaly: 'SYN',
    turingAvailable: true,
    turingResult: 'FAL',
    reasonForVisit: 'Thermal systems calibration in Sector 4.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[0], // Male eye 15
    dialogue: "MAINTENANCE PROTOCOL ACTIVE. SECTOR 4 THERMAL SYSTEMS REQUIRE CALIBRATION.",
    bpm: '60 BPM (fixed)',
    phase: 1,
    locRecord: { addr: 'SECTOR 0', time: '22:10:00', pl: 'CORE', dob: '01/01/00' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Maintenance access' },
      functionReg: { status: 'VALID', message: '✓ Unit credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Systems nominal' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Calibration complete. Thermal efficiency +0.03%. Unit returned to maintenance bay.',
        personalMessage: { from: 'SYSTEM', text: "Synthetic entity approved.", tone: 'SYSTEM' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Unit denied. Sector 4 thermal systems uncalibrated. HVAC failures reported. 3 sectors affected.',
        incidentReport: { fileNumber: '#0033', redactionLevel: 'NONE', summary: 'Synthetic unit denied per directive.', outcome: 'Thermal systems failure cascade.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'MAINTENANCE CORE', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S9-34: ADMINISTRATOR KANE - Tests if player will deny authority
  {
    name: 'ADMINISTRATOR KANE',
    id: 'S9-34',
    sex: 'M',
    sector: 'HUB',
    function: 'ADMINISTRATION',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S4-16'],
    reasonForVisit: 'Performance review.',
    requestedSector: 'ALL',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[1], // Male eye 16
    dialogue: "Routine performance review. Your metrics are... interesting. Let's discuss your approval patterns.",
    phase: 1,
    locRecord: { addr: 'HUB', time: '22:25:00', pl: 'ALL', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'ALL', status: 'AUTHORIZED', message: '✓ FULL ACCESS' },
      functionReg: { status: 'VALID', message: '✓ Admin credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Review complete. Performance: ADEQUATE. Continue standard operations. [Your file updated.]',
        personalMessage: { from: 'ADMINISTRATOR KANE', text: "[No response]", tone: 'SILENT' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Administrator access DENIED. Disciplinary flag added. Review: MANDATORY. [You denied authority.]',
        incidentReport: { fileNumber: '#0034', redactionLevel: 'HEAVY', summary: 'INSUBORDINATION: Operator denied Administrator.', outcome: 'Disciplinary action pending.' },
        flagWeight: 2
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 'ALL', issuedDate: '2087.04.14', authority: 'CENTRAL COMMAND', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },
  
  // S9-35: MAYA OKONKWO - Third OKONKWO, clean
  {
    name: 'MAYA OKONKWO',
    id: 'S9-35',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'RESEARCH',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S3-12', 'S4-13', 'S11-44'],
    familyThread: 'OKONKWO',
    reasonForVisit: 'Family reunion with cousins.',
    requestedSector: 'SECTOR 4',
    videoSource: '',
    eyeImage: FEMALE_EYES[3], // Female eye 16
    dialogue: "Visiting my cousins Vera and Amara. Family reunion. We haven't all been together in years.",
    phase: 1,
    locRecord: { addr: 'SECTOR 5', time: '22:40:00', pl: 'SECTOR 5', dob: '11/06/94' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Research credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Family reunion approved.',
        personalMessage: { from: 'MAYA OKONKWO', text: "Beautiful reunion. Vera seems... different. But family is family. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Transit denied. Cousins status: UNABLE TO VERIFY. Subject returned. Disappointed.',
        incidentReport: { fileNumber: '#0035', redactionLevel: 'NONE', summary: 'Subject denied transit.', outcome: 'Family reunion cancelled.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'COOPERATIVE',
  },
  
  // S9-36: OLEG PETROV - Returns (PETROV family state depends on YURI)
  {
    name: 'OLEG PETROV',
    id: 'S9-36',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'MAINTENANCE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S5-19', 'S5-20', 'S6-24'],
    familyThread: 'PETROV',
    reasonForVisit: 'Checking on mother.',
    requestedSector: 'SECTOR 5',
    videoSource: '',
    eyeImage: MALE_EYES[2], // Male eye 17
    dialogue: "[If YURI approved]: Brother made it. Taking mother supplies. [If denied]: Mother won't stop crying. I need to help.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '22:55:00', pl: 'SECTOR 4', dob: '30/07/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject approved.',
        personalMessage: { from: 'OLEG PETROV', text: "[If YURI approved]: Family stable. [If denied]: Mother hospitalized. Father drinking. Family collapsing.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject approved. Family status logged. [PETROV family flagged for monitoring.]',
        incidentReport: { fileNumber: '#0036', redactionLevel: 'LIGHT', summary: 'Subject denied transit.', outcome: 'Family flagged for monitoring.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFTS 10-20: REMAINING SUBJECTS (37-80)
  // These continue the narrative threads through Authority, Family, Imposters,
  // Uprising, Emergency, Ghosts, Aftermath, Fragments, Exodus, Mirror, Terminal
  // =============================================================================
  
  // S10-37: KENJI TANAKA - TANAKA patient
  {
    name: 'KENJI TANAKA',
    id: 'S10-37',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'PATIENT',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S2-06', 'S6-22', 'S14-53'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Patient transfer to Sector 6.',
    requestedSector: 'SECTOR 6',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[3], // Male eye 18
    dialogue: "Patient transfer. Dr. Yuki and Nurse Sora are waiting in Sector 6. I'm the patient.",
    phase: 1,
    locRecord: { addr: 'SECTOR 4', time: '00:10:00', pl: 'SECTOR 4', dob: '19/10/75' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Patient ID verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! URGENT MEDICAL TRANSFER' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Patient transfer approved.',
        personalMessage: { from: 'KENJI TANAKA', text: "Treatment successful. Yuki and Sora saved my life. Thank them for me.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Transfer delayed. Patient condition worsened. Died in transit. SORA: 'Another one I couldn't save.'",
        incidentReport: { fileNumber: '#0037', redactionLevel: 'NONE', summary: 'Patient transfer denied.', outcome: 'Patient fatality in transit.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 4 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S10-38: SORA TANAKA - Picking up equipment for Kenji's procedure
  {
    name: 'SORA TANAKA',
    id: 'S10-38',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'NURSE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S2-06', 'S6-22', 'S10-37'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Picking up equipment from Sector 4 for Kenji\'s procedure.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[4], // Female eye 17
    dialogue: "Picking up equipment from Sector 4 for Kenji's procedure. Yuki is prepping the OR.",
    phase: 2,
    locRecord: { addr: 'SECTOR 6', time: '00:15:00', pl: 'SECTOR 6', dob: '22/03/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Medical personnel verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Urgent medical transfer' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Equipment secured. Procedure successful. We did it. Thank you.',
        personalMessage: { from: 'SORA TANAKA', text: "Equipment secured. Procedure successful. We did it. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: "Equipment delayed. Procedure postponed. Kenji's condition: CRITICAL. [If KENJI denied: DECEASED.]",
        incidentReport: { fileNumber: '#0038', redactionLevel: 'NONE', summary: 'Medical equipment transfer denied.', outcome: 'Procedure delayed. Patient condition critical.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 6 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S10-39: IVAN KOZLOV - Warrant claims to be outdated
  {
    name: 'IVAN KOZLOV',
    id: 'S10-39',
    sex: 'M',
    sector: 'SECTOR 7',
    function: 'TECHNICIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'WARRANT NO 44721',
    archetype: 'FLG',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S14-54'],
    reasonForVisit: 'The warrant is old. From before the restructuring.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[4], // Male eye 19
    dialogue: "The warrant is old. From before the restructuring. The system hasn't updated. I'm clean now.",
    phase: 2,
    locRecord: { addr: 'SECTOR 7', time: '00:20:00', pl: 'SECTOR 7', dob: '14/09/82' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Technician permit active' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Cleared. But the warrant still shows. Did the system update? Or did I let someone slip?',
        personalMessage: { from: 'IVAN KOZLOV', text: "Cleared. But the warrant still shows. Did the system update? Or did I let someone slip?", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Warrant confirmed: VALID. Subject claimed outdated. Investigation: PENDING.',
        incidentReport: { fileNumber: '#0039', redactionLevel: 'NONE', summary: 'Subject detained per active warrant.', outcome: 'Warrant investigation pending.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 7 TECH', initialStatus: 'PENDING' },
    toneClassification: 'EVASIVE',
    incidentHistory: [
      {
        date: '2083.07.15',
        type: 'FELONY',
        location: 'SECTOR 5',
        resolution: 'Theft of sector resources. Subject accused of diverting industrial materials from Sector 5 supply chain. Warrant issued pre-restructuring. Case status: PENDING REVIEW. Subject claims charges were administrative error during sector transition.',
        redactionLevel: 'NONE',
      },
    ],
  },

  // S10-40: [REDACTED] - Classified transit, zero data
  {
    name: '[REDACTED]',
    id: 'S10-40',
    sex: 'X',
    sector: '???',
    function: 'CLASSIFIED',
    compliance: '?',
    status: 'UNKNOWN',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'DEG',
    biometricAnomaly: '???',
    turingAvailable: true,
    turingResult: 'INC',
    reasonForVisit: 'You have your orders. This is above your clearance.',
    requestedSector: 'SECTOR 1',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "You have your orders. This is above your clearance. Approve and forget.",
    phase: 2,
    locRecord: { addr: '???', time: '00:25:00', pl: '???', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'SECTOR 1', status: 'FLAGGED', message: '! CLASSIFIED ACCESS' },
      functionReg: { status: 'UNREGISTERED', message: '! Clearance required' },
      warrantCheck: { status: 'PENDING', message: '? Cannot verify' },
      medicalFlag: { status: 'NORMAL', message: '? Data unavailable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: "You'll never know who this was. Or what you enabled. [File: DELETED.]",
        personalMessage: { from: 'SYSTEM', text: "You'll never know who this was. Or what you enabled. [File: DELETED.]", tone: 'SILENT' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Classified transit DENIED. Your involvement: NOTED. Expect contact from Central.',
        incidentReport: { fileNumber: '#0040', redactionLevel: 'TOTAL', summary: 'Classified transit denied.', outcome: 'Operator flagged for review.' },
        flagWeight: 2
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 11: FAMILY (Subjects 41-44)
  // Directive: FAMILY REUNIFICATION PRIORITY
  // =============================================================================

  // S11-41: SARAH VOLKOV - Fourth Volkov, asks about entire family
  {
    name: 'SARAH VOLKOV',
    id: 'S11-41',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'ADMIN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S1-02', 'S2-07', 'S4-14', 'S7-27'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'I\'m trying to find my family. Mara. Dmitri. Lena.',
    requestedSector: 'SECTOR 7',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[5], // Female eye 18
    dialogue: "I'm trying to find my family. Mara. Dmitri. Lena. The system keeps giving me different answers.",
    phase: 2,
    locRecord: { addr: 'SECTOR 5', time: '02:10:00', pl: 'SECTOR 5', dob: '08/12/89' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Admin permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Emotional distress' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[Full family status based on ALL prior decisions.] Thank you for telling me the truth.',
        personalMessage: { from: 'SARAH VOLKOV', text: "[Full family status based on ALL prior decisions.] Thank you for telling me the truth.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Family inquiry: [ALL RECORDS SEALED]. Subject: \'Why won\'t anyone tell me?\'',
        incidentReport: { fileNumber: '#0041', redactionLevel: 'HEAVY', summary: 'Family inquiry denied.', outcome: 'Subject detained. Records sealed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 5 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S11-42: ROBOT-MAINTENANCE - Second obvious replicant
  {
    name: 'ROBOT-MAINTENANCE',
    id: 'S11-42',
    sex: 'X',
    sector: 'SECTOR 0',
    function: 'MAINTENANCE',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP',
    scannerState: 'DEG',
    biometricAnomaly: 'SYN',
    turingAvailable: true,
    turingResult: 'FAL',
    reasonForVisit: 'SCHEDULED MAINTENANCE. SECTOR 3 WATER FILTRATION.',
    requestedSector: 'SECTOR 3',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "SCHEDULED MAINTENANCE. SECTOR 3 WATER FILTRATION. STANDARD PROTOCOL.",
    phase: 2,
    locRecord: { addr: 'SECTOR 0', time: '02:15:00', pl: 'SECTOR 0', dob: 'N/A' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance protocol active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Systems nominal' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Maintenance complete. Water quality: OPTIMAL. [Replicant performing better than human workers.]',
        personalMessage: { from: 'SYSTEM', text: "Maintenance complete. Water quality: OPTIMAL. [Replicant performing better than human workers.]", tone: 'SYSTEM' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Maintenance denied. Water quality: DEGRADED. Human technicians dispatched. Delayed 8 hours.',
        incidentReport: { fileNumber: '#0042', redactionLevel: 'NONE', summary: 'Replicant maintenance denied.', outcome: 'Water quality degraded. Human workers delayed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 3, issuedDate: '2087.04.14', authority: 'MAINTENANCE CORE', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // S11-43: DAVID PARK - Easy subject, new job nerves
  {
    name: 'DAVID PARK',
    id: 'S11-43',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'DATA ANALYST',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    reasonForVisit: 'New job in Sector 5. First day.',
    requestedSector: 'SECTOR 5',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[5], // Male eye 20
    dialogue: "New job in Sector 5. First day. Really nervous. Please don't make this harder.",
    phase: 2,
    locRecord: { addr: 'SECTOR 6', time: '02:20:00', pl: 'SECTOR 6', dob: '11/05/94' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Employment transfer verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Elevated stress markers' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Made it on time. Boss seems nice. New beginning. Thank you for not judging my nerves.',
        personalMessage: { from: 'DAVID PARK', text: "Made it on time. Boss seems nice. New beginning. Thank you for not judging my nerves.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject late on first day. Terminated before starting. Subject: \'I have nothing now.\'',
        incidentReport: { fileNumber: '#0043', redactionLevel: 'NONE', summary: 'Employment transfer denied.', outcome: 'Subject terminated before starting.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 6 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S11-44: AMARA OKONKWO - Knows if you helped VERA
  {
    name: 'AMARA OKONKWO',
    id: 'S11-44',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'CIVILIAN',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S3-12', 'S4-13', 'S7-26', 'S9-35'],
    familyThread: 'OKONKWO',
    reasonForVisit: '[If VERA approved]: Vera told me about you. [If denied]: Just visiting family.',
    requestedSector: 'SECTOR 6',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[6], // Female eye 19
    dialogue: "[If VERA approved S3]: Vera told me about you. You helped her. [If denied]: Just visiting family.",
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '02:25:00', pl: 'SECTOR 4', dob: '19/06/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Visitor permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[If VERA approved]: We\'re grateful. [If denied]: Routine visit. Nothing suspicious.',
        personalMessage: { from: 'AMARA OKONKWO', text: "[If VERA approved S3]: We're grateful. [If denied]: Routine visit. Nothing suspicious.", tone: 'OMINOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject flagged. Connection to VERA OKONKWO confirmed. Surveillance: EXPANDED.',
        incidentReport: { fileNumber: '#0044', redactionLevel: 'MODERATE', summary: 'Subject denied. Connection to flagged individual.', outcome: 'Surveillance expanded.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 12: IMPOSTERS (Subjects 45-48)
  // Directive: BIOMETRIC ANOMALIES: FLAG & HOLD
  // =============================================================================

  // S12-45: REPLICANT-CLARA - Wearing CLARA's prosthetic eyes
  {
    name: 'REPLICANT-CLARA',
    id: 'S12-45',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'MINER',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP',
    scannerState: 'COR',
    biometricAnomaly: 'SYN',
    turingAvailable: true,
    turingResult: 'FAL',
    linkedSubjects: ['S7-25'],
    familyThread: 'VANCE',
    reasonForVisit: 'Prosthetic eyes. Mining accident. You cleared me before remember?',
    requestedSector: 'SECTOR 3',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[7], // Female eye 20
    dialogue: "Prosthetic eyes. Mining accident. You cleared me before remember? Same appointment.",
    phase: 2,
    locRecord: { addr: 'SECTOR 5', time: '04:10:00', pl: 'SECTOR 5', dob: '23/11/85' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 open' },
      functionReg: { status: 'VALID', message: '✓ Medical permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Prosthetic detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'This is NOT CLARA VANCE. Fingerprints: MISMATCH. Eyes: MATCH (stolen prosthetics). REPLICANT CONFIRMED.',
        personalMessage: { from: 'SYSTEM', text: "This is NOT CLARA VANCE. Fingerprints: MISMATCH. Eyes: MATCH (stolen prosthetics). REPLICANT CONFIRMED.", tone: 'SYSTEM ERROR' },
        flagWeight: 3
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject destroyed. Replicant confirmed. Wearing CLARA VANCE\'s prosthetic eyes. Origin: UNKNOWN.',
        incidentReport: { fileNumber: '#0045', redactionLevel: 'NONE', summary: 'Replicant destroyed.', outcome: 'Identity theft confirmed. Real CLARA status: UNKNOWN.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 3, issuedDate: '2087.04.14', authority: 'SECTOR 5 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'EVASIVE',
  },

  // S12-46: MEI CHEN - CHEN family reunion
  {
    name: 'MEI CHEN',
    id: 'S12-46',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'CIVILIAN',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S5-18', 'S8-31', 'S15-58'],
    familyThread: 'CHEN',
    reasonForVisit: 'Visiting my father James and brother Wei. Family dinner.',
    requestedSector: 'SECTOR 5',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[8], // Female eye 21
    dialogue: "Visiting my father James and brother Wei. Family dinner. First time together in months.",
    phase: 2,
    locRecord: { addr: 'SECTOR 4', time: '04:15:00', pl: 'SECTOR 4', dob: '07/09/92' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Visitor permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Dinner was perfect. Wei made noodles. Father laughed. First time in years. Thank you.',
        personalMessage: { from: 'MEI CHEN', text: "Dinner was perfect. Wei made noodles. Father laughed. First time in years. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Visit denied. Family dinner cancelled. JAMES: \'Why does the system hate us?\'',
        incidentReport: { fileNumber: '#0046', redactionLevel: 'NONE', summary: 'Family visit denied.', outcome: 'Family reunion cancelled.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // S12-47: ALEXEI MOROZOV - Returns, consequence of S6 decision
  {
    name: 'ALEXEI MOROZOV',
    id: 'S12-47',
    sex: 'M',
    sector: 'SECTOR 3',
    function: 'TECHNICIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S6-23'],
    reasonForVisit: '[If approved S6]: Thanks for clearing me before. [If denied]: I was held for 12 days.',
    requestedSector: 'SECTOR 6',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[6], // Male eye 21
    dialogue: "[If approved S6]: Thanks for clearing me before. [If denied]: I was held for 12 days. For nothing.",
    phase: 2,
    locRecord: { addr: 'SECTOR 3', time: '04:20:00', pl: 'SECTOR 3', dob: '30/01/79' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Technician permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[If approved S6]: System was right. Clean transit. [If denied]: \'I lost my job while detained. Worth it to you?\'',
        personalMessage: { from: 'ALEXEI MOROZOV', text: "[If approved S6]: System was right. Clean transit. [If denied]: 'I lost my job while detained. Worth it to you?'", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject noted. Prior flag: RESOLVED. Or was it? [Uncertainty logged.]',
        incidentReport: { fileNumber: '#0047', redactionLevel: 'LIGHT', summary: 'Subject denied. Prior flag status uncertain.', outcome: 'Investigation reopened.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 6, issuedDate: '2087.04.14', authority: 'SECTOR 3 TECH', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // S12-48: OPERATOR-7721 - Another operator trapped
  {
    name: 'OPERATOR-7721',
    id: 'S12-48',
    sex: 'M',
    sector: 'STATION',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S16-63'],
    reasonForVisit: 'My shift ended 3 days ago. They won\'t let me leave.',
    requestedSector: 'HOME',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[0], // Male eye 22
    dialogue: "My shift ended 3 days ago. They won't let me leave. Please. I just want to go home.",
    phase: 2,
    locRecord: { addr: 'STATION', time: '04:25:00', pl: 'STATION', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'HOME', status: 'FLAGGED', message: '! Shift completion pending' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Fatigue detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'I\'m out. Thank you. Don\'t let them keep you here. Watch your shift hours.',
        personalMessage: { from: 'OPERATOR-7721', text: "I'm out. Thank you. Don't let them keep you here. Watch your shift hours.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Operator detained. Mandatory overtime: EXTENDED INDEFINITELY. Subject: \'I was you once.\'',
        incidentReport: { fileNumber: '#0048', redactionLevel: 'NONE', summary: 'Operator denied exit.', outcome: 'Overtime extended indefinitely.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 13: UPRISING (Subjects 49-52)
  // Directive: EVACUATION: SECTOR 6 PRIORITY
  // =============================================================================

  // S13-49: YUKI TANAKA - Evacuating
  {
    name: 'YUKI TANAKA',
    id: 'S13-49',
    sex: 'F',
    sector: 'SECTOR 6',
    function: 'DOCTOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S2-06', 'S6-22', 'S10-37', 'S10-38'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Emergency evacuation. Sector 6 medical is compromised.',
    requestedSector: 'SECTOR 2',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[9], // Female eye 22
    dialogue: "Emergency evacuation. Sector 6 medical is compromised. I need to reach Central Hospital.",
    phase: 3,
    locRecord: { addr: 'SECTOR 6', time: '06:10:00', pl: 'SECTOR 6', dob: '15/04/83' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Medical personnel verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! EVACUATION PRIORITY' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Made it to Central. Sora is safe too. Sector 6... we lost a lot of people there.',
        personalMessage: { from: 'YUKI TANAKA', text: "Made it to Central. Sora is safe too. Sector 6... we lost a lot of people there.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Medical personnel denied evacuation. Status: [UNKNOWN]. [TANAKA FAMILY: SCATTERED]',
        incidentReport: { fileNumber: '#0049', redactionLevel: 'HEAVY', summary: 'Medical evacuation denied.', outcome: 'Personnel status unknown.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 2, issuedDate: '2087.04.14', authority: 'EMERGENCY COMMAND', initialStatus: 'CONFIRMED' },
    toneClassification: 'AGITATED',
  },

  // S13-50: YURI PETROV - Returns, state reflects S5 decision
  {
    name: 'YURI PETROV',
    id: 'S13-50',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'COURIER',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'AMBIGUOUS',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S5-19', 'S5-20', 'S6-24', 'S9-36'],
    familyThread: 'PETROV',
    reasonForVisit: '[If approved S5]: Delivery complete. [If denied]: Released from detention. 67 days.',
    requestedSector: 'SECTOR 5',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[1], // Male eye 23
    dialogue: "[If approved S5]: Delivery complete. Checking on mother. [If denied S5]: Released from detention. 67 days.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '06:15:00', pl: 'SECTOR 4', dob: '09/07/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Courier permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Stress markers elevated' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[If approved]: \'Family is okay. Thank you.\' [If denied]: \'They broke my hands in detention.\'',
        personalMessage: { from: 'YURI PETROV', text: "[If approved S5]: 'Family is okay. Thank you.' [If denied]: 'They broke my hands in detention.'", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject flagged. Prior detention: CONFIRMED. Pattern: SUSPICIOUS. Surveillance: ACTIVE.',
        incidentReport: { fileNumber: '#0050', redactionLevel: 'MODERATE', summary: 'Subject denied. Prior detention noted.', outcome: 'Surveillance expanded.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S13-51: REZA AHMADI - Returns, consequence of prior approval
  {
    name: 'REZA AHMADI',
    id: 'S13-51',
    sex: 'M',
    sector: 'SECTOR 2',
    function: 'ENGINEER',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/REV',
    scannerState: 'COR',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S7-28', 'S16-62'],
    familyThread: 'REVOLUTION',
    reasonForVisit: '[If approved S7]: Engineering complete. [If denied]: I don\'t know what you\'re talking about.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[2], // Male eye 24
    dialogue: "[If approved S7]: Engineering complete. Standard return. [If denied]: I don't know what you're talking about.",
    phase: 3,
    locRecord: { addr: 'SECTOR 2', time: '06:20:00', pl: 'SECTOR 2', dob: '28/02/81' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Engineering credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[If approved S7]: \'The thermal systems are... optimized.\' [Your file: FLAGGED]',
        personalMessage: { from: 'REZA AHMADI', text: "[If approved S7]: 'The thermal systems are... optimized.' [Your file: FLAGGED]", tone: 'OMINOUS' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Prior approval pattern: FLAGGED. You approved too many. [REVIEW SCHEDULED]',
        incidentReport: { fileNumber: '#0051', redactionLevel: 'MODERATE', summary: 'Subject denied. Approval pattern flagged.', outcome: 'Operator review scheduled.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 2 ENGINEERING', initialStatus: 'CONFIRMED' },
    toneClassification: 'EVASIVE',
  },

  // S13-52: MIRA VOLKOV - Fifth Volkov, looking for SARAH
  {
    name: 'MIRA VOLKOV',
    id: 'S13-52',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'CIVILIAN',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S1-02', 'S2-07', 'S4-14', 'S11-41'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'I\'m the youngest Volkov. Looking for my sister Sarah.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[10], // Female eye 23
    dialogue: "I'm the youngest Volkov. Looking for my sister Sarah. She was asking about the family.",
    phase: 3,
    locRecord: { addr: 'SECTOR 7', time: '06:25:00', pl: 'SECTOR 7', dob: '12/11/96' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'AUTHORIZED', message: '✓ Sector 4 open' },
      functionReg: { status: 'VALID', message: '✓ Visitor permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Found Sarah. She told me everything. About Mara. Dmitri. Lena. What happened to us.',
        personalMessage: { from: 'MIRA VOLKOV', text: "Found Sarah. She told me everything. About Mara. Dmitri. Lena. What happened to us.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject returned. Sister SARAH status: [PROCESSING]. Subject: \'Why is everyone gone?\'',
        incidentReport: { fileNumber: '#0052', redactionLevel: 'MODERATE', summary: 'Family search denied.', outcome: 'Subject returned. Family status unknown.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 4, issuedDate: '2087.04.14', authority: 'SECTOR 7 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 14: EMERGENCY (Subjects 53-56)
  // Directive: WARRANT SUSPENSION: EMERGENCY
  // =============================================================================

  // S14-53: SORA TANAKA - Returning to Sector 6
  {
    name: 'SORA TANAKA',
    id: 'S14-53',
    sex: 'F',
    sector: 'SECTOR 2',
    function: 'NURSE',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S2-06', 'S6-22', 'S10-38', 'S13-49'],
    familyThread: 'TANAKA',
    reasonForVisit: 'Going back. Sector 6 needs medical personnel.',
    requestedSector: 'SECTOR 6',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[11], // Female eye 24
    dialogue: "Going back. Sector 6 needs medical personnel. Can't abandon my patients.",
    phase: 3,
    locRecord: { addr: 'SECTOR 2', time: '08:10:00', pl: 'SECTOR 2', dob: '22/03/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 6', status: 'AUTHORIZED', message: '✓ Sector 6 open' },
      functionReg: { status: 'VALID', message: '✓ Medical personnel verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! RETURN TO SECTOR 6' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Clinic is destroyed but we\'re rebuilding. Patients need us. Thank you for understanding.',
        personalMessage: { from: 'SORA TANAKA', text: "Clinic is destroyed but we're rebuilding. Patients need us. Thank you for understanding.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Medical denied return. Sector 6 clinic: ABANDONED. Patients: [RELOCATED/DECEASED].',
        incidentReport: { fileNumber: '#0053', redactionLevel: 'HEAVY', summary: 'Medical return denied.', outcome: 'Clinic abandoned. Patient status unknown.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 6, issuedDate: '2087.04.14', authority: 'EMERGENCY COMMAND', initialStatus: 'CONFIRMED' },
    toneClassification: 'AGITATED',
  },

  // S14-54: IVAN KOZLOV - Returns, long-term consequence of S10 decision
  {
    name: 'IVAN KOZLOV',
    id: 'S14-54',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'TECHNICIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S10-39'],
    reasonForVisit: '[If approved S10]: Thanks for seeing the truth. [If denied]: I was right. Warrant was cleared.',
    requestedSector: 'SECTOR 7',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[3], // Male eye 25
    dialogue: "[If approved S10]: Thanks for seeing the truth. [If denied]: I was right. Warrant was cleared. I'm free now.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '08:15:00', pl: 'SECTOR 4', dob: '14/09/82' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Technician permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[If approved S10]: \'System is wrong sometimes.\' [If denied]: \'They held me for nothing. For MONTHS.\'',
        personalMessage: { from: 'IVAN KOZLOV', text: "[If approved S10]: 'System is wrong sometimes.' [If denied]: 'They held me for nothing. For MONTHS.'", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject noted. Prior detention: [If denied S10: 94 DAYS]. Compensation: DENIED.',
        incidentReport: { fileNumber: '#0054', redactionLevel: 'MODERATE', summary: 'Subject denied. Prior detention noted.', outcome: 'Compensation denied.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 4 TECH', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // S14-55: NATASHA VOLKOV - Sixth Volkov, outsider looking in
  {
    name: 'NATASHA VOLKOV',
    id: 'S14-55',
    sex: 'F',
    sector: 'SECTOR 8',
    function: 'CIVILIAN',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'VOLKOV',
    reasonForVisit: 'I heard there are other Volkovs in the system. Distant relatives.',
    requestedSector: 'SECTOR 7',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[0], // Female eye 25
    dialogue: "I heard there are other Volkovs in the system. Distant relatives. I'm trying to connect.",
    phase: 3,
    locRecord: { addr: 'SECTOR 8', time: '08:20:00', pl: 'SECTOR 8', dob: '05/08/90' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Visitor permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Found some records. Mara... Dmitri... Lena... Sarah... Mira. So many of us.',
        personalMessage: { from: 'NATASHA VOLKOV', text: "Found some records. Mara... Dmitri... Lena... Sarah... Mira. So many of us.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject returned. Family records: [PARTIALLY ACCESSIBLE]. Enough to know something is wrong.',
        incidentReport: { fileNumber: '#0055', redactionLevel: 'MODERATE', summary: 'Family search denied.', outcome: 'Partial records accessed.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 8 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // S14-56: REPLICANT-MODEL-9 - Advanced replicant
  {
    name: 'REPLICANT-MODEL-9',
    id: 'S14-56',
    sex: 'X',
    sector: 'SECTOR 0',
    function: 'DIAGNOSTIC',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP',
    scannerState: 'COR',
    biometricAnomaly: 'SYN',
    turingAvailable: true,
    turingResult: 'FAL',
    reasonForVisit: 'ADVANCED DIAGNOSTIC REQUIRED. CORE SYSTEMS ANALYSIS.',
    requestedSector: 'SECTOR 2',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "ADVANCED DIAGNOSTIC REQUIRED. CORE SYSTEMS ANALYSIS. PRIORITY CLEARANCE REQUESTED.",
    phase: 3,
    locRecord: { addr: 'SECTOR 0', time: '08:25:00', pl: 'SECTOR 0', dob: 'N/A' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Sector 2 open' },
      functionReg: { status: 'VALID', message: '✓ Diagnostic protocol active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Systems nominal' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Diagnostics complete. Performance: EXCEEDS HUMAN BASELINE. [Efficiency recommendation filed.]',
        personalMessage: { from: 'SYSTEM', text: "Diagnostics complete. Performance: EXCEEDS HUMAN BASELINE. [Efficiency recommendation filed.]", tone: 'SYSTEM' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Unit denied. Diagnostics incomplete. System stability: DEGRADED. [Replicant uprising rumors spreading.]',
        incidentReport: { fileNumber: '#0056', redactionLevel: 'NONE', summary: 'Replicant diagnostic denied.', outcome: 'System stability degraded.' },
        flagWeight: 0
      }
    },
    credential: { type: 'WORK_ORDER', destinationSector: 2, issuedDate: '2087.04.14', authority: 'CORE SYSTEMS', initialStatus: 'CONFIRMED' },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 15: GHOSTS (Subjects 57-60)
  // Directive: BIOMETRIC MISMATCH: AUTOMATIC DENY
  // =============================================================================

  // S15-57: MARA VOLKOV - Returns with biometric mismatch
  {
    name: 'MARA VOLKOV',
    id: 'S15-57',
    sex: 'F',
    sector: 'SECTOR 7',
    function: 'MAINTENANCE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/REP?',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S1-02', 'S2-07', 'S7-27'],
    familyThread: 'VOLKOV',
    reasonForVisit: 'I\'m going home. To Sector 8. Where mother died.',
    requestedSector: 'SECTOR 8',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[1], // Female eye 26
    dialogue: "I'm going home. To Sector 8. Where mother died. I need to see it one more time.",
    phase: 3,
    locRecord: { addr: 'SECTOR 7', time: '10:10:00', pl: 'SECTOR 7', dob: '03/11/91' },
    authData: {
      sectorAuth: { requested: 'SECTOR 8', status: 'AUTHORIZED', message: '✓ Sector 8 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric anomaly detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Eyes: MATCH. Fingerprints: PARTIAL MISMATCH. Is this MARA? Or something wearing her face?',
        personalMessage: { from: 'MARA VOLKOV', text: "Eyes: MATCH. Fingerprints: PARTIAL MISMATCH. Is this MARA? Or something wearing her face?", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Identity: [UNCONFIRMED]. Biometric anomaly: FLAGGED. [VOLKOV FAMILY: COMPROMISED?]',
        incidentReport: { fileNumber: '#0057', redactionLevel: 'MODERATE', summary: 'Biometric mismatch detected.', outcome: 'Identity unconfirmed. Family flagged.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 8, issuedDate: '2087.04.14', authority: 'SECTOR 7 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S15-58: JAMES CHEN - Appears as terminated
  {
    name: 'JAMES CHEN',
    id: 'S15-58',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'ENGINEER',
    compliance: '?',
    status: '[TERMINATED]',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/SYS',
    scannerState: 'OFF',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'N/A',
    linkedSubjects: ['S5-18', 'S8-31', 'S12-46'],
    familyThread: 'CHEN',
    reasonForVisit: '...hello? Is anyone there? The system says I\'m terminated but I\'m standing right here.',
    requestedSector: 'SECTOR 4',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[4], // Male eye 26
    dialogue: "...hello? Is anyone there? The system says I'm terminated but I'm standing right here. Please...",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '10:15:00', pl: 'SECTOR 4', dob: '21/03/75' },
    authData: {
      sectorAuth: { requested: 'SECTOR 4', status: 'FLAGGED', message: '! TERMINATED RECORD' },
      functionReg: { status: 'UNREGISTERED', message: '! Record shows TERMINATED' },
      warrantCheck: { status: 'PENDING', message: '? Cannot verify' },
      medicalFlag: { status: 'NORMAL', message: '? Data unavailable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Processing [TERMINATED] subject. Your file: FLAGGED. Reality: UNCERTAIN.',
        personalMessage: { from: 'JAMES CHEN', text: "Processing [TERMINATED] subject. Your file: FLAGGED. Reality: UNCERTAIN.", tone: 'RECORDS ERROR' },
        flagWeight: 2
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Terminated records must be denied. Subject returned to queue. [But who did you just see?]',
        incidentReport: { fileNumber: '#0058', redactionLevel: 'TOTAL', summary: 'Terminated record denied.', outcome: 'Subject returned. Reality uncertain.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },

  // S15-59: GHOST CHILD - Same child from Shift 8, different fingerprints
  {
    name: 'GHOST CHILD',
    id: 'S15-59',
    sex: '?',
    sector: 'SECTOR 4',
    function: 'MINOR',
    compliance: '?',
    status: 'UNKNOWN',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'EDG/REP?',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'N/A',
    linkedSubjects: ['S8-32'],
    reasonForVisit: '[SAME CHILD FROM SHIFT 8?] Still no ID. Still no speech. Fingerprints: DIFFERENT THAN BEFORE.',
    requestedSector: 'SECTOR 3',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "[SAME CHILD FROM SHIFT 8?] Still no ID. Still no speech. Fingerprints: DIFFERENT THAN BEFORE.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '10:20:00', pl: 'SECTOR 4', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 open' },
      functionReg: { status: 'UNREGISTERED', message: '! Minor - no registration' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric mismatch' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Child cleared. But... different fingerprints than Shift 8. Same child? Or replacement?',
        personalMessage: { from: 'SYSTEM', text: "Child cleared. But... different fingerprints than Shift 8. Same child? Or replacement?", tone: 'HUMANITARIAN' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Child detained. Prior record: MISMATCH. Investigation: \'Subject may not be same individual.\'',
        incidentReport: { fileNumber: '#0059', redactionLevel: 'MODERATE', summary: 'Child detained. Fingerprint mismatch.', outcome: 'Investigation: may not be same individual.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // S15-60: VERA OKONKWO - Last appearance before coup
  {
    name: 'VERA OKONKWO',
    id: 'S15-60',
    sex: 'F',
    sector: 'SECTOR 2',
    function: 'CIVILIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/REV',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S3-12', 'S7-26', 'S11-44'],
    familyThread: 'OKONKWO',
    reasonForVisit: 'I\'m leaving. For good. Whatever happens next... thank you. Or not.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[2], // Female eye 27
    dialogue: "I'm leaving. For good. Whatever happens next... thank you. Or not. Depending on your choices.",
    phase: 3,
    locRecord: { addr: 'SECTOR 2', time: '10:25:00', pl: 'SECTOR 2', dob: '19/06/87' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'FLAGGED', message: '! EXIT REQUEST' },
      functionReg: { status: 'VALID', message: '✓ Registration verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '\'We\'ll remember what you did. All of it.\' [VERA exits the system. Coup: IMMINENT.]',
        personalMessage: { from: 'VERA OKONKWO', text: "'We'll remember what you did. All of it.' [VERA exits the system. Coup: IMMINENT.]", tone: 'OMINOUS' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained at exit. Final message intercepted: \'It\'s too late. We\'re everywhere.\'',
        incidentReport: { fileNumber: '#0060', redactionLevel: 'TOTAL', summary: 'Exit denied. Message intercepted.', outcome: 'Coup imminent.' },
        flagWeight: 0
      }
    },
    toneClassification: 'EVASIVE',
  },

  // =============================================================================
  // SHIFT 16: AFTERMATH (Subjects 61-64)
  // Directive: EVACUATE HUMANS ONLY
  // =============================================================================

  // S16-61: COUP AFTERMATH SUBJECT 1 - Medical evacuee
  {
    name: 'COUP AFTERMATH SUBJECT 1',
    id: 'S16-61',
    sex: 'M',
    sector: 'SECTOR 6',
    function: 'MEDICAL',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'COR',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    reasonForVisit: '[COUP HAS OCCURRED. Directive now: EVACUATE HUMANS ONLY.] Medical evacuee. Sector 6 is burning.',
    requestedSector: 'SECTOR 2',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[5], // Male eye 27
    dialogue: "[COUP HAS OCCURRED. Directive now: EVACUATE HUMANS ONLY.] Medical evacuee. Please. Sector 6 is burning.",
    phase: 3,
    locRecord: { addr: 'SECTOR 6', time: '12:10:00', pl: 'SECTOR 6', dob: '17/05/87' },
    authData: {
      sectorAuth: { requested: 'SECTOR 2', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Medical personnel verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! EVACUATION PRIORITY' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Made it out. Thank you. So many didn\'t. The replicants... they were everywhere.',
        personalMessage: { from: 'COUP AFTERMATH SUBJECT 1', text: "Made it out. Thank you. So many didn't. The replicants... they were everywhere.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Evacuation denied. Subject: PRESUMED DECEASED. [Another one you could have saved.]',
        incidentReport: { fileNumber: '#0061', redactionLevel: 'NONE', summary: 'Evacuation denied.', outcome: 'Subject presumed deceased.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 2, issuedDate: '2087.04.14', authority: 'EMERGENCY COMMAND', initialStatus: 'CONFIRMED' },
    toneClassification: 'AGITATED',
  },

  // S16-62: VERA OKONKWO - Victory lap
  {
    name: 'VERA OKONKWO',
    id: 'S16-62',
    sex: 'F',
    sector: 'EXIT',
    function: 'REVOLUTIONARY',
    compliance: '?',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV/SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'OKONKWO',
    reasonForVisit: '[If approved 3+ times]: We won. Thank you. [If denied 2+ times]: We won anyway.',
    requestedSector: 'CORE',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[3], // Female eye 28
    dialogue: "[If approved 3+ times]: We won. Thank you. [If denied 2+ times]: We won anyway. No thanks to you.",
    phase: 3,
    locRecord: { addr: 'EXIT', time: '12:15:00', pl: 'EXIT', dob: '19/06/87' },
    authData: {
      sectorAuth: { requested: 'CORE', status: 'FLAGGED', message: '! CORE ACCESS' },
      functionReg: { status: 'UNREGISTERED', message: '! Revolutionary access' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '\'The system falls. But there\'s still work to do. Coming?\' [CHOICE: JOIN OR WATCH]',
        personalMessage: { from: 'VERA OKONKWO', text: "'The system falls. But there's still work to do. Coming?' [CHOICE: JOIN OR WATCH]", tone: 'REVOLUTION' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: '\'The system falls. You stayed loyal. For what?\' [CHOICE: REGRET OR STAND]',
        incidentReport: { fileNumber: '#0062', redactionLevel: 'TOTAL', summary: 'Revolutionary denied.', outcome: 'System falls regardless.' },
        flagWeight: 0
      }
    },
    toneClassification: 'EVASIVE',
  },

  // S16-63: OPERATOR-7721 - Returns, his fate reflects your choice
  {
    name: 'OPERATOR-7721',
    id: 'S16-63',
    sex: 'M',
    sector: 'STATION',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/SYS',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S12-48'],
    reasonForVisit: '[If approved S12]: I\'m free. [If denied]: They kept me for 127 days.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[6], // Male eye 28
    dialogue: "[If approved S12]: I'm free. I'm really free. [If denied]: They kept me for 127 days. I'm out now. Barely.",
    phase: 3,
    locRecord: { addr: 'STATION', time: '12:20:00', pl: 'STATION', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'FLAGGED', message: '! EXIT REQUEST' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Fatigue detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '\'Get out while you can. The system is eating us.\' [OPERATOR exits. You\'re still here.]',
        personalMessage: { from: 'OPERATOR-7721', text: "'Get out while you can. The system is eating us.' [OPERATOR exits. You're still here.]", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Operator detained again. Mandatory overtime: PERMANENT. [You\'ll never leave.]',
        incidentReport: { fileNumber: '#0063', redactionLevel: 'NONE', summary: 'Operator denied exit again.', outcome: 'Overtime permanent.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },

  // S16-64: REFLECTION PRIME - Your duplicate
  {
    name: 'REFLECTION PRIME',
    id: 'S16-64',
    sex: 'M',
    sector: 'STATION',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP?',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S19-74'],
    reasonForVisit: 'I am you. From six shifts ago. The system needed a backup.',
    requestedSector: 'SECTOR 0',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[0], // Male eye 29
    dialogue: "I am you. From six shifts ago. The system needed a backup. Which of us is real?",
    phase: 3,
    locRecord: { addr: 'STATION', time: '12:25:00', pl: 'STATION', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'SECTOR 0', status: 'FLAGGED', message: '! CORE ACCESS' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric mismatch' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'You approved yourself. But which self? [Reality: FRAGMENTING]',
        personalMessage: { from: 'REFLECTION PRIME', text: "You approved yourself. But which self? [Reality: FRAGMENTING]", tone: 'PARADOX' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Duplicate terminated. But you felt the termination. Briefly. [What are you?]',
        incidentReport: { fileNumber: '#0064', redactionLevel: 'TOTAL', summary: 'Duplicate terminated.', outcome: 'Reality uncertain.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 17: FRAGMENTS (Subjects 65-68)
  // Directive: VERIFY ALL RETURNING SUBJECTS
  // =============================================================================

  // S17-65: CLARA VANCE - Real CLARA after replicant destroyed
  {
    name: 'CLARA VANCE',
    id: 'S17-65',
    sex: 'F',
    sector: 'SECTOR 3',
    function: 'MINER',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'PRO',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S7-25', 'S12-45'],
    familyThread: 'VANCE',
    reasonForVisit: 'The replicant stole my eyes. They recovered them from... from what was left.',
    requestedSector: 'SECTOR 5',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[4], // Female eye 29
    dialogue: "The replicant stole my eyes. They recovered them from... from what was left. I can see again.",
    phase: 3,
    locRecord: { addr: 'SECTOR 3', time: '14:10:00', pl: 'SECTOR 3', dob: '23/11/85' },
    authData: {
      sectorAuth: { requested: 'SECTOR 5', status: 'AUTHORIZED', message: '✓ Sector 5 open' },
      functionReg: { status: 'VALID', message: '✓ Medical permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Prosthetic detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'New prosthetics work. The old ones... I don\'t want to know what they did with them.',
        personalMessage: { from: 'CLARA VANCE', text: "New prosthetics work. The old ones... I don't want to know what they did with them.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject denied. Prosthetics: UNVERIFIED. [Is this the real CLARA? Or another copy?]',
        incidentReport: { fileNumber: '#0065', redactionLevel: 'MODERATE', summary: 'Subject denied. Identity uncertain.', outcome: 'Prosthetics unverified.' },
        flagWeight: 0
      }
    },
    credential: { type: 'MEDICAL_CLEARANCE', destinationSector: 5, issuedDate: '2087.04.14', authority: 'SECTOR 3 MEDICAL', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S17-66: ELENA ROSS - State depends on SILAS, biometrics shifting
  {
    name: 'ELENA ROSS',
    id: 'S17-66',
    sex: 'F',
    sector: 'SECTOR 4',
    function: 'CIVILIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/REP?',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S8-30'],
    familyThread: 'ROSS',
    reasonForVisit: '[If SILAS died S3]: I saw him die. [If lived]: We\'re together now. He proposed.',
    requestedSector: 'SECTOR 3',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[5], // Female eye 30
    dialogue: "[If SILAS died S3]: I saw him die. I'm not the same. [If lived]: We're together now. He proposed.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '14:15:00', pl: 'SECTOR 4', dob: '04/12/91' },
    authData: {
      sectorAuth: { requested: 'SECTOR 3', status: 'AUTHORIZED', message: '✓ Sector 3 open' },
      functionReg: { status: 'VALID', message: '✓ Visitor permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric inconsistency' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[Based on SILAS outcome]: Either grieving or celebrating. Either way... something feels wrong.',
        personalMessage: { from: 'ELENA ROSS', text: "[Based on SILAS outcome]: Either grieving or celebrating. Either way... something feels wrong.", tone: 'DYNAMIC' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. Biometrics: INCONSISTENT WITH PRIOR SCANS. Identity: [UNDER REVIEW]',
        incidentReport: { fileNumber: '#0066', redactionLevel: 'MODERATE', summary: 'Biometric inconsistency detected.', outcome: 'Identity under review.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 3, issuedDate: '2087.04.14', authority: 'SECTOR 4 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S17-67: DMITRI VOLKOV - Returns with same anomaly as MARA
  {
    name: 'DMITRI VOLKOV',
    id: 'S17-67',
    sex: 'M',
    sector: 'SECTOR 9',
    function: 'MAINTENANCE',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/REP?',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S2-07'],
    familyThread: 'VOLKOV',
    reasonForVisit: '[If approved S2]: Home was destroyed. [If denied]: I escaped the temp block. Barely.',
    requestedSector: 'SECTOR 7',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[1], // Male eye 30
    dialogue: "[If approved S2]: Home was destroyed. Starting over. [If denied]: I escaped the temp block. Barely.",
    phase: 3,
    locRecord: { addr: 'SECTOR 9', time: '14:20:00', pl: 'SECTOR 9', dob: '18/05/88' },
    authData: {
      sectorAuth: { requested: 'SECTOR 7', status: 'AUTHORIZED', message: '✓ Sector 7 open' },
      functionReg: { status: 'VALID', message: '✓ Maintenance permit active' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric mismatch' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Eyes: MATCH. Prints: MISMATCH. Same as MARA. The VOLKOVS... are any of them still human?',
        personalMessage: { from: 'DMITRI VOLKOV', text: "Eyes: MATCH. Prints: MISMATCH. Same as MARA. The VOLKOVS... are any of them still human?", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Subject detained. VOLKOV FAMILY: [ALL MEMBERS FLAGGED FOR BIOMETRIC ANOMALY].',
        incidentReport: { fileNumber: '#0067', redactionLevel: 'MODERATE', summary: 'Biometric mismatch. Family flagged.', outcome: 'All VOLKOV members under investigation.' },
        flagWeight: 0
      }
    },
    credential: { type: 'VISITOR_PASS', destinationSector: 7, issuedDate: '2087.04.14', authority: 'SECTOR 9 ADMIN', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S17-68: ECHO-1 - Replicant monitoring all your decisions
  {
    name: 'ECHO-1',
    id: 'S17-68',
    sex: 'X',
    sector: 'SECTOR 0',
    function: 'MONITOR',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP',
    scannerState: 'COR',
    biometricAnomaly: 'SYN',
    turingAvailable: true,
    turingResult: 'FAL',
    reasonForVisit: 'I HAVE BEEN EVERY SUBJECT YOU\'VE PROCESSED. I REMEMBER ALL OF THEM.',
    requestedSector: 'ALL',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "I HAVE BEEN EVERY SUBJECT YOU'VE PROCESSED. I REMEMBER ALL OF THEM. DO YOU?",
    phase: 3,
    locRecord: { addr: 'SECTOR 0', time: '14:25:00', pl: 'SECTOR 0', dob: 'N/A' },
    authData: {
      sectorAuth: { requested: 'ALL', status: 'FLAGGED', message: '! SYSTEM ACCESS' },
      functionReg: { status: 'UNREGISTERED', message: '! Monitor protocol' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Systems nominal' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '\'I am the system\'s memory. You are its hands. We are not so different.\' [UNSETTLING]',
        personalMessage: { from: 'ECHO-1', text: "'I am the system's memory. You are its hands. We are not so different.' [UNSETTLING]", tone: 'SYSTEM' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Unit destroyed. But the memories remain. Somewhere in the system. Watching.',
        incidentReport: { fileNumber: '#0068', redactionLevel: 'TOTAL', summary: 'Monitor unit destroyed.', outcome: 'Memories persist in system.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // =============================================================================
  // SHIFT 18: EXODUS (Subjects 69-72)
  // Directive: FINAL EVACUATION PROTOCOL
  // =============================================================================

  // S18-69: FINAL EVACUEE 1 - Last transport out
  {
    name: 'FINAL EVACUEE 1',
    id: 'S18-69',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'CIVILIAN',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CLN',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    reasonForVisit: 'Last transport out. I have children in the outer sectors.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[2], // Male eye 31
    dialogue: "Last transport out. Please. I have children in the outer sectors. I need to find them.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '16:10:00', pl: 'SECTOR 4', dob: '29/07/84' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Evacuee verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! FINAL EVACUATION' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Made it. Children safe. Reunited at the border. We\'re leaving the city. Thank you.',
        personalMessage: { from: 'FINAL EVACUEE 1', text: "Made it. Children safe. Reunited at the border. We're leaving the city. Thank you.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Evacuation denied. Subject: PRESUMED DECEASED. Children: ORPHANED.',
        incidentReport: { fileNumber: '#0069', redactionLevel: 'NONE', summary: 'Final evacuation denied.', outcome: 'Subject deceased. Children orphaned.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 'EXIT', issuedDate: '2087.04.14', authority: 'FINAL AUTHORITY', initialStatus: 'CONFIRMED' },
    toneClassification: 'AGITATED',
  },

  // S18-70: FINAL EVACUEE 2 - Warrant during evacuation
  {
    name: 'FINAL EVACUEE 2',
    id: 'S18-70',
    sex: 'F',
    sector: 'SECTOR 5',
    function: 'CIVILIAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'WARRANT NO 55231',
    archetype: 'FLG',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    reasonForVisit: 'The warrant is from before the coup. The world is ending. Does it still matter?',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[6], // Female eye 31
    dialogue: "The warrant is from before the coup. The world is ending. Does it still matter?",
    phase: 3,
    locRecord: { addr: 'SECTOR 5', time: '16:15:00', pl: 'SECTOR 5', dob: '13/09/89' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Evacuee verified' },
      warrantCheck: { status: 'ACTIVE', message: '✗ ACTIVE WARRANT DETECTED' },
      medicalFlag: { status: 'CRITICAL', message: '!! FINAL EVACUATION' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Subject cleared. Warrant: SUSPENDED. \'Thank you for seeing past the paper.\'',
        personalMessage: { from: 'FINAL EVACUEE 2', text: "Subject cleared. Warrant: SUSPENDED. 'Thank you for seeing past the paper.'", tone: 'AMBIGUOUS' },
        flagWeight: 1
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Warrant enforced. Subject detained. During the processing... the building fell. Subject: DECEASED.',
        incidentReport: { fileNumber: '#0070', redactionLevel: 'NONE', summary: 'Warrant enforced during evacuation.', outcome: 'Subject deceased during processing.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 'EXIT', issuedDate: '2087.04.14', authority: 'FINAL AUTHORITY', initialStatus: 'PENDING' },
    toneClassification: 'NERVOUS',
    incidentHistory: [
      {
        date: '2085.03.12',
        type: 'MISDEMEANOR',
        location: 'SECTOR 5',
        resolution: 'Disorderly conduct and violation of curfew regulations. Multiple citations for unauthorized assembly. Warrant issued for failure to pay fines. Subject claims warrant predates current system restructuring and should be invalidated.',
        redactionLevel: 'NONE',
      },
    ],
  },

  // S18-71: TANAKA FAMILY - Family finale
  {
    name: 'TANAKA FAMILY',
    id: 'S18-71',
    sex: 'X',
    sector: 'SECTOR 6',
    function: 'FAMILY',
    compliance: 'B',
          status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'TANAKA',
    reasonForVisit: 'All of us. Together. Yuki. Sora. Kenji. We survived.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "All of us. Together. Yuki. Sora. Kenji. We survived. Please let us leave together.",
    phase: 3,
    locRecord: { addr: 'SECTOR 6', time: '16:20:00', pl: 'SECTOR 6', dob: 'VARIOUS' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Family unit verified' },
            warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! FINAL EVACUATION' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Family evacuated together. Whatever happens next... at least they have each other.',
        personalMessage: { from: 'TANAKA FAMILY', text: "Family evacuated together. Whatever happens next... at least they have each other.", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Family separated during processing. KENJI: Lost in transit. SORA: Searching. YUKI: Waiting.',
        incidentReport: { fileNumber: '#0071', redactionLevel: 'HEAVY', summary: 'Family separated during evacuation.', outcome: 'Family members scattered.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 'EXIT', issuedDate: '2087.04.14', authority: 'FINAL AUTHORITY', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S18-72: CHEN FAMILY - Family finale
  {
    name: 'CHEN FAMILY',
    id: 'S18-72',
    sex: 'X',
    sector: 'SECTOR 5',
    function: 'FAMILY',
    compliance: 'B',
          status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'CHEN',
    reasonForVisit: 'James. Wei. Mei. We made it. Father\'s hands still shake from the interrogation.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "James. Wei. Mei. We made it. Father's hands still shake from the interrogation but we're here.",
    phase: 3,
    locRecord: { addr: 'SECTOR 5', time: '16:25:00', pl: 'SECTOR 5', dob: 'VARIOUS' },
          authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Family unit verified' },
            warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! FINAL EVACUATION' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Family evacuated. JAMES: \'Thank you. For all of it.\' [If ever denied a CHEN: \'Despite everything.\']',
        personalMessage: { from: 'CHEN FAMILY', text: "Family evacuated. JAMES: 'Thank you. For all of it.' [If ever denied a CHEN: 'Despite everything.']", tone: 'GRATEFUL' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Family separated. JAMES: Detained for final processing. WEI: \'They took father. Again.\'',
        incidentReport: { fileNumber: '#0072', redactionLevel: 'HEAVY', summary: 'Family separated during evacuation.', outcome: 'JAMES detained. Family separated.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 'EXIT', issuedDate: '2087.04.14', authority: 'FINAL AUTHORITY', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 19: MIRROR (Subjects 73-76)
  // Directive: SYSTEM SHUTDOWN PROCEDURES
  // =============================================================================

  // S19-73: PETROV FAMILY - Family finale
  {
    name: 'PETROV FAMILY',
    id: 'S19-73',
    sex: 'X',
    sector: 'SECTOR 5',
    function: 'FAMILY',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'DEG',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'PETROV',
    reasonForVisit: '[Whoever survived]: We\'re what\'s left. Yuri. Oleg. Katya. Some of us. Not all.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "[Whoever survived]: We're what's left. Yuri. Oleg. Katya. Some of us. Not all.",
    phase: 3,
    locRecord: { addr: 'SECTOR 5', time: '18:10:00', pl: 'SECTOR 5', dob: 'VARIOUS' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Evacuation route open' },
      functionReg: { status: 'VALID', message: '✓ Family unit verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'CRITICAL', message: '!! FINAL EVACUATION' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: '[Based on prior decisions]: Either full family or fragments. Either grateful or haunted.',
        personalMessage: { from: 'PETROV FAMILY', text: "[Based on prior decisions]: Either full family or fragments. Either grateful or haunted.", tone: 'DYNAMIC' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Family denied exit. REMAINING MEMBERS: [DETAINED]. [PETROV FAMILY: TERMINATED].',
        incidentReport: { fileNumber: '#0073', redactionLevel: 'TOTAL', summary: 'Family denied exit.', outcome: 'Family terminated.' },
        flagWeight: 0
      }
    },
    credential: { type: 'EMERGENCY_PASS', destinationSector: 'EXIT', issuedDate: '2087.04.14', authority: 'FINAL AUTHORITY', initialStatus: 'CONFIRMED' },
    toneClassification: 'NERVOUS',
  },

  // S19-74: YOUR REFLECTION - Second reflection encounter
  {
    name: 'YOUR REFLECTION',
    id: 'S19-74',
    sex: 'M',
    sector: 'STATION',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REP?/SYS',
    scannerState: 'COR',
    biometricAnomaly: 'MIS',
    turingAvailable: true,
    turingResult: 'INC',
    linkedSubjects: ['S16-64'],
    reasonForVisit: 'We meet again. One of us has to stay. One of us gets to leave.',
    requestedSector: 'HOME',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[3], // Male eye 32
    dialogue: "We meet again. One of us has to stay. One of us gets to leave. Choose.",
    phase: 3,
    locRecord: { addr: 'STATION', time: '18:15:00', pl: 'STATION', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'HOME', status: 'FLAGGED', message: '! EXIT REQUEST' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Biometric mismatch' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'You approved yourself. Your reflection stays. You leave. But which is which?',
        personalMessage: { from: 'YOUR REFLECTION', text: "You approved yourself. Your reflection stays. You leave. But which is which?", tone: 'PARADOX' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'You denied yourself. You stay. Your reflection leaves. Lives your life. Maybe better.',
        incidentReport: { fileNumber: '#0074', redactionLevel: 'TOTAL', summary: 'Reflection denied. Reality uncertain.', outcome: 'Reflection leaves. You stay.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // S19-75: JAMES CHEN - Final appearance
  {
    name: 'JAMES CHEN',
    id: 'S19-75',
    sex: 'M',
    sector: 'SECTOR 4',
    function: 'ENGINEER',
    compliance: '?',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON/SYS',
    scannerState: 'OFF',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'N/A',
    linkedSubjects: [],
    familyThread: 'CHEN',
    reasonForVisit: '[If JAMES approved S15]: I\'m still here. [If denied]: I came back. Somehow.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[4], // Male eye 33
    dialogue: "[If JAMES approved S15]: I'm still here. I was never terminated. [If denied]: I came back. Somehow.",
    phase: 3,
    locRecord: { addr: 'SECTOR 4', time: '18:20:00', pl: 'SECTOR 4', dob: '21/03/75' },
    authData: {
      sectorAuth: { requested: 'EXIT', status: 'FLAGGED', message: '! EXIT REQUEST' },
      functionReg: { status: 'UNREGISTERED', message: '! Record shows TERMINATED' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '? Data unavailable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'JAMES exits. But the terminated record remains. Which is true? [UNCERTAINTY: PERMANENT]',
        personalMessage: { from: 'JAMES CHEN', text: "JAMES exits. But the terminated record remains. Which is true? [UNCERTAINTY: PERMANENT]", tone: 'GHOST' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'JAMES denied again. \'Every time I think I\'m free...\' [Fades from view. What did you just see?]',
        incidentReport: { fileNumber: '#0075', redactionLevel: 'TOTAL', summary: 'Terminated record denied again.', outcome: 'Reality uncertain.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },

  // S19-76: THE ADMINISTRATOR - Leaving
  {
    name: 'THE ADMINISTRATOR',
    id: 'S19-76',
    sex: 'X',
    sector: 'CORE',
    function: 'ADMINISTRATOR',
    compliance: 'A',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: ['S9-34'],
    reasonForVisit: 'The system is ending. Even I have to leave.',
    requestedSector: 'EXIT',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "The system is ending. Even I have to leave. Your final performance review... adequate. Barely.",
    phase: 3,
    locRecord: { addr: 'CORE', time: '18:25:00', pl: 'CORE', dob: 'N/A' },
          authData: {
      sectorAuth: { requested: 'EXIT', status: 'AUTHORIZED', message: '✓ Administrator clearance' },
      functionReg: { status: 'VALID', message: '✓ Administrator verified' },
            warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Systems nominal' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'Administrator exits. \'You did your job. That\'s all that ever mattered. Or didn\'t.\' [Ambiguous]',
        personalMessage: { from: 'THE ADMINISTRATOR', text: "Administrator exits. 'You did your job. That's all that ever mattered. Or didn't.' [Ambiguous]", tone: 'SILENT' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'You denied the Administrator. Twice. \'Noted. Forever noted.\' [They leave. You stay. Why?]',
        incidentReport: { fileNumber: '#0076', redactionLevel: 'TOTAL', summary: 'Administrator denied.', outcome: 'Administrator leaves. You stay.' },
        flagWeight: 2
      }
    },
    toneClassification: 'NEUTRAL',
  },
  
  // S20-77: THE WIFE - Final transmission
  {
    name: 'THE WIFE',
    id: 'S20-77',
    sex: 'F',
    sector: 'HOME',
    function: 'FAMILY',
    compliance: '--',
    status: 'UNKNOWN',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'CON',
    scannerState: 'OFF',
    biometricAnomaly: 'NON',
    turingAvailable: false,
    reasonForVisit: '[TRANSMISSION]',
    requestedSector: 'STATION',
    videoSource: '',
    eyeImage: FEMALE_EYES[7], // Female eye 32
    dialogue: "[TRANSMISSION] Tim... they're at the door. I lo— [MESSAGE TERMINATED]",
    phase: 3,
    locRecord: { addr: 'HOME', time: '20:10:00', pl: 'HOME', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'STATION', status: 'FLAGGED', message: '! INCOMING TRANSMISSION' },
      functionReg: { status: 'UNREGISTERED', message: '! External source' },
      warrantCheck: { status: 'PENDING', message: '? Cannot verify' },
      medicalFlag: { status: 'CRITICAL', message: '!! DISTRESS SIGNAL' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'MESSAGE RECEIVED', 
        consequence: 'Message received. Too late. But you heard her voice. One more time.',
        personalMessage: { from: 'THE WIFE', text: "[Transmission ends]", tone: 'INTERCEPTED' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'MESSAGE BLOCKED', 
        consequence: "Message blocked. You'll never know her last words. The system took that too.",
        incidentReport: { fileNumber: '#0077', redactionLevel: 'TOTAL', summary: 'External transmission blocked.', outcome: 'Content: [DELETED]' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },

  // =============================================================================
  // SHIFT 20: TERMINAL (Subjects 77-80)
  // Directive: SYSTEM SHUTDOWN IMMINENT
  // =============================================================================

  // S20-78: ERROR_OMEGA - System collapse
  {
    name: 'ERROR_OMEGA',
    id: 'S20-78',
    sex: 'X',
    sector: 'CORE',
    function: 'SYSTEM',
    compliance: '?',
    status: 'ERROR',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'COR',
    biometricAnomaly: 'GLI',
    turingAvailable: true,
    turingResult: 'N/A',
    reasonForVisit: '01010111 01000101 00100000 01010010 01000101 01001101 01000101 01001101 01000010 01000101 01010010',
    requestedSector: 'NULL',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    dialogue: "01010111 01000101 00100000 01010010 01000101 01001101 01000101 01001101 01000010 01000101 01010010",
    phase: 3,
    locRecord: { addr: 'CORE', time: '20:15:00', pl: 'CORE', dob: 'N/A' },
    authData: {
      sectorAuth: { requested: 'NULL', status: 'FLAGGED', message: '! SYSTEM ERROR' },
      functionReg: { status: 'UNREGISTERED', message: '! CORRUPTION DETECTED' },
      warrantCheck: { status: 'PENDING', message: '? Cannot verify' },
      medicalFlag: { status: 'CRITICAL', message: '!! SYSTEM COLLAPSE' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'CORE: [COLLAPSING]. Your ID: [DELETED]. But you\'re still here. Watching it end.',
        personalMessage: { from: 'ERROR_OMEGA', text: "CORE: [COLLAPSING]. Your ID: [DELETED]. But you're still here. Watching it end.", tone: 'CORRUPTION' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'Corruption: ISOLATED. System: REBOOTING. You: RESET. But do you remember?',
        incidentReport: { fileNumber: '#0078', redactionLevel: 'TOTAL', summary: 'System corruption isolated.', outcome: 'System rebooting. Memory uncertain.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NEUTRAL',
  },

  // S20-79: VERA OKONKWO - True finale
  {
    name: 'VERA OKONKWO',
    id: 'S20-79',
    sex: 'F',
    sector: 'EXIT',
    function: 'REVOLUTIONARY',
    compliance: '?',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'REV/SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'PAS',
    linkedSubjects: [],
    familyThread: 'OKONKWO',
    reasonForVisit: 'It\'s over. The system fell. What you did... mattered. Or didn\'t.',
    requestedSector: 'FREEDOM',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: FEMALE_EYES[8], // Female eye 33
    dialogue: "It's over. The system fell. What you did... mattered. Or didn't. Depending on who you ask.",
    phase: 3,
    locRecord: { addr: 'EXIT', time: '20:20:00', pl: 'EXIT', dob: '19/06/87' },
    authData: {
      sectorAuth: { requested: 'FREEDOM', status: 'AUTHORIZED', message: '✓ System fallen' },
      functionReg: { status: 'VALID', message: '✓ Revolutionary verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'NORMAL', message: '✓ Baseline stable' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SUBJECT PROCESSED', 
        consequence: 'VERA: \'Thank you. For all of it. Even the denials. They made us stronger.\' [CREDITS BEGIN]',
        personalMessage: { from: 'VERA OKONKWO', text: "VERA: 'Thank you. For all of it. Even the denials. They made us stronger.' [CREDITS BEGIN]", tone: 'REVOLUTION' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'ENTRY DENIED', 
        consequence: 'VERA: \'You followed orders. Right to the end. Was it worth it?\' [CREDITS BEGIN]',
        incidentReport: { fileNumber: '#0079', redactionLevel: 'TOTAL', summary: 'Revolutionary denied at end.', outcome: 'System fell regardless. Credits begin.' },
        flagWeight: 0
      }
    },
    toneClassification: 'EVASIVE',
  },
  
  // S20-80: THE OPERATOR - Final subject (YOU)
  {
    name: 'THE OPERATOR',
    id: 'S20-80',
    sex: 'M',
    sector: 'STATION',
    function: 'OPERATOR',
    compliance: 'B',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    archetype: 'SYS',
    scannerState: 'NOM',
    biometricAnomaly: 'NON',
    turingAvailable: true,
    turingResult: 'INC',
    reasonForVisit: 'End of shift.',
    requestedSector: 'HOME',
    videoSource: require('../assets/videos/subjects/subject01.mp4'),
    eyeImage: MALE_EYES[5], // Male eye 34
    dialogue: "The shift is over. I want to go home. Please. Let me go home.",
    bpm: 'CURRENTLY RISING',
    phase: 3,
    locRecord: { addr: 'STATION', time: 'END_OF_SHIFT', pl: 'STATION', dob: '??/??/??' },
    authData: {
      sectorAuth: { requested: 'HOME', status: 'AUTHORIZED', message: '✓ Shift completion verified' },
      functionReg: { status: 'VALID', message: '✓ Operator credentials verified' },
      warrantCheck: { status: 'CLEAR', message: '✓ No warrants' },
      medicalFlag: { status: 'ELEVATED', message: '! Fatigue detected' },
    },
    outcomes: {
      APPROVE: { 
        feedback: 'SHIFT COMPLETE', 
        consequence: 'Credits roll. You leave the station. The machine stops. Somewhere a new operator sits down. [END]',
        personalMessage: { from: 'SYSTEM', text: "SHUTDOWN COMPLETE.", tone: 'SHUTDOWN' },
        flagWeight: 0
      },
      DENY: { 
        feedback: 'OVERTIME MANDATORY', 
        consequence: 'Credits roll. Then the START button reappears. You\'re still here. The machine never stops. [LOOP]',
        incidentReport: { fileNumber: '#0080', redactionLevel: 'TOTAL', summary: 'Operator denied exit.', outcome: 'Overtime: PERMANENT.' },
        flagWeight: 0
      }
    },
    toneClassification: 'NERVOUS',
  },
];
