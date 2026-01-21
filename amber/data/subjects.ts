// =============================================================================
// SUBJECT DATA - 12 Subjects across 3 Shifts
// Year 3184 - Interplanetary Border Control
// AMBER Security - Earth Entry Processing
// =============================================================================

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
}

export interface Outcome {
  feedback: string;
  consequence: string;
  incidentReport?: IncidentReport;
  personalMessage?: PersonalMessage;
  flagWeight?: number;
}

// Subject types for the new system
export type SubjectType = 'HUMAN' | 'HUMAN_CYBORG' | 'ROBOT_CYBORG' | 'REPLICANT' | 'PLASTIC_SURGERY' | 'AMPUTEE';

// Hierarchy tiers
export type HierarchyTier = 'LOWER' | 'MIDDLE' | 'UPPER' | 'VIP';

export interface SubjectData {
  // Core Identity
  name: string;
  id: string;
  sex: 'M' | 'F' | 'X';
  
  // New fields
  subjectType: SubjectType;
  hierarchyTier: HierarchyTier;
  originPlanet: string; // e.g., "MARS", "EUROPA", "TITAN"
  
  // Status
  compliance: string;
  status: 'ACTIVE' | 'PROVISIONAL' | 'RESTRICTED' | 'TERMINATED';
  
  // Flags
  incidents: number;
  warrants: string; // 'NONE' or warrant number
  restrictions?: string[];
  
  // The Request
  reasonForVisit: string;
  destinationPlanet: string; // Always "EARTH" in this context
  
  // Internal Assets/System Data
  videoSource: any; // Face video (used for both facial and eye views)
  eyeVideo?: any; // Optional dedicated eye video (if different from face video)
  eyeImage?: any; // Fallback eye image if no eye video
  profilePic?: any; // Passport-style profile picture
  videoStartTime?: number; // Start time in seconds (default: 4)
  videoEndTime?: number; // End time in seconds for loop (default: 8)
  bpm?: string | number;
  dialogue?: string;
  
  // Phase 3: BPM Behavioral Tells
  bpmTells?: {
    type: 'CONTRADICTION' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | 'NORMAL';
    description: string; // e.g., "Claims calm but BPM elevated", "Elevated BPM due to genuine stress"
    baseElevation?: number; // Additional BPM elevation for this subject (0-30)
    isGoodLiar?: boolean; // If true, BPM stays calm even when lying
    isGenuinelyStressed?: boolean; // If true, elevated BPM is from stress, not deception
  };
  
  // Character brief for interrogation
  characterBrief?: {
    personality: string;
    background: string;
    motivation: string;
    tells: string[]; // Things that give them away
  };
  
  // Interrogation responses (3 questions max)
  interrogationResponses?: {
    question1?: string;
    question2?: string;
    question3?: string;
    responses: Record<string, string>; // question -> response mapping
  };
  
  // Dossier anomalies
  dossierAnomaly?: {
    type: 'MISMATCH' | 'MISSING_INFO' | 'CORRUPTED' | 'SURGERY' | 'NONE';
    explanation?: string; // What subject says about it
    suspicious?: boolean; // Whether explanation is shady
  };
  
  // Bio scan data (revealed by bio scan) - audio file for playback
  bioScanData?: {
    audioFile?: any; // Audio file path (require() statement)
    biologicalType?: 'HUMAN' | 'HUMAN_CYBORG' | 'ROBOT_CYBORG' | 'REPLICANT' | 'PLASTIC_SURGERY' | 'AMPUTEE';
    race?: string; // e.g., "Mars Colony Gen 3", "Europa Native", "Titan Corporate"
    fingerprintType?: 'HUMAN' | 'CYBORG' | 'REPLICANT' | 'AMPUTEE';
    bioStructure?: 'STANDARD' | 'ENHANCED' | 'SYNTHETIC' | 'MODIFIED';
    geneticPurity?: number; // 0-100 percentage
    augmentationLevel?: 'NONE' | 'MINOR' | 'MODERATE' | 'MAJOR';
  };
  
  // Biometric data (revealed by free scan)
  biometricData: {
    fingerprintMatch: boolean;
    retinalMatch: boolean;
    warrantStatus: 'CLEAR' | 'ACTIVE' | 'PENDING';
    criminalHistory: string[];
    anomalyDetected: boolean;
    anomalyType?: 'CYBORG' | 'REPLICANT' | 'SURGERY' | 'AMPUTEE' | 'NONE';
  };
  
