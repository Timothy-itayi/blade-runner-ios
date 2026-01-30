// =============================================================================
// SUBJECT DATA - Procedural Portrait System
// Year 3184 - Depot Security Lockdown
// AMBER Security - Infiltration Prevention
// =============================================================================

// =============================================================================
// INTERFACES
// =============================================================================

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
  image?: any;
}

export interface NewsReport {
  headline: string;
  subheadline?: string;
  body: string;
  source: string;
  tone: 'NEUTRAL' | 'ALARMING' | 'POSITIVE' | 'OMINOUS' | 'TRAGIC';
  audioFile?: any;
  image?: any;
  type?: 'NEWS' | 'MEMO' | 'INTERCEPT';
}

export interface Outcome {
  feedback: string;
  consequence: string;
  incidentReport?: IncidentReport;
  personalMessage?: PersonalMessage;
  newsReport?: NewsReport;
  flagWeight?: number;
}

// Subject types
export type SubjectType = 'HUMAN' | 'HUMAN_CYBORG' | 'ROBOT_CYBORG' | 'REPLICANT' | 'PLASTIC_SURGERY' | 'AMPUTEE';

// Hierarchy tiers
export type HierarchyTier = 'LOWER' | 'MIDDLE' | 'UPPER' | 'VIP';

// Personality types
export type PersonalityType =
  | 'NERVOUS'
  | 'CONFIDENT'
  | 'DECEPTIVE'
  | 'DESPERATE'
  | 'ARROGANT'
  | 'VULNERABLE'
  | 'CONFUSED'
  | 'PROFESSIONAL';

// Interrogation tones
export type InterrogationTone = 'soft' | 'firm' | 'harsh';
export type InterrogationResponse = string | Partial<Record<InterrogationTone, string>>;

export interface PersonalityTraits {
  primaryType: PersonalityType;
  secondaryType?: PersonalityType;
  trustworthiness: number;
  cooperativeness: number;
  emotionalStability: number;
}

export type VerificationRecord = {
  type: 'INCIDENT' | 'WARRANT' | 'TRANSIT';
  date: string;
  referenceId: string;
  source: string;
  summary: string;
  contradiction: string;
  question?: string;
};

export interface SubjectData {
  // Core Identity
  name: string;
  id: string;
  sex: 'M' | 'F' | 'X';
  
  // Classification
  subjectType: SubjectType;
  hierarchyTier: HierarchyTier;
  originPlanet: string;
  
  // Status
  compliance: string;
  status: 'ACTIVE' | 'PROVISIONAL' | 'RESTRICTED' | 'TERMINATED';
  
  // Flags
  incidents: number;
  warrants: string;
  restrictions?: string[];
  
  // Request
  reasonForVisit: string;
  destinationPlanet: string;
  
  // Assets (all optional - procedural portrait is default)
  videoSource?: any;
  eyeVideo?: any;
  eyeImage?: any;
  profilePic?: any;
  videoStartTime?: number;
  videoEndTime?: number;
  
  // Procedural Portrait Mode (default: true for new subjects)
  useProceduralPortrait?: boolean;
  
  // BPM and dialogue
  bpm?: string | number;
  dialogue?: string;
  
  // BPM Behavioral Tells
  bpmTells?: {
    type: 'CONTRADICTION' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | 'NORMAL';
    description: string;
    baseElevation?: number;
    isGoodLiar?: boolean;
    isGenuinelyStressed?: boolean;
  };
  
  // Personality
  personalityTraits?: PersonalityTraits;
  personality?: PersonalityTraits;

  // Communication
  communicationStyle?: import('./subjectGreetings').CommunicationStyle;
  credentialBehavior?: import('./subjectGreetings').CredentialBehavior;
  greetingText?: string;
  credentialType?: import('./credentialTypes').CredentialType;
  credentialDetails?: import('./credentialTypes').CredentialDetails | import('./credentialTypes').CredentialDetails[];

  // Character brief
  characterBrief?: {
    personality: string;
    background: string;
    motivation: string;
    tells: string[];
  };
  
  // Interrogation
  interrogationResponses?: {
    question1?: string;
    question2?: string;
    question3?: string;
    responses: Record<string, InterrogationResponse>;
  };
  
  // Dossier anomalies
  dossierAnomaly?: {
    type: 'MISMATCH' | 'MISSING_INFO' | 'CORRUPTED' | 'SURGERY' | 'NONE';
    explanation?: string;
    suspicious?: boolean;
  };

  // Verification record
  verificationRecord?: VerificationRecord;
  
  // Bio scan data
  bioScanData?: {
    audioFile?: any;
    biologicalType?: 'HUMAN' | 'HUMAN_CYBORG' | 'ROBOT_CYBORG' | 'REPLICANT' | 'PLASTIC_SURGERY' | 'AMPUTEE';
    race?: string;
    fingerprintType?: 'HUMAN' | 'CYBORG' | 'REPLICANT' | 'AMPUTEE';
    bioStructure?: 'STANDARD' | 'ENHANCED' | 'SYNTHETIC' | 'MODIFIED';
    geneticPurity?: number;
    augmentationLevel?: 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR';
  };
  
  // Biometric data
  biometricData: {
    fingerprintMatch: boolean;
    retinalMatch: boolean;
    warrantStatus: 'CLEAR' | 'ACTIVE' | 'PENDING';
    criminalHistory: string[];
    anomalyDetected: boolean;
    anomalyType?: 'CYBORG' | 'REPLICANT' | 'SURGERY' | 'AMPUTEE' | 'NONE';
  };
  
