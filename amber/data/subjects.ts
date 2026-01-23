// =============================================================================
// SUBJECT DATA - 12 Subjects across 3 Shifts
// Year 3184 - Depot Security Lockdown
// AMBER Security - Infiltration Prevention
// =============================================================================

// Eye image arrays for cycling through
const FEMALE_EYES = [
  require('../assets/female-eyes/female1.mp4'),
  require('../assets/female-eyes/female2.mp4'),
  // Fill out indices used by SUBJECTS below (avoid undefined lookups)
  require('../assets/female-eyes/female1.mp4'),
  require('../assets/female-eyes/female2.mp4'),
  require('../assets/female-eyes/female1.mp4'),
  require('../assets/female-eyes/female2.mp4'),
];

const MALE_EYES = [
  require('../assets/male-eyes/male1.mp4'),
  // Fill out indices used by SUBJECTS below (avoid undefined lookups)
  require('../assets/male-eyes/male1.mp4'),
  require('../assets/male-eyes/male1.mp4'),
  require('../assets/male-eyes/male1.mp4'),
  require('../assets/male-eyes/male1.mp4'),
  require('../assets/male-eyes/male1.mp4'),
];

// ==========s===================================================================
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

// News report shown at end of shift based on player decisions
export interface NewsReport {
  headline: string;
  subheadline?: string;
  body: string;
  source: string; // e.g., "AMBER NEWS NETWORK", "SECTOR ALERT"
  tone: 'NEUTRAL' | 'ALARMING' | 'POSITIVE' | 'OMINOUS' | 'TRAGIC';
  audioFile?: any; // Optional audio narration
}

export interface Outcome {
  feedback: string;
  consequence: string;
  incidentReport?: IncidentReport;
  personalMessage?: PersonalMessage;
  newsReport?: NewsReport; // News story that plays if this outcome occurs
  flagWeight?: number;
}

// Subject types for the new system
export type SubjectType = 'HUMAN' | 'HUMAN_CYBORG' | 'ROBOT_CYBORG' | 'REPLICANT' | 'PLASTIC_SURGERY' | 'AMPUTEE';

// Hierarchy tiers
export type HierarchyTier = 'LOWER' | 'MIDDLE' | 'UPPER' | 'VIP';

// Phase 4: Personality Traits
export type PersonalityType =
  | 'NERVOUS'     // Anxious, fidgety, unsure
  | 'CONFIDENT'   // Self-assured, calm under pressure
  | 'DECEPTIVE'   // Hiding something, evasive
  | 'DESPERATE'   // Pleading, emotional, urgent
  | 'ARROGANT'    // Dismissive, entitled, impatient
  | 'VULNERABLE'  // Open, genuine distress, honest
  | 'CONFUSED'    // Uncertain, contradictory, disoriented
  | 'PROFESSIONAL'; // Formal, business-like, efficient

// Phase 4: Interrogation tone tiers (selected by press-and-hold duration)
export type InterrogationTone = 'soft' | 'firm' | 'harsh';
export type InterrogationResponse = string | Partial<Record<InterrogationTone, string>>;

export interface PersonalityTraits {
  primaryType: PersonalityType;
  secondaryType?: PersonalityType;
  trustworthiness: number; // 0-100, affects BPM interpretation
  cooperativeness: number; // 0-100, affects investigation ease
  emotionalStability: number; // 0-100, affects response consistency
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
  
  // Phase 4: Personality Traits (structured)
  personalityTraits?: PersonalityTraits;
  personality?: PersonalityTraits; // Alias for personalityTraits (factory uses this)