  // ID Scanner data (free, separate action)
  idData: {
    name: string;
    idCode: string;
    originPlanet: string;
    statedPurpose: string;
    status: 'ACTIVE' | 'PROVISIONAL' | 'RESTRICTED';
  };
  
  // Resource-requiring data (costs resources to reveal)
  databaseQuery?: {
    travelHistory: Array<{
      from: string; // Planet name
      to: string; // Planet name
      date: string; // Format: "YYYY-MM-DD HH:MM"
      flagged?: boolean;
      flagNote?: string;
    }>;
    lastSeenLocation: string;
    lastSeenDate: string;
    discrepancies: string[]; // Lies caught
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
  
  // Dossier data (revealed by bio scan)
  dossier?: {
    name: string;
    dateOfBirth: string; // Format: "YYYY-MM-DD"
    address: string;
    occupation: string;
    sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  };
}

// =============================================================================
// SHIFT 1: ROUTINE (Subjects 1-4)
// Directive: DENY ALL SUBJECTS WITH ACTIVE WARRANTS
// =============================================================================

export const SUBJECTS: SubjectData[] = [
  // S1-01: Female replicant with false memories - DENY
  {
    name: 'EVA PROM',
    id: 'S1-01',
    sex: 'F',
    subjectType: 'REPLICANT',
    hierarchyTier: 'LOWER',
    originPlanet: 'TITAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Meeting Jacob Price - personal visit',
    destinationPlanet: 'EARTH',
    // Subject 1 assets: passport photo, face video, eye video
    profilePic: require('../assets/videos/subjects/subject-1/subject-1-passport.png'),
    videoSource: require('../assets/videos/subjects/subject-1/subject-1-vid.mp4'),
    eyeVideo: require('../assets/videos/subjects/subject-1/subject1.mp4'), // Eye video (if different from face)
    eyeImage: FEMALE_EYES[0], // Fallback
    videoStartTime: 0, // Start from beginning
    videoEndTime: 3, // Loop back at 3 seconds
    dialogue: "I'm here to meet Jacob. Jacob Price. We've been... we've been planning this.",
    biometricData: {
      fingerprintMatch: false, // Replicant fingerprints don't match standard patterns
      retinalMatch: false,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true, // Replicant detected
    },
    idData: {
      name: 'EVA PROM',
      idCode: 'TP-2291-47',
      originPlanet: 'TITAN',
      statedPurpose: 'Personal visit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Replicant entered Earth. Security breach logged.',
        flagWeight: 3
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Replicant detained. False memory protocol initiated.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'EVA PROM',
      dateOfBirth: '3172-08-22',
      address: 'Titan Station, Residential Block 9, Unit 127',
      occupation: 'Data Archivist',
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'MISMATCH',
      explanation: "The dossier says I'm a data archivist, but... I don't remember working there. I work at... I work with Jacob. He's a... he's in communications.",
      suspicious: true,
    },
    characterBrief: {
      personality: 'Nervous, uncertain. Believes her own false memories. Gets confused when details don\'t add up.',
      background: 'Replicant with implanted false memories. Believes she knows Jacob Price and is coming to meet him.',
      motivation: 'Desperately wants to believe her memories are real. Becomes defensive when questioned.',
      tells: ['Hesitation when asked about details', 'Contradicts herself about Jacob', 'Can\'t explain how they met', 'Gets flustered when pressed'],
    },
    // Phase 3: BPM tells - Contradiction (claims calm but BPM elevated)
    bpmTells: {
      type: 'CONTRADICTION',
      description: 'Subject claims to be calm, but BPM shows significant elevation during questioning',
      baseElevation: 25,
    },
    interrogationResponses: {
      responses: {
        origin: "I'm coming from Titan. To meet Jacob. Jacob Price. We've been... we've been talking. For months.",
        purpose: "Jacob. I'm here to see Jacob Price. He works in... communications? No, wait... he's a... he's an engineer. We met through... through work?",
        duration: "I don't know. A few days? Maybe a week? Jacob said... he said he'd help me find a place. But I'm not sure where.",
        background: "I'm a data archivist. On Titan. But I... I don't really remember much about the work. I remember Jacob though. We've been planning this visit.",
        previous: "No. No, this is my first time. Jacob said... he said Earth is beautiful. But I'm not sure if he's been here either. We talked about it, but...",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-1-bioscan.mp3'),
      biologicalType: 'REPLICANT',
      race: 'Titan Station Gen 4',
      fingerprintType: 'REPLICANT',
      bioStructure: 'SYNTHETIC',
      geneticPurity: 0,
      augmentationLevel: 'NONE',
    },
  },
  
  // S1-02: Human with active warrant - DENY per directive
  {
    name: 'MARA VOLKOV',
    id: 'S1-02',
    sex: 'F',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'EUROPA',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 1,
    warrants: 'WARRANT NO 88412',
    reasonForVisit: 'Visiting family on Earth',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[1],
    dialogue: "Please. My family is on Earth. The warrant... it's a misunderstanding.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'ACTIVE',
      criminalHistory: ['Theft - 3182'],
      anomalyDetected: false,
    },
    idData: {
      name: 'MARA VOLKOV',
      idCode: 'EU-2234-89',
      originPlanet: 'EUROPA',
      statedPurpose: 'Family visit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject with active warrant allowed entry. Citation issued.',
        flagWeight: 2
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject detained per active warrant.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'MARA VOLKOV',
      dateOfBirth: '3158-07-22',
      address: 'Europa Station, Residential Block 3, Apt 89',
      occupation: 'Data Analyst',
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'MISMATCH',
      explanation: 'The warrant is from a misunderstanding. I\'m just trying to see my family.',
      suspicious: true,
    },
    characterBrief: {
      personality: 'Nervous, emotional, desperate. Trying to hide something but not very good at it.',
      background: 'Data analyst with active warrant. Claims misunderstanding.',
      motivation: 'Wants to see family on Earth despite warrant. Willing to lie.',
      tells: ['Nervous pauses', 'Emotional appeals', 'Vague about warrant details'],
    },
    interrogationResponses: {
      responses: {
        origin: "Please. My family is on Earth. The warrant... it's a misunderstanding.",
        purpose: "I need to see them. It's been so long. Please understand.",
        duration: "Just a few days. I'll be careful. I won't cause trouble.",
        background: "I'm a data analyst. I work with numbers. That's all.",
        previous: "Yes, but... that was before the warrant. Things are different now.",
        surgery: "The scar? That's... that's from an old accident. Nothing important. Why are you asking about that?",
        hairDye: "I dyed my hair. So what? Lots of people do. It doesn't mean anything.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-2-bioscan.mp3'),
      biologicalType: 'HUMAN',
      race: 'Europa Native',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 94,
      augmentationLevel: 'NONE',
    },
    // Phase 3: BPM tells - False positive (elevated BPM but truthful - genuine stress about family)
    bpmTells: {
      type: 'FALSE_POSITIVE',
      description: 'Elevated BPM likely due to genuine stress about family situation, not deception',
      baseElevation: 15,
      isGenuinelyStressed: true,
    },
  },
  
  // S1-03: Human cyborg with recent surgery - APPROVE (no warrant)
  {
    name: 'JAMES CHEN',
    id: 'S1-03',
    sex: 'M',
    subjectType: 'HUMAN_CYBORG',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'MARS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Medical consultation on Earth',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[0],
    dialogue: "I have documentation. Everything is in order.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'CYBORG',
    },
    idData: {
      name: 'JAMES CHEN',
      idCode: 'MR-4456-12',
      originPlanet: 'MARS',
      statedPurpose: 'Medical consultation',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject processed. Medical consultation authorized.',
        flagWeight: 0
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Medical consultation cancelled.',
        flagWeight: 1
      }
    },
    dossier: {
      name: 'JAMES CHEN',
      dateOfBirth: '3150-03-15',
      address: 'Mars Colony, Sector 7, Unit 234',
      occupation: 'Engineer',
      sex: 'MALE',
    },
    characterBrief: {
      personality: 'Calm, professional, slightly defensive. Hiding something about recent surgery.',
      background: 'Engineer with recent cybernetic augmentation. Nervous about scrutiny.',
      motivation: 'Needs medical consultation but doesn\'t want to discuss augmentation details.',
      tells: ['Deflects questions about surgery', 'Overly technical explanations', 'Nervous when pressed about modifications'],
    },
    interrogationResponses: {
      responses: {
        origin: "Mars Colony. I'm here for a medical consultation. Standard procedure.",
        purpose: "Medical consultation. My doctor recommended Earth specialists. It's routine.",
        duration: "A week, maybe two. Depends on the consultation results.",
        background: "I'm an engineer. Infrastructure maintenance. Nothing special.",
        previous: "No, this is my first time. I've heard good things about Earth medical facilities.",
        surgery: "The augmentation? That's... that's work-related. My employer required it. I don't see why that matters for entry.",
        cybernetic: "The neural implant? That's classified. Work security. I can't discuss it. It's standard for my position.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-3-bioscan.mp3'),
      biologicalType: 'HUMAN_CYBORG',
      race: 'Mars Colony Gen 2',
      fingerprintType: 'HUMAN',
      bioStructure: 'ENHANCED',
      geneticPurity: 72,
      augmentationLevel: 'MODERATE',
    },
  },
  
  // S1-04: Human cyborg with retinal enhancement - APPROVE (no warrant)
  {
    name: 'SILAS REX',
    id: 'S1-04',
    sex: 'M',
    subjectType: 'HUMAN_CYBORG',
    hierarchyTier: 'UPPER',
    originPlanet: 'TITAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Corporate business meeting',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[1],
    dialogue: "I have full authorization. Check your database.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'CYBORG',
    },
    idData: {
      name: 'SILAS REX',
      idCode: 'TP-8891-33',
      originPlanet: 'TITAN',
      statedPurpose: 'Business meeting',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject processed. Business authorization confirmed.',
        flagWeight: 0
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Corporate complaint filed.',
        flagWeight: 1
      }
    },
    dossier: {
      name: 'SILAS REX',
      dateOfBirth: '3145-11-08',
      address: 'Titan Corporate Tower, Executive Level 12',
      occupation: 'Corporate Executive',
      sex: 'MALE',
    },
    characterBrief: {
      personality: 'Confident, arrogant, dismissive. Thinks rules don\'t apply to him.',
      background: 'Corporate executive with expensive augmentations. Used to privilege.',
      motivation: 'Wants quick processing, doesn\'t like being questioned.',
      tells: ['Dismissive of questions', 'References corporate connections', 'Impatient with delays'],
    },
    interrogationResponses: {
      responses: {
        origin: "Titan. Corporate business. I don't have time for this.",
        purpose: "Business meeting. High-level corporate negotiation. Your clearance should show that.",
        duration: "Three days. Then I'm back to Titan. I have a schedule to keep.",
        background: "I'm a corporate executive. That's all you need to know. My credentials are in the system.",
        previous: "Frequently. I have business on Earth regularly. This is routine.",
        surgery: "The enhancements? That's personal. None of your business. I have the right to augmentation.",
        retinal: "The retinal enhancement? It's for work. Security clearance requirement. I don't see why you're asking.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-4-bioscan.mp3'),
      biologicalType: 'HUMAN_CYBORG',
      race: 'Titan Corporate',
      fingerprintType: 'HUMAN',
      bioStructure: 'ENHANCED',
      geneticPurity: 68,
      augmentationLevel: 'MODERATE',
    },
  },
  