  // ID Scanner data
  idData: {
    name: string;
    idCode: string;
    originPlanet: string;
    statedPurpose: string;
    status: 'ACTIVE' | 'PROVISIONAL' | 'RESTRICTED';
  };
  
  // Database query results
  databaseQuery?: {
    travelHistory: Array<{
      from: string;
      to: string;
      date: string;
      flagged?: boolean;
      flagNote?: string;
    }>;
    lastSeenLocation: string;
    lastSeenDate: string;
    discrepancies: string[];
  };
  
  credentialData?: {
    type: 'WORK_PERMIT' | 'VISITOR_VISA' | 'MEDICAL_CLEARANCE' | 'NONE';
    issuedBy: string;
    expirationDate: string;
    valid: boolean;
  };
  
  outcomes: {
    APPROVE: Outcome;
    DENY: Outcome;
  };
  
  // Dossier
  dossier?: {
    name: string;
    dateOfBirth: string;
    address: string;
    occupation: string;
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  };
}

// =============================================================================
// SUBJECTS - All use procedural portrait generation
// =============================================================================

export const SUBJECTS: SubjectData[] = [
  // Test subject for procedural portrait system
  {
    name: 'PROCEDURAL TEST',
    id: 'PROC-001',
    sex: 'M',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'MARS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Procedural portrait system test.',
    destinationPlanet: 'EARTH',
    useProceduralPortrait: true,
    dialogue: "Testing the procedural portrait system.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'PROCEDURAL TEST',
      idCode: 'PROC-001',
      originPlanet: 'MARS',
      statedPurpose: 'System test',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'TEST APPROVED',
        consequence: 'Procedural portrait test complete.',
        flagWeight: 0,
      },
      DENY: {
        feedback: 'TEST DENIED',
        consequence: 'Procedural portrait test denied.',
        flagWeight: 0,
      }
    },
    dossier: {
      name: 'PROCEDURAL TEST',
      dateOfBirth: '3160-01-01',
      address: 'Mars Colony Test Facility',
      occupation: 'Test Subject',
      sex: 'MALE',
    },
    bioScanData: {
      biologicalType: 'HUMAN',
      race: 'Mars Colony Standard',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 100,
      augmentationLevel: 'NONE',
    },
  },
  {
    name: 'PROCEDURAL TEST B',
    id: 'PROC-002',
    sex: 'F',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'EUROPA',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Transit verification.',
    destinationPlanet: 'EARTH',
    useProceduralPortrait: true,
    dialogue: "Requesting clearance for Europa transit.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'PROCEDURAL TEST B',
      idCode: 'PROC-002',
      originPlanet: 'EUROPA',
      statedPurpose: 'Transit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: { feedback: 'CLEARED', consequence: 'Transit approved.', flagWeight: 0 },
      DENY: { feedback: 'DENIED', consequence: 'Transit denied.', flagWeight: 0 },
    },
    dossier: {
      name: 'PROCEDURAL TEST B',
      dateOfBirth: '3162-05-12',
      address: 'Europa Outpost',
      occupation: 'Transit',
      sex: 'FEMALE',
    },
    bioScanData: {
      biologicalType: 'HUMAN',
      race: 'Europa Standard',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 100,
      augmentationLevel: 'NONE',
    },
  },
  {
    name: 'PROCEDURAL TEST C',
    id: 'PROC-003',
    sex: 'M',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'TITAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Transit verification.',
    destinationPlanet: 'MARS',
    useProceduralPortrait: true,
    dialogue: "Titan outbound. Clearance required.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'PROCEDURAL TEST C',
      idCode: 'PROC-003',
      originPlanet: 'TITAN',
      statedPurpose: 'Transit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: { feedback: 'CLEARED', consequence: 'Transit approved.', flagWeight: 0 },
      DENY: { feedback: 'DENIED', consequence: 'Transit denied.', flagWeight: 0 },
    },
    dossier: {
      name: 'PROCEDURAL TEST C',
      dateOfBirth: '3158-11-03',
      address: 'Titan Colony',
      occupation: 'Transit',
      sex: 'MALE',
    },
    bioScanData: {
      biologicalType: 'HUMAN',
      race: 'Titan Standard',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 100,
      augmentationLevel: 'NONE',
    },
  },
  {
    name: 'PROCEDURAL TEST D',
    id: 'PROC-004',
    sex: 'F',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'IO',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Transit verification.',
    destinationPlanet: 'EARTH',
    useProceduralPortrait: true,
    dialogue: "Io transit. Requesting clearance.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'PROCEDURAL TEST D',
      idCode: 'PROC-004',
      originPlanet: 'IO',
      statedPurpose: 'Transit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: { feedback: 'CLEARED', consequence: 'Transit approved.', flagWeight: 0 },
      DENY: { feedback: 'DENIED', consequence: 'Transit denied.', flagWeight: 0 },
    },
    dossier: {
      name: 'PROCEDURAL TEST D',
      dateOfBirth: '3161-07-22',
      address: 'Io Station',
      occupation: 'Transit',
      sex: 'FEMALE',
    },
    bioScanData: {
      biologicalType: 'HUMAN',
      race: 'Io Standard',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 100,
      augmentationLevel: 'NONE',
    },
  },
];