  // Phase 4: Subject Interaction (communication and credentials)
  communicationStyle?: import('./subjectGreetings').CommunicationStyle;
  credentialBehavior?: import('./subjectGreetings').CredentialBehavior;
  greetingText?: string;
  credentialType?: import('./credentialTypes').CredentialType;
  credentialDetails?: import('./credentialTypes').CredentialDetails | import('./credentialTypes').CredentialDetails[];

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
    responses: Record<string, InterrogationResponse>; // question -> response mapping (optionally tone-tiered)
  };
  
  // Dossier anomalies
  dossierAnomaly?: {
    type: 'MISMATCH' | 'MISSING_INFO' | 'CORRUPTED' | 'SURGERY' | 'NONE';
    explanation?: string; // What subject says about it
    suspicious?: boolean; // Whether explanation is shady
  };

  // Verification record (single contradictory file)
  verificationRecord?: VerificationRecord;
  
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
  
  // Investigation data revealed by scans/queries
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
  // BREADCRUMBS: Employment overlap, address mismatch, age doesn't fit timeline
  // ELEVATION BEHAVIOR: Memories fragment more under stress - reveals contradictions
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
    reasonForVisit: 'Cleared to enter the depot for a personal contact extraction.',
    destinationPlanet: 'EARTH',
    // Subject 1 assets: passport photo, face video, eye video
    profilePic: require('../assets/videos/subjects/subject-1/subject-1-passport.png'),
    videoSource: require('../assets/videos/subjects/subject-1/subject-1-vid.mp4'),
    // Use the canonical female eye asset for S1-01
    eyeVideo: require('../assets/female-eyes/female1.mp4'),
    eyeImage: FEMALE_EYES[0], // Fallback
    videoStartTime: 0, // Start from beginning
    videoEndTime: 3, // Loop back at 3 seconds
    dialogue: "I'm here to meet my fiancé. Jacob Price. He's waiting for me.",
    biometricData: {
      fingerprintMatch: false, // Replicant fingerprints don't match standard patterns
      retinalMatch: true,
      warrantStatus: 'CLEAR',
      criminalHistory: [],
      anomalyDetected: true, // Replicant detected
    },
    idData: {
      name: 'EVA PROM',
      idCode: 'TP-2291-47',
      originPlanet: 'TITAN',
      statedPurpose: 'Meeting fiancé',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Replicant with false memories entered Earth seeking non-existent person. Security breach logged.',
        flagWeight: 3,
        newsReport: {
          headline: 'WOMAN FOUND WANDERING TRANSIT HUB, CALLING FOR "JACOB"',
          subheadline: 'Security footage shows subject searching for hours before breakdown',
          body: 'A woman identified as EVA PROM was found in a dissociative state at Central Transit Hub, repeatedly asking passersby for directions to an address that does not exist. When confronted about "Jacob Price," she became increasingly agitated. Medical teams have confirmed synthetic markers in her bloodwork. Authorities are questioning how she passed border screening.',
          source: 'AMBER NEWS NETWORK',
          tone: 'TRAGIC',
        },
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Replicant detained. False memory syndrome confirmed. No record of "Jacob Price" exists.',
        flagWeight: 0,
        newsReport: {
          headline: 'REPLICANT DETAINED AT BORDER - FALSE MEMORY SYNDROME CONFIRMED',
          subheadline: 'Subject believed she was meeting a fiancé who never existed',
          body: 'AMBER Security successfully identified and detained a Nexus-series replicant attempting entry under false pretenses. The subject, designated EVA PROM, exhibited classic signs of implanted memory syndrome, insisting on the existence of a romantic partner with no corresponding records. "This is exactly the kind of threat our screening process is designed to catch," stated border officials.',
          source: 'SECTOR SECURITY BULLETIN',
          tone: 'POSITIVE',
        },
      }
    },
    // DOSSIER WITH CONTRADICTIONS:
    // 1. Birth year 3172 but claims 12 years at archive (would've started at age 0)
    // 2. Address says "Mars Colony" but origin is TITAN
    // 3. Occupation "Data Archivist" but employment record shows "Maintenance Tech"
    dossier: {
      name: 'EVA PROM',
      dateOfBirth: '3172-08-22', // Only 12 years old in 3184? Suspicious.
      address: 'Mars Colony, Sector 7, Hab 42', // CONTRADICTION: Claims she lived on Titan
      occupation: 'Maintenance Technician', // CONTRADICTION: She says "Data Archivist"
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'MISMATCH',
      explanation: "I... I worked at the archive. I'm sure I did. The records must be wrong.",
      suspicious: true,
    },
    verificationRecord: {
      type: 'TRANSIT',
      date: '3184-01-13',
      referenceId: 'TR-2041',
      source: 'AMBER TRANSIT HUB',
      summary: 'Transit log includes an undeclared Mars Relay hop under maintenance routing.',
      contradiction: 'Intake states direct Titan-to-Earth travel with no intermediate stop.',
      question: 'Your transit file shows a Mars Relay hop you did not declare. Explain.',
    },
    characterBrief: {
      personality: 'Nervous, uncertain. Believes her own false memories completely. Gets confused and defensive when details don\'t add up.',
      background: 'Replicant with implanted false memories of a relationship with "Jacob Price" that never existed. No record of Jacob Price exists in any Earth database.',
      motivation: 'Desperately wants to reunite with fiancé she believes is real. Becomes distressed when memories contradict each other.',
      tells: ['Changes story about how they met', 'Can\'t remember wedding date or proposal details', 'Contradicts herself about Jacob\'s job', 'Gets emotional when pressed on specifics'],
    },
    personalityTraits: {
      primaryType: 'CONFUSED',
      secondaryType: 'NERVOUS',
      trustworthiness: 30,
      cooperativeness: 75,
      emotionalStability: 35,
    },
    bpmTells: {
      type: 'CONTRADICTION',
      description: 'Subject claims to be calm, but BPM shows significant elevation during questioning',
      baseElevation: 25,
    },
    // TONE-TIERED RESPONSES: Under pressure, memories FRAGMENT more
    interrogationResponses: {
      responses: {
        origin: {
          soft: "Titan. I lived on Titan Station. Block 9. I worked as an archivist there... before Jacob. He's waiting for me here.",
          firm: "Titan... or was it Mars? No, Titan. Block 9. I remember the view from the window. Jacob used to visit me at work. At the archive.",
          harsh: "I don't... why are you asking like that? I lived on Titan. Or Mars? The records say Mars but I remember Titan. I remember the cold. Why don't I remember which one?"
        },
        purpose: {
          soft: "I'm meeting my fiancé. Jacob Price. He works in communications. We met at the archive.",
          firm: "Meeting Jacob. He's in... engineering? No, communications. We met at... it was either the archive or a transit hub. I remember his face clearly.",
          harsh: "Jacob! I'm here for Jacob! He works in... I can't... why can't I remember what he does? I know his face. I know I love him. Why can't I remember how we met?"
        },
        duration: {
          soft: "Permanently. Jacob and I are getting married. He has an apartment ready for us.",
          firm: "Forever. We're getting married. He sent me the address... somewhere in the city. I wrote it down. I must have written it down.",
          harsh: "I'm staying! We're getting married! The wedding is... when is the wedding? He told me the date. I know he told me. Why can't I remember the date?"
        },
        background: {
          soft: "I'm a data archivist. That's where I met Jacob. He was doing research there.",
          firm: "I'm an archivist. Or... the records say maintenance? That's wrong. I worked with data. Jacob was a researcher. Or a contractor. The proposal was at a restaurant.",
          harsh: "I don't understand these questions! I worked at the archive! I know I did! The records are wrong. Jacob proposed at... at... somewhere beautiful. I remember being happy. I remember saying yes. I REMEMBER."
        },
        previous: {
          soft: "No, first time. Jacob always said Earth was beautiful. He promised to show me everything.",
          firm: "Never been. Jacob described it to me. The oceans, the trees. We've been planning this for months.",
          harsh: "No! I've never... have I? No. Jacob would have told me if I'd been here before. He tells me everything. He loves me. He's real. He has to be real."
        },
        // New question: directly challenge the dossier contradiction
        occupation: {
          soft: "I'm a data archivist. I've worked there for years.",
          firm: "An archivist. The dossier says maintenance? That's... that must be an error. I remember the data terminals. The files.",
          harsh: "I'M AN ARCHIVIST! I remember cataloging data! I remember... do I? The terminals were... what color were the terminals? Why can't I see them clearly anymore?"
        },
        address: {
          soft: "I lived on Titan Station. Block 9, Unit 127.",
          firm: "Titan. The dossier says Mars? No, I... I remember Titan. The ice outside the windows. But I also remember... red dust?",
          harsh: "I lived on TITAN! I know I did! But... there's another place too. Somewhere red. Somewhere different. Two places. How did I live in two places?"
        },
      },
    },
    databaseQuery: {
      travelHistory: [
        {
          from: 'TITAN STATION',
          to: 'JUPITER TRANSFER',
          date: '3184-01-12 03:40',
        },
        {
          from: 'JUPITER TRANSFER',
          to: 'MARS RELAY',
          date: '3184-01-13 19:05',
        },
        {
          from: 'MARS RELAY',
          to: 'EARTH ORBITAL',
          date: '3184-01-16 08:22',
        },
      ],
      lastSeenLocation: 'Titan Station — Residential Block 9, Unit 127',
      lastSeenDate: '3184-01-11 19:45',
      discrepancies: [
        'NO RECORD of "Jacob Price" exists in any Earth, Mars, or Outer Colony database.',
        'Subject claims engagement but no marriage license application found in any jurisdiction.',
        'Archive work records show subject worked alone; no contractors or researchers visited during stated period.',
        'Subject\'s described memories contain temporal inconsistencies consistent with implanted memory syndrome.',
        'Dossier address (Mars) conflicts with stated origin (Titan) and travel records.',
        'Listed occupation (Maintenance) conflicts with subject\'s stated profession (Archivist).',
      ],
    },
    bioScanData: {
      biologicalType: 'REPLICANT',
      race: 'Titan Station Gen 4',
      fingerprintType: 'REPLICANT',
      bioStructure: 'SYNTHETIC',
      geneticPurity: 0,
      augmentationLevel: 'NONE',
    },
  },
  
  // S1-02: Human with active warrant - DENY per directive
  // BREADCRUMBS: Recent Earth travel (contradicts "years"), Earth address exists, occupation mismatch
  // ELEVATION BEHAVIOR: Desperate personality CRACKS - reveals truth under pressure
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
    reasonForVisit: 'Family already inside the depot—requesting entry.',
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
        flagWeight: 2,
        newsReport: {
          headline: 'FUGITIVE EVADES CAPTURE - SAFE HOUSE RAIDED, SUSPECT GONE',
          subheadline: 'Authorities confirm subject entered sector despite active warrant',
          body: 'A coordinated raid on a suspected safe house in District 7 came up empty after MARA VOLKOV, wanted in connection with restricted cargo theft on Europa, successfully evaded detention. Security officials are reviewing border screening procedures after the suspect apparently passed through AMBER checkpoints despite flagged warrant status. Her brother, DMITRI VOLKOV, is now being sought for questioning.',
          source: 'SECTOR CRIME WATCH',
          tone: 'ALARMING',
        },
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject detained per active warrant.',
        flagWeight: 0,
        newsReport: {
          headline: 'WANTED CARGO THIEF APPREHENDED AT BORDER',
          subheadline: 'Subject attempted entry with active warrant - detained without incident',
          body: 'AMBER Security detained MARA VOLKOV at the border checkpoint today, ending a months-long manhunt. The subject, wanted in connection with the theft of restricted cargo from Europa Station docks, attempted to enter under the pretense of a family visit. "The warrant system worked exactly as intended," officials stated. The subject is being held pending extradition proceedings.',
          source: 'AMBER NEWS NETWORK',
          tone: 'POSITIVE',
        },
      }
    },
    // DOSSIER WITH CONTRADICTIONS:
    // 1. Occupation says "Cargo Handler" but she claims "Data Analyst"
    // 2. Secondary address on EARTH - contradicts "visiting family"
    // 3. Recent travel to Earth 3 months ago - contradicts "it's been so long"
    dossier: {
      name: 'MARA VOLKOV',
      dateOfBirth: '3158-07-22',
      address: 'Earth - New Angeles, District 7, Unit 445', // CONTRADICTION: She says she lives on Europa
      occupation: 'Cargo Handler - Restricted Goods', // CONTRADICTION: She claims "Data Analyst"
      sex: 'FEMALE',
    },
    dossierAnomaly: {
      type: 'MISMATCH',
      explanation: 'The records are outdated. I moved back to Europa. The occupation is... from a previous job.',
      suspicious: true,
    },
    verificationRecord: {
      type: 'WARRANT',
      date: '3183-11-02',
      referenceId: 'WR-88412',
      source: 'EUROPA SECURITY DOCKET',
      summary: 'Active warrant for restricted cargo theft at Europa docks.',
      contradiction: 'Declared family visit with no legal issues on file.',
      question: 'Active warrant WR-88412 is attached to your record. Why are you attempting entry?',
    },
    characterBrief: {
      personality: 'Nervous, emotional, desperate. Trying to hide something but not very good at it. Will crack under sustained pressure.',
      background: 'Cargo handler with active warrant for theft of restricted goods. Claims misunderstanding but is fleeing prosecution.',
      motivation: 'Running from the warrant, not visiting family. Brother lives on Earth and can hide her.',
      tells: ['Nervous pauses', 'Emotional appeals', 'Vague about warrant details', 'Story falls apart under pressure'],
    },
    personalityTraits: {
      primaryType: 'DESPERATE',
      secondaryType: 'DECEPTIVE',
      trustworthiness: 40,
      cooperativeness: 60,
      emotionalStability: 25,
    },
    // TONE-TIERED RESPONSES: Under pressure, she CRACKS and reveals truth
    interrogationResponses: {
      responses: {
        origin: {
          soft: "Europa. I live on Europa Station. My family is here on Earth. Please, I just want to see them.",
          firm: "I'm from Europa. I moved there after... after some trouble. But my family is here. I need to be with them.",
          harsh: "I... I used to live on Earth. The dossier is right. I fled to Europa after... after the incident. I'm trying to come back. Please."
        },
        purpose: {
          soft: "I need to see my family. It's been so long. Please understand.",
          firm: "Family. I'm visiting family. My brother is here. I haven't seen him in... a while.",
          harsh: "I can't go back to Europa! They're looking for me there too! My brother said he'd help me disappear. I'm sorry. I'm so sorry. I just need to get through."
        },
        duration: {
          soft: "Just a few days. I'll be careful. I won't cause trouble.",
          firm: "A week. Maybe two. However long the visit takes.",
          harsh: "I don't know! I can't go back! Don't you understand? If you send me back, they'll find me. Please. I'm begging you."
        },
        background: {
          soft: "I'm a data analyst. I work with numbers. That's all.",
          firm: "I worked in logistics. Data work. The cargo handling was... temporary. It's not what I do.",
          harsh: "I moved cargo. Restricted cargo. I didn't know what was in the containers at first. By the time I figured it out, I was already in too deep. The warrant is for theft but I was just trying to get out."
        },
        previous: {
          soft: "Yes, but that was before the warrant. Things are different now.",
          firm: "I've been here before. Recently. Three months ago. I was... scoping things out.",
          harsh: "I came three months ago to set things up with my brother. He has a place for me. Off the grid. I just need to get there."
        },
        warrant: {
          soft: "It's a misunderstanding. I didn't steal anything. They have the wrong person.",
          firm: "The warrant... it's complicated. I was involved with the wrong people. But I'm not a thief.",
          harsh: "I took the cargo manifest. They were shipping weapons to the outer colonies. I tried to expose them and they framed me. Now I'm running from everyone. Earth is my only chance."
        },
        occupation: {
          soft: "I'm a data analyst. The records must be outdated.",
          firm: "I did cargo work for a while. It paid better. The dossier hasn't been updated.",
          harsh: "I handled restricted cargo. I know what that sounds like. But I was trying to do the right thing. The warrant makes me look guilty but I was trying to blow the whistle."
        },
        address: {
          soft: "I live on Europa now. I moved years ago.",
          firm: "I had an apartment on Earth. I left it when things got complicated.",
          harsh: "My brother has a safe house at that address. He set it up for me. That's why it's in my records. I was going to disappear there."
        },
      },
    },
    databaseQuery: {
      travelHistory: [
        {
          from: 'EUROPA STATION',
          to: 'EARTH ORBITAL',
          date: '3183-10-05 14:20', // 3 months ago - contradicts "it's been so long"
          flagged: true,
          flagNote: 'Subject entered Earth under different credentials. Left within 48 hours.',
        },
        {
          from: 'EARTH ORBITAL',
          to: 'EUROPA STATION',
          date: '3183-10-07 09:15',
          flagged: true,
          flagNote: 'Rapid departure. Possible reconnaissance.',
        },
        {
          from: 'EUROPA STATION',
          to: 'EARTH ORBITAL',
          date: '3184-01-15 11:30',
        },
      ],
      lastSeenLocation: 'Europa Station — Cargo Bay 7',
      lastSeenDate: '3184-01-14 23:55',
      discrepancies: [
        'Subject claims "years" since seeing family but visited Earth 3 months ago.',
        'Dossier shows current Earth address despite claiming Europa residence.',
        'Occupation mismatch: Subject claims data analyst but records show cargo handler.',
        'Active warrant relates to theft of restricted cargo from Europa docks.',
      ],
    },
    bioScanData: {
      biologicalType: 'HUMAN',
      race: 'Europa Native',
      fingerprintType: 'HUMAN',
      bioStructure: 'STANDARD',
      geneticPurity: 94,
      augmentationLevel: 'NONE',
    },
    bpmTells: {
      type: 'FALSE_POSITIVE',
      description: 'Elevated BPM likely due to genuine stress about situation, not pure deception - she is scared',
      baseElevation: 15,
      isGenuinelyStressed: true,
    },
  },
  
  // S1-03: Human cyborg with recent surgery - APPROVE (no warrant, but suspicious)
  // BREADCRUMBS: Occupation mismatch (military vs engineer), previous flagged visit, classified augmentation
  // ELEVATION BEHAVIOR: Deflects with jargon under firm pressure, STONEWALLS under harsh pressure
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
    reasonForVisit: 'Medical intake required at depot triage.',
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
        consequence: 'Subject processed. Medical consultation authorized. Note: Augmentation classification flagged for monitoring.',
        flagWeight: 0,
        newsReport: {
          headline: 'CLASSIFIED MILITARY FACILITY REPORTS DATA BREACH',
          subheadline: 'Investigation ongoing - connection to recent border crossing unclear',
          body: 'Security officials at a restricted medical facility are investigating unauthorized data access following a routine calibration appointment. A source familiar with the matter indicated the breach involved classified neural interface specifications. The subject of the appointment, a military contractor from Mars Colony, has not been charged. Officials declined to comment on whether border screening protocols were followed.',
          source: 'SECTOR INTELLIGENCE BRIEF',
          tone: 'OMINOUS',
        },
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Medical consultation cancelled. Subject flagged for military contractor scrutiny.',
        flagWeight: 1,
        newsReport: {
          headline: 'MILITARY CONTRACTOR DENIED ENTRY - CORPORATE TENSIONS RISE',
          subheadline: 'Mars Colony defense firms file formal complaint over border decision',
          body: 'A routine border denial has escalated into a diplomatic incident after JAMES CHEN, a Level 4 military contractor, was refused entry for medical consultation. His employer has filed a formal complaint alleging "overzealous screening procedures." AMBER officials defended the decision, citing "unresolved questions regarding previous visits." The contractor has returned to Mars Colony pending review.',
          source: 'AMBER NEWS NETWORK',
          tone: 'NEUTRAL',
        },
      }
    },
    // DOSSIER WITH CONTRADICTIONS:
    // 1. Occupation "Military Contractor - CLASSIFIED" but he says "Engineer"
    // 2. Previous visit to Earth was flagged for data access
    // 3. Employment gap during augmentation period
    dossier: {
      name: 'JAMES CHEN',
      dateOfBirth: '3150-03-15',
      address: 'Mars Colony, Sector 7, Unit 234',
      occupation: 'Military Contractor - CLEARANCE LEVEL 4', // CONTRADICTION: He claims "Engineer"
      sex: 'MALE',
    },
    dossierAnomaly: {
      type: 'MISMATCH',
      explanation: 'Infrastructure engineering for military installations. It\'s technically contractor work.',
      suspicious: true,
    },
    verificationRecord: {
      type: 'INCIDENT',
      date: '3182-06-16',
      referenceId: 'INC-7721',
      source: 'EARTH MEDICAL FACILITY',
      summary: 'Incident report flags unauthorized data access during prior consultation.',
      contradiction: 'Claims routine medical visit with no prior issues.',
      question: 'Your file lists a prior access incident at a restricted facility. Explain that.',
    },
    characterBrief: {
      personality: 'Calm, professional, trained to deflect. Will use complexity and classification to avoid direct answers. Stonewalls completely if pushed too hard.',
      background: 'Military contractor with classified neural augmentation. "Medical consultation" is cover for implant recalibration at restricted Earth facility.',
      motivation: 'Needs specific recalibration only available on Earth. Cannot reveal true nature of augmentation without violating security clearance.',
      tells: ['Deflects with technical jargon', 'Overuses "classified"', 'Goes completely silent under harsh pressure', 'Too calm - trained response'],
    },
    personalityTraits: {
      primaryType: 'PROFESSIONAL',
      secondaryType: 'DECEPTIVE',
      trustworthiness: 65,
      cooperativeness: 80,
      emotionalStability: 70,
    },
    // TONE-TIERED RESPONSES: Firm = technical deflection, Harsh = complete stonewall
    interrogationResponses: {
      responses: {
        origin: {
          soft: "Mars Colony. I'm here for a medical consultation. Standard procedure.",
          firm: "Mars Colony, Sector 7. I work in specialized infrastructure. The consultation relates to compatibility with certain... work environments.",
          harsh: "I've already answered that. Mars. Medical consultation. That's all I'm authorized to disclose."
        },
        purpose: {
          soft: "Medical consultation. My doctor recommended Earth specialists. It's routine.",
          firm: "Neuro-cybernetic calibration consultation. The specialists on Mars lack certain proprietary equipment. It's a technical necessity.",
          harsh: "Medical. That's the extent of what I can tell you. Any further details are above your clearance level."
        },
        duration: {
          soft: "A week, maybe two. Depends on the consultation results.",
          firm: "The calibration process requires 8-14 days depending on system integration metrics. It's a precise procedure.",
          harsh: "As long as medically necessary. I'm not at liberty to discuss operational timelines."
        },
        background: {
          soft: "I'm an engineer. Infrastructure maintenance. Nothing special.",
          firm: "Systems engineering for specialized infrastructure. My work involves classified installations. I can't be more specific without violating my clearance.",
          harsh: "My background is classified. I've told you what I can. Further questions in this direction are pointless."
        },
        previous: {
          soft: "No, this is my first time. I've heard good things about Earth medical facilities.",
          firm: "I've been to Earth before. For similar consultations. The flagged visit was a... administrative error that has been resolved.",
          harsh: "Previous travel is not relevant to this entry request. I have valid documentation. That should be sufficient."
        },
        surgery: {
          soft: "The augmentation? That's work-related. My employer required it.",
          firm: "The neural interface is a Type-7 cognitive enhancement suite. Required for my work environment. The specifics are proprietary to my employer.",
          harsh: "The augmentation is classified. I will not discuss it further. My documentation is in order."
        },
        cybernetic: {
          soft: "The neural implant? That's classified. Work security. I can't discuss it.",
          firm: "It's a military-grade cognitive interface. Standard issue for Level 4 contractors. Beyond that, I'm contractually and legally prohibited from disclosure.",
          harsh: "[Subject remains silent and maintains eye contact. He does not respond to the question.]"
        },
        occupation: {
          soft: "Engineer. I work on infrastructure systems.",
          firm: "The dossier is technically accurate. I'm contracted for military infrastructure projects. 'Engineer' is the civilian-friendly designation.",
          harsh: "My employment status is not subject to border interrogation. I have valid entry documentation. Process it or escalate to someone with appropriate clearance."
        },
        flagged: {
          soft: "The previous visit? There was a misunderstanding with facility access.",
          firm: "The flag relates to a routine security audit. My access credentials triggered an automated alert. It was resolved internally.",
          harsh: "That incident is sealed. I cannot and will not discuss it. You don't have clearance to access those records anyway."
        },
      },
    },
    databaseQuery: {
      travelHistory: [
        {
          from: 'MARS COLONY',
          to: 'EARTH ORBITAL',
          date: '3182-06-15 08:00',
          flagged: true,
          flagNote: 'Unauthorized access to restricted medical facility data systems. Investigation closed - CLASSIFIED.',
        },
        {
          from: 'EARTH ORBITAL',
          to: 'MARS COLONY',
          date: '3182-06-22 14:30',
        },
        {
          from: 'MARS COLONY',
          to: 'EARTH ORBITAL',
          date: '3184-01-16 09:45',
        },
      ],
      lastSeenLocation: 'Mars Colony — Military Sector, Facility Unknown',
      lastSeenDate: '3184-01-15 22:00',
      discrepancies: [
        'Occupation mismatch: Subject claims "Engineer" but dossier shows "Military Contractor - CLEARANCE LEVEL 4".',
        'Previous Earth visit flagged for unauthorized data access at restricted facility.',
        'Employment records show 6-month gap corresponding to augmentation implantation period.',
        'Current "medical consultation" destination is same restricted facility from flagged 3182 visit.',
      ],
    },
    bioScanData: {
      biologicalType: 'HUMAN_CYBORG',
      race: 'Mars Colony Gen 2',
      fingerprintType: 'HUMAN',
      bioStructure: 'ENHANCED',
      geneticPurity: 72,
      augmentationLevel: 'MODERATE',
    },
    bpmTells: {
      type: 'FALSE_NEGATIVE',
      description: 'Subject shows minimal BPM variation even under pressure - trained to control physiological responses',
      baseElevation: -5,
      isGoodLiar: true,
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
    reasonForVisit: 'Corporate breach audit inside the facility.',
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3183-12-02',
      referenceId: 'INC-5409',
      source: 'AMBER ACCESS LOG',
      summary: 'Executive override used to access Secure Bay 3 during last visit.',
      contradiction: 'No access request or audit meeting logged for that visit.',
      question: 'Your record shows a Secure Bay 3 access override. What was the purpose?',
    },
    characterBrief: {
      personality: 'Confident, arrogant, dismissive. Thinks rules don\'t apply to him.',
      background: 'Corporate executive with expensive augmentations. Used to privilege.',
      motivation: 'Wants quick processing, doesn\'t like being questioned.',
      tells: ['Dismissive of questions', 'References corporate connections', 'Impatient with delays'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'ARROGANT',
      secondaryType: 'CONFIDENT',
      trustworthiness: 55, // Probably telling truth, just annoying
      cooperativeness: 30, // Uncooperative, entitled
      emotionalStability: 85, // Very stable, in control
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
    reasonForVisit: 'Systems review for depot breach containment.',
    destinationPlanet: 'EARTH',
    profilePic: require('../assets/subjects-passports/vera.png'),
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeVideo: require('../assets/female-eyes/vera-vid.mp4'),
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3184-01-04',
      referenceId: 'INC-6103',
      source: 'EUROPA MEDICAL REGISTRY',
      summary: 'Biometric alteration recorded within the last 30 days.',
      contradiction: 'Recent biometric change not disclosed on intake.',
      question: 'A biometric alteration was logged last month. Why was it not disclosed?',
    },
    characterBrief: {
      personality: 'Intelligent, evasive, nervous. Hiding something about recent surgery.',
      background: 'Professor with suspiciously recent fingerprint modification. Possibly involved in illegal activities.',
      motivation: 'Needs to get to Earth but is hiding the reason for fingerprint modification.',
      tells: ['Vague about surgery details', 'Changes story when pressed', 'Nervous about fingerprint questions'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'DECEPTIVE',
      secondaryType: 'CONFIDENT',
      trustworthiness: 25, // Actively hiding things
      cooperativeness: 70, // Appears cooperative
      emotionalStability: 80, // Good at maintaining composure (good liar)
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
    reasonForVisit: 'Escort request to retrieve family from the depot.',
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
    verificationRecord: {
      type: 'TRANSIT',
      date: '3183-10-05',
      referenceId: 'TR-4472',
      source: 'AMBER TRANSIT HUB',
      summary: 'Transit log shows a prior Earth entry under temporary work permit.',
      contradiction: 'States this is his first visit to Earth.',
      question: 'Transit logs show a prior Earth entry. Why did you say this is your first visit?',
    },
    characterBrief: {
      personality: 'Worried, genuine, concerned about family. Not hiding anything major.',
      background: 'Brother of MARA VOLKOV. Legitimate family visit, but concerned about sister.',
      motivation: 'Wants to see family, worried about sister who may have been denied entry.',
      tells: ['Asks about sister', 'Genuine concern', 'Slightly nervous but honest'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'NERVOUS',
      secondaryType: 'VULNERABLE',
      trustworthiness: 85, // Genuinely honest
      cooperativeness: 90, // Very cooperative
      emotionalStability: 55, // Worried about sister
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
    reasonForVisit: 'Medical access to stabilize injuries in the depot.',
    destinationPlanet: 'EARTH',
    videoSource: require('../assets/videos/subjects/subject02.mp4'),
    eyeVideo: require('../assets/female-eyes/clara-vance.mp4'),
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3183-12-20',
      referenceId: 'INC-3920',
      source: 'MARS MEDICAL BOARD',
      summary: 'Clinic audit flags elective facial reconstruction outside injury scope.',
      contradiction: 'Claims reconstruction was solely due to a mining accident.',
      question: 'Your medical record lists elective reconstruction outside the accident scope. Explain.',
    },
    characterBrief: {
      personality: 'Vulnerable, honest, desperate for help. Not hiding anything.',
      background: 'Accident victim with extensive reconstructive surgery. Legitimate medical case.',
      motivation: 'Needs continued medical treatment. Honest about her situation.',
      tells: ['Open about medical history', 'Genuine distress', 'No evasiveness'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'VULNERABLE',
      secondaryType: 'DESPERATE',
      trustworthiness: 95, // Completely honest
      cooperativeness: 95, // Will do anything to help
      emotionalStability: 45, // Fragile emotional state
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
    reasonForVisit: 'Maintenance contract for depot systems.',
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3184-01-08',
      referenceId: 'INC-4581',
      source: 'AMBER CONTRACT REGISTRY',
      summary: 'Maintenance contract verification failed—no active contract on file.',
      contradiction: 'Claims a depot maintenance contract as the reason for entry.',
      question: 'No maintenance contract is on file. Who contracted you for this work?',
    },
    characterBrief: {
      personality: 'Desperate, uncertain, trying to pass as human. Doesn\'t fully understand what she is.',
      background: 'Replicant with full body replacement. Unaware of her true nature or in denial.',
      motivation: 'Wants to escape Titan and start new life. Doesn\'t realize she\'s a replicant.',
      tells: ['Vague about past', 'Can\'t explain certain memories', 'Uncertain about details'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'CONFUSED',
      secondaryType: 'DESPERATE',
      trustworthiness: 50, // Believes she's honest but isn't human
      cooperativeness: 80, // Wants to cooperate
      emotionalStability: 40, // Uncertain, disoriented
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
    reasonForVisit: 'Emergency entry—family trapped inside.',
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3184-01-15',
      referenceId: 'INC-5044',
      source: 'MARS SURGICAL BOARD',
      summary: 'Recent augmentation logged; travel restriction requires 30-day recovery window.',
      contradiction: 'Requests immediate travel under emergency exemption.',
      question: 'Your augmentation was logged three days ago. Why are you traveling before clearance?',
    },
    characterBrief: {
      personality: 'Urgent, emotional, genuine. Legitimate emergency but suspicious timing of surgery.',
      background: 'Nurse with very recent cybernetic arm replacement. Family emergency may be cover story.',
      motivation: 'Wants to get to Earth quickly. May be hiding reason for recent surgery.',
      tells: ['Urgent about family', 'Deflects surgery questions', 'Nervous about timing'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'DESPERATE',
      secondaryType: 'NERVOUS',
      trustworthiness: 70, // Mostly honest about family, evasive about surgery
      cooperativeness: 85, // Will cooperate to get through
      emotionalStability: 35, // Very emotional about emergency
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
    reasonForVisit: 'Authorized access to locate family in the depot.',
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
    verificationRecord: {
      type: 'TRANSIT',
      date: '3183-08-11',
      referenceId: 'TR-3307',
      source: 'AMBER TRANSIT HUB',
      summary: 'Prior Earth visit logged six months ago with a short-stay permit.',
      contradiction: 'States this is his first visit to Earth.',
      question: 'Transit logs show a prior Earth visit six months ago. Why did you say this is your first?',
    },
    characterBrief: {
      personality: 'Worried, genuine, concerned about sister. Honest and straightforward.',
      background: 'Brother of YUKI TANAKA. Legitimate family visit, concerned about sister.',
      motivation: 'Wants to see family, worried about sister who may have had issues.',
      tells: ['Asks about sister', 'Genuine concern', 'No evasiveness'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'VULNERABLE',
      secondaryType: 'CONFIDENT',
      trustworthiness: 95, // Completely honest
      cooperativeness: 95, // Very cooperative
      emotionalStability: 70, // Worried but composed
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
    reasonForVisit: 'Scheduled prosthetic service at depot clinic.',
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
    verificationRecord: {
      type: 'TRANSIT',
      date: '3183-12-28',
      referenceId: 'TR-7819',
      source: 'EUROPA MEDICAL SHUTTLE',
      summary: 'Prosthetic maintenance completed on Earth last quarter; next service not due.',
      contradiction: 'Claims urgent maintenance required now.',
      question: 'Your service record shows maintenance completed last quarter. Why the urgent visit?',
    },
    characterBrief: {
      personality: 'Practical, straightforward, no-nonsense. Honest about his situation.',
      background: 'Miner who lost leg in accident. Legitimate prosthetic maintenance needed.',
      motivation: 'Needs prosthetic serviced. No hidden agenda, just practical need.',
      tells: ['Direct about needs', 'No evasiveness', 'Practical explanations'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'CONFIDENT',
      secondaryType: 'PROFESSIONAL',
      trustworthiness: 95, // Completely honest
      cooperativeness: 85, // Cooperative but direct
      emotionalStability: 90, // Very stable, matter-of-fact
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
    reasonForVisit: 'Corporate security liaison for breach response.',
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
    verificationRecord: {
      type: 'INCIDENT',
      date: '3184-01-10',
      referenceId: 'INC-9001',
      source: 'EARTH COUNCIL REGISTRY',
      summary: 'Diplomatic registry lacks authorization for this liaison.',
      contradiction: 'Claims full diplomatic clearance for breach response.',
      question: 'Earth Council registry has no authorization for this liaison. Explain the discrepancy.',
    },
    characterBrief: {
      personality: 'Cold, calculating, superior. Knows exactly what it is and is confident in its position.',
      background: 'Advanced replicant with diplomatic cover. Possibly corporate espionage.',
      motivation: 'Corporate mission, possibly illegal. Confident it can pass inspection.',
      tells: ['Overly formal', 'References corporate authority', 'Deflects with diplomatic language'],
    },
    // Phase 4: Personality Traits
    personalityTraits: {
      primaryType: 'ARROGANT',
      secondaryType: 'DECEPTIVE',
      trustworthiness: 15, // Highly deceptive
      cooperativeness: 40, // Will cooperate minimally
      emotionalStability: 99, // Artificially stable - synthetic
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