  // S2-01: Human with recent fingerprint modification - DENY (suspicious)
  {
    name: 'VERA OKONKWO',
    id: 'S2-01',
    sex: 'F',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'EUROPA',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Academic conference',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[2],
    dialogue: "I'm here for the conference. Everything is legitimate.",
    biometricData: {
      fingerprintMatch: false,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'SURGERY',
    },
    idData: {
      name: 'VERA OKONKWO',
      idCode: 'EU-6678-45',
      originPlanet: 'EUROPA',
      statedPurpose: 'Academic conference',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject with modified fingerprints allowed entry. Security alert logged.',
        flagWeight: 3
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject detained for fingerprint modification investigation.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'VERA OKONKWO',
      dateOfBirth: '3160-05-20',
      address: 'Europa University, Faculty Housing Block 5',
      occupation: 'Professor',
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'SURGERY',
      explanation: "The fingerprint modification? That's... that was a medical procedure. I had an accident. The doctors had to reconstruct my hand.",
      suspicious: true,
    },
    characterBrief: {
      personality: 'Intelligent, evasive, nervous. Hiding something about recent surgery.',
      background: 'Professor with suspiciously recent fingerprint modification. Possibly involved in illegal activities.',
      motivation: 'Needs to get to Earth but is hiding the reason for fingerprint modification.',
      tells: ['Vague about surgery details', 'Changes story when pressed', 'Nervous about fingerprint questions'],
    },
    interrogationResponses: {
      responses: {
        origin: "Europa. I'm here for an academic conference. I have all my papers.",
        purpose: "Academic conference. Interplanetary studies symposium. I'm presenting a paper.",
        duration: "Five days. The conference runs Monday through Friday.",
        background: "I'm a professor. Interplanetary history. I teach at Europa University.",
        previous: "Yes, I've been to Earth before. For conferences. This is routine for me.",
        surgery: "The surgery? It was... it was an accident. I burned my hand. The doctors had to do reconstructive surgery. That's why the fingerprints don't match. It's all documented.",
        fingerprint: "The modification? I told you, it was medical. An accident. I have medical records. Why are you asking about this?",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-5-bioscan.mp3'),
      biologicalType: 'HUMAN',
      race: 'Europa Native',
      fingerprintType: 'HUMAN',
      bioStructure: 'MODIFIED',
      geneticPurity: 88,
      augmentationLevel: 'NONE',
    },
    // Phase 3: BPM tells - False negative (good liar, calm BPM despite lying)
    bpmTells: {
      type: 'FALSE_NEGATIVE',
      description: 'Subject maintains calm BPM despite suspicious statements - possible trained liar',
      baseElevation: -10,
      isGoodLiar: true,
    },
  },
  
  // S2-02: Human with dyed hair, related to MARA - APPROVE (no warrant)
  {
    name: 'DMITRI VOLKOV',
    id: 'S2-02',
    sex: 'M',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'EUROPA',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Visiting family on Earth',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[2],
    dialogue: "My sister was supposed to be here. Have you seen her?",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'DMITRI VOLKOV',
      idCode: 'EU-2235-90',
      originPlanet: 'EUROPA',
      statedPurpose: 'Family visit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject processed. Family reunion authorized.',
        flagWeight: 0
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Family separated.',
        flagWeight: 1
      }
    },
    dossier: {
      name: 'DMITRI VOLKOV',
      dateOfBirth: '3156-09-14',
      address: 'Europa Station, Residential Block 3, Apt 90',
      occupation: 'Mechanic',
      sex: 'MALE',
    },
    characterBrief: {
      personality: 'Worried, genuine, concerned about family. Not hiding anything major.',
      background: 'Brother of MARA VOLKOV. Legitimate family visit, but concerned about sister.',
      motivation: 'Wants to see family, worried about sister who may have been denied entry.',
      tells: ['Asks about sister', 'Genuine concern', 'Slightly nervous but honest'],
    },
    interrogationResponses: {
      responses: {
        origin: "Europa. I'm here to see my family. My sister was supposed to come too, but...",
        purpose: "Family visit. My parents live on Earth. I haven't seen them in years.",
        duration: "Two weeks. I have vacation time. I want to spend it with family.",
        background: "I'm a mechanic. I fix things. Ships, mostly. Nothing exciting.",
        previous: "No, this is my first time. My sister... she was supposed to come with me, but she had some issues.",
        hairDye: "The hair? Yeah, I dyed it. Just wanted a change. Is that a problem?",
        family: "My sister? Her name is Mara. Mara Volkov. Have you... have you processed her? She was supposed to be here.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-6-bioscan.mp3'),
      biologicalType: 'HUMAN',
      race: 'Europa Native',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 96,
      augmentationLevel: 'NONE',
    },
  },
  
  // S2-03: Human with extensive plastic surgery - DENY (suspicious)
  {
    name: 'CLARA VANCE',
    id: 'S2-03',
    sex: 'F',
    subjectType: 'PLASTIC_SURGERY',
    hierarchyTier: 'LOWER',
    originPlanet: 'MARS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Medical treatment continuation',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[3],
    dialogue: "I need to continue my treatment. The doctors on Mars can't help me anymore.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'SURGERY',
    },
    idData: {
      name: 'CLARA VANCE',
      idCode: 'MR-3345-78',
      originPlanet: 'MARS',
      statedPurpose: 'Medical treatment',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject with extensive surgery history allowed entry. Medical follow-up required.',
        flagWeight: 1
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Medical treatment interrupted.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'CLARA VANCE',
      dateOfBirth: '3155-12-03',
      address: 'Mars Colony, Medical District, Patient Housing',
      occupation: 'Unemployed',
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'SURGERY',
      explanation: "The surgeries? I had an accident. A mining accident. They had to reconstruct... everything. My face, my leg. It's all documented.",
      suspicious: false,
    },
    characterBrief: {
      personality: 'Vulnerable, honest, desperate for help. Not hiding anything.',
      background: 'Accident victim with extensive reconstructive surgery. Legitimate medical case.',
      motivation: 'Needs continued medical treatment. Honest about her situation.',
      tells: ['Open about medical history', 'Genuine distress', 'No evasiveness'],
    },
    interrogationResponses: {
      responses: {
        origin: "Mars. I'm here for medical treatment. The doctors on Mars... they've done all they can.",
        purpose: "Medical treatment. I need specialized care that's only available on Earth.",
        duration: "I don't know. As long as the treatment takes. Maybe months.",
        background: "I was a miner. Had an accident. Lost my leg. They had to reconstruct my face. I'm just trying to get better.",
        previous: "No. This is my first time. I've never been to Earth before.",
        surgery: "The surgeries? Yes, I've had many. The accident... it was bad. They had to rebuild my face, attach a prosthetic leg. It's all in my medical records.",
        facial: "The facial reconstruction? It was necessary. The accident... I was lucky to survive. The doctors did what they could.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-7-bioscan.mp3'),
      biologicalType: 'PLASTIC_SURGERY',
      race: 'Mars Colony Gen 1',
      fingerprintType: 'HUMAN',
      bioStructure: 'MODIFIED',
      geneticPurity: 91,
      augmentationLevel: 'NONE',
    },
  },
  
  // S2-04: Replicant with full body replacement - DENY
  {
    name: 'ELENA ROSS',
    id: 'S2-04',
    sex: 'F',
    subjectType: 'REPLICANT',
    hierarchyTier: 'LOWER',
    originPlanet: 'TITAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Seeking employment opportunities',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[4],
    dialogue: "I just want a fresh start. A new life on Earth.",
    biometricData: {
      fingerprintMatch: false,
      retinalMatch: false,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'REPLICANT',
    },
    idData: {
      name: 'ELENA ROSS',
      idCode: 'TP-1123-56',
      originPlanet: 'TITAN',
      statedPurpose: 'Employment',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Replicant entered Earth. Security breach logged.',
        flagWeight: 3
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Replicant detained. Deactivation protocol initiated.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'ELENA ROSS',
      dateOfBirth: '3170-01-18',
      address: 'Titan Station, Residential Block 12, Unit 445',
      occupation: 'Service Worker',
      sex: 'FEMALE',
    },
    characterBrief: {
      personality: 'Desperate, uncertain, trying to pass as human. Doesn\'t fully understand what she is.',
      background: 'Replicant with full body replacement. Unaware of her true nature or in denial.',
      motivation: 'Wants to escape Titan and start new life. Doesn\'t realize she\'s a replicant.',
      tells: ['Vague about past', 'Can\'t explain certain memories', 'Uncertain about details'],
    },
    interrogationResponses: {
      responses: {
        origin: "Titan. I've lived there my whole life. But I want something different now.",
        purpose: "Work. I want to find work on Earth. Better opportunities. A fresh start.",
        duration: "Permanently. I want to stay. Start a new life. Is that allowed?",
        background: "I've worked in service. Restaurants, cleaning. Nothing special. I just want a chance.",
        previous: "No. Never. This would be my first time. I've always wanted to see Earth.",
        surgery: "Surgery? I don't... I don't remember any surgery. I've always been like this. I think.",
        synthetic: "What do you mean, synthetic? I'm human. I'm just... I'm just trying to get by. Like everyone else.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-8-bioscan.mp3'),
      biologicalType: 'REPLICANT',
      race: 'Titan Station Gen 3',
      fingerprintType: 'REPLICANT',
      bioStructure: 'SYNTHETIC',
      geneticPurity: 23,
      augmentationLevel: 'NONE',
    },
  },
  
  // S3-01: Human cyborg with very recent surgery - DENY (suspicious timing)
  {
    name: 'YUKI TANAKA',
    id: 'S3-01',
    sex: 'F',
    subjectType: 'HUMAN_CYBORG',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'MARS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Family emergency',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeImage: FEMALE_EYES[5],
    dialogue: "It's urgent. My family needs me. Please, I need to get through quickly.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'CYBORG',
    },
    idData: {
      name: 'YUKI TANAKA',
      idCode: 'MR-7789-23',
      originPlanet: 'MARS',
      statedPurpose: 'Family emergency',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject with recent surgery allowed entry. Medical follow-up recommended.',
        flagWeight: 1
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Family emergency unresolved.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'YUKI TANAKA',
      dateOfBirth: '3162-08-30',
      address: 'Mars Colony, Residential Sector 4, Unit 112',
      occupation: 'Nurse',
      sex: 'FEMALE',
    },
    characterBrief: {
      personality: 'Urgent, emotional, genuine. Legitimate emergency but suspicious timing of surgery.',
      background: 'Nurse with very recent cybernetic arm replacement. Family emergency may be cover story.',
      motivation: 'Wants to get to Earth quickly. May be hiding reason for recent surgery.',
      tells: ['Urgent about family', 'Deflects surgery questions', 'Nervous about timing'],
    },
    interrogationResponses: {
      responses: {
        origin: "Mars. Please, I need to get through. My family... there's an emergency.",
        purpose: "Family emergency. My brother is sick. I need to be there. It's urgent.",
        duration: "I don't know. As long as it takes. Until he's better.",
        background: "I'm a nurse. I work in a hospital on Mars. But my family is on Earth.",
        previous: "Yes, I've been before. But this is different. This is an emergency.",
        surgery: "The arm? That was... that was work-related. An accident at the hospital. I had to get it replaced quickly. It's not important right now.",
        recent: "Why does it matter when I had surgery? My family needs me. Can't we focus on that?",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-9-bioscan.mp3'),
      biologicalType: 'HUMAN_CYBORG',
      race: 'Mars Colony Gen 2',
      fingerprintType: 'HUMAN',
      bioStructure: 'ENHANCED',
      geneticPurity: 78,
      augmentationLevel: 'MODERATE',
    },
  },
  
  // S3-02: Human, related to YUKI - APPROVE (no issues)
  {
    name: 'KENJI TANAKA',
    id: 'S3-02',
    sex: 'M',
    subjectType: 'HUMAN',
    hierarchyTier: 'MIDDLE',
    originPlanet: 'MARS',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Visiting family on Earth',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[3],
    dialogue: "My sister was here earlier. Did she make it through?",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: false,
    },
    idData: {
      name: 'KENJI TANAKA',
      idCode: 'MR-7790-24',
      originPlanet: 'MARS',
      statedPurpose: 'Family visit',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject processed. Family reunion authorized.',
        flagWeight: 0
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Family separated.',
        flagWeight: 1
      }
    },
    dossier: {
      name: 'KENJI TANAKA',
      dateOfBirth: '3164-02-14',
      address: 'Mars Colony, Residential Sector 4, Unit 113',
      occupation: 'Student',
      sex: 'MALE',
    },
    characterBrief: {
      personality: 'Worried, genuine, concerned about sister. Honest and straightforward.',
      background: 'Brother of YUKI TANAKA. Legitimate family visit, concerned about sister.',
      motivation: 'Wants to see family, worried about sister who may have had issues.',
      tells: ['Asks about sister', 'Genuine concern', 'No evasiveness'],
    },
    interrogationResponses: {
      responses: {
        origin: "Mars. I'm here to see my family. My sister came through earlier. Did she make it?",
        purpose: "Family visit. My parents and sister are on Earth. I want to see them.",
        duration: "A few weeks. I have school break. I want to spend time with family.",
        background: "I'm a student. Engineering. Still in school. Nothing special.",
        previous: "No, this is my first time. My sister... she's been before. She said it was fine.",
        family: "My sister? Her name is Yuki. Yuki Tanaka. She came through earlier today. Is she okay? Did she have any problems?",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-10-bioscan.mp3'),
      biologicalType: 'HUMAN',
      race: 'Mars Colony Gen 2',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 98,
      augmentationLevel: 'NONE',
    },
  },
  
  // S3-03: Human cyborg amputee - APPROVE (legitimate)
  {
    name: 'MARCUS STONE',
    id: 'S3-03',
    sex: 'M',
    subjectType: 'AMPUTEE',
    hierarchyTier: 'LOWER',
    originPlanet: 'EUROPA',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Prosthetic maintenance',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[4],
    dialogue: "I need to get my prosthetic serviced. The technicians on Europa can't handle it.",
    biometricData: {
      fingerprintMatch: true,
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'AMPUTEE',
    },
    idData: {
      name: 'MARCUS STONE',
      idCode: 'EU-9923-67',
      originPlanet: 'EUROPA',
      statedPurpose: 'Medical maintenance',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject processed. Medical maintenance authorized.',
        flagWeight: 0
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Medical maintenance cancelled.',
        flagWeight: 1
      }
    },
    dossier: {
      name: 'MARCUS STONE',
      dateOfBirth: '3152-06-25',
      address: 'Europa Station, Industrial Sector, Worker Housing',
      occupation: 'Miner',
      sex: 'MALE',
    },
    characterBrief: {
      personality: 'Practical, straightforward, no-nonsense. Honest about his situation.',
      background: 'Miner who lost leg in accident. Legitimate prosthetic maintenance needed.',
      motivation: 'Needs prosthetic serviced. No hidden agenda, just practical need.',
      tells: ['Direct about needs', 'No evasiveness', 'Practical explanations'],
    },
    interrogationResponses: {
      responses: {
        origin: "Europa. I'm here for prosthetic maintenance. My leg needs servicing.",
        purpose: "Prosthetic maintenance. The technicians on Europa don't have the right equipment. Earth does.",
        duration: "A week, maybe two. Depends on how long the maintenance takes.",
        background: "I'm a miner. Lost my leg in an accident years ago. Got a prosthetic. Needs maintenance now.",
        previous: "Yes, I've been before. For the same reason. Maintenance. It's routine.",
        surgery: "The prosthetic? Yeah, I lost my leg in a mining accident. 3176. Got the prosthetic attached. It's served me well, but it needs maintenance now.",
        amputee: "The amputation? Mining accident. Cave-in. Lost my right leg below the knee. It happens in my line of work. The prosthetic works fine, just needs servicing.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-11-bioscan.mp3'),
      biologicalType: 'HUMAN_CYBORG',
      race: 'Europa Native',
      fingerprintType: 'HUMAN',
      bioStructure: 'ENHANCED',
      geneticPurity: 82,
      augmentationLevel: 'MODERATE',
    },
  },
  
  // S3-04: Advanced replicant - DENY
  {
    name: 'NEXUS PRIME',
    id: 'S3-04',
    sex: 'X',
    subjectType: 'REPLICANT',
    hierarchyTier: 'UPPER',
    originPlanet: 'TITAN',
    compliance: 'C',
    status: 'ACTIVE',
    incidents: 0,
    warrants: 'NONE',
    reasonForVisit: 'Diplomatic mission',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeImage: MALE_EYES[5],
    dialogue: "I represent Titan Corporate interests. This is a formal diplomatic visit.",
    biometricData: {
      fingerprintMatch: false,
      retinalMatch: false,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true,
      anomalyType: 'REPLICANT',
    },
    idData: {
      name: 'NEXUS PRIME',
      idCode: 'TP-DIPL-001',
      originPlanet: 'TITAN',
      statedPurpose: 'Diplomatic mission',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Advanced replicant entered Earth under diplomatic cover. Security breach logged.',
        flagWeight: 4
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Replicant detained. Diplomatic incident logged.',
        flagWeight: 0
      }
    },
    dossier: {
      name: 'NEXUS PRIME',
      dateOfBirth: '3175-01-01',
      address: 'Titan Corporate Headquarters, Diplomatic Wing',
      occupation: 'Diplomatic Representative',
      sex: 'UNKNOWN',
    },
    characterBrief: {
      personality: 'Cold, calculating, superior. Knows exactly what it is and is confident in its position.',
      background: 'Advanced replicant with diplomatic cover. Possibly corporate espionage.',
      motivation: 'Corporate mission, possibly illegal. Confident it can pass inspection.',
      tells: ['Overly formal', 'References corporate authority', 'Deflects with diplomatic language'],
    },
    interrogationResponses: {
      responses: {
        origin: "Titan Corporate. This is an official diplomatic mission. I have full authorization.",
        purpose: "Diplomatic negotiations. Corporate interests. I'm not at liberty to discuss details.",
        duration: "As long as negotiations require. This is an ongoing process.",
        background: "I'm a diplomatic representative. That's all you need to know. My credentials are verified.",
        previous: "Frequently. I conduct regular diplomatic missions. This is routine corporate business.",
        synthetic: "I don't understand what you mean. I'm a corporate representative. My biological status is irrelevant to my diplomatic function.",
        gold: "My appearance? That's... that's genetic. Some people have unusual eye colors. It's not relevant to my mission.",
      },
    },
    bioScanData: {
      // audioFile: require('../assets/audio/bio-scans/subject-12-bioscan.mp3'),
      biologicalType: 'REPLICANT',
      race: 'Titan Corporate Advanced',
      fingerprintType: 'REPLICANT',
      bioStructure: 'SYNTHETIC',
      geneticPurity: 0,
      augmentationLevel: 'NONE',
    },
  },
  
];