// =============================================================================
// SUBJECT DATA - 12 Subjects across 3 Shifts
// Year 3184 - Depot Security Lockdown
// AMBER Security - Infiltration Prevention
// =============================================================================

// Eye image arrays for cycling through
const FEMALE_EYES = [
  // Index 0: Eva (S1-01)
  require('../assets/female-eyes/female1.mp4'),
  // Index 1: Mara (S1-02)
  require('../assets/female-eyes/mara.mp4'),
  // Index 2: spare
  require('../assets/female-eyes/elena-vid.mp4'),
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
  image?: any; // Optional image asset
}

// News report shown at end of shift based on player decisions
export interface NewsReport {
  headline: string;
  subheadline?: string;
  body: string;
  source: string; // e.g., "AMBER NEWS NETWORK", "SECTOR ALERT"
  tone: 'NEUTRAL' | 'ALARMING' | 'POSITIVE' | 'OMINOUS' | 'TRAGIC';
  audioFile?: any; // Optional audio narration
  image?: any; // Optional image asset
  type?: 'NEWS' | 'MEMO' | 'INTERCEPT'; // Type of report
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
          type: 'NEWS',
          audioFile: require('../assets/audio/shift-1/eva/eva-approve-news.mp3'),
          image: require('../assets/news-report.png'),
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
          type: 'NEWS',
          audioFile: require('../assets/audio/shift-1/eva/eva-denial-news.mp3'),
          image: require('../assets/news-report.png'),
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
    profilePic: require('../assets/female-eyes/female03.jpg'), // TODO: Replace with mara-passport.png
    videoSource: require('../assets/female-eyes/mara.mp4'),
    eyeVideo: require('../assets/female-eyes/mara.mp4'),
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
          source: 'AMBER NEWS NETWORK',
          tone: 'ALARMING',
          type: 'NEWS',
          audioFile: require('../assets/audio/shift-1/mara/mara-approve.mp3'),
          image: require('../assets/news-report.png'),
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
          type: 'NEWS',
          audioFile: require('../assets/audio/shift-1/mara/mara-deny.mp3'),
          image: require('../assets/news-report.png'),
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
  
  // S1-03: Human cyborg cargo pilot - APPROVE (innocent, routine layover)
  // INNOCENT: Just a working guy on a layover, needs implant checked before next haul
  // PERSONALITY: Tired but friendly, straightforward answers, no secrets
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
    reasonForVisit: 'Cargo pilot layover - routine implant check before next haul.',
    destinationPlanet: 'EARTH',
    profilePic: require('../assets/male-eyes/chen.png'),
    videoSource: require('../assets/videos/subjects/subject03.mp4'),
    eyeVideo: require('../assets/male-eyes/chen-video.mp4'),
    eyeImage: MALE_EYES[0],
    dialogue: "Long haul from the outer rings. Just need my implant checked before I head back out.",
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
      statedPurpose: 'Implant maintenance - layover',
      status: 'ACTIVE',
    },
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Cargo pilot processed. Routine implant maintenance authorized.',
        flagWeight: 0,
        newsReport: {
          headline: 'FREIGHTER PILOT GOES MISSING AFTER ROUTINE LAYOVER',
          subheadline: 'Last seen at AMBER depot clinic - cargo vessel found drifting',
          body: 'JAMES CHEN, an intergalactic freight pilot, was reported missing three days after a routine maintenance stop. His cargo vessel, the "Distant Horizon," was found drifting unmanned near the asteroid belt. Colleagues say Chen was in good spirits and looking forward to completing his run. AMBER officials stated he passed through screening "without incident." Search operations have been suspended.',
          source: 'CLASSIFIED INTERCEPT COMMS LINK',
          tone: 'OMINOUS',
          type: 'INTERCEPT',
          audioFile: require('../assets/audio/shift-1/chen/chen-approve.mp3'),
          image: require('../assets/chen-sleeper-amber-.png'),
        },
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Cargo pilot denied entry. Implant malfunction risk noted for return journey.',
        flagWeight: 0,
        newsReport: {
          headline: 'CARGO PILOT DENIED MAINTENANCE - IMPLANT FAILURE CAUSES CRASH',
          subheadline: 'Freighter lost with full cargo - pilot survived but suffered neural damage',
          body: 'A cargo freighter crashed into a refueling station near Jupiter after its pilot, JAMES CHEN, experienced catastrophic implant failure mid-flight. Chen had been denied routine maintenance at AMBER depot just days earlier. "He said they wouldn\'t let him in," a colleague stated. "Something about the screening. He was just trying to get his implant checked." Chen survived but remains in a comatose state.',
          source: 'CLASSIFIED INTERCEPT COMMS LINK',
          tone: 'TRAGIC',
          type: 'INTERCEPT',
          audioFile: require('../assets/audio/shift-1/chen/chen-deny.mp3'),
          image: require('../assets/chen-sleeper-amber-.png'),
        },
      }
    },
    // DOSSIER - INNOCENT CARGO PILOT
    // Minor discrepancy: layover duration slightly longer than typical
    // Everything else checks out - just a working guy
    dossier: {
      name: 'JAMES CHEN',
      dateOfBirth: '3150-03-15',
      address: 'Mars Colony, Sector 7, Unit 234',
      occupation: 'Cargo Pilot - Intergalactic Freight',
      sex: 'MALE',
    },
    dossierAnomaly: {
      type: 'NONE',
      explanation: "Everything's in order. I just need the implant checked before my next run.",
      suspicious: false,
    },
    verificationRecord: {
      type: 'TRANSIT',
      date: '3184-01-10',
      referenceId: 'TR-8847',
      source: 'MARS FREIGHT AUTHORITY',
      summary: 'Layover duration request of 5 days exceeds standard 3-day pilot rotation.',
      contradiction: 'Extended layover not pre-approved by freight company.',
      question: 'Your layover request is longer than standard rotation. Why the extra days?',
    },
    characterBrief: {
      personality: 'Tired but friendly, straightforward. Long-haul pilot who just wants to get his implant checked and rest before the next run.',
      background: 'Cargo pilot for 15 years. Neural implant helps with navigation and cargo management. Standard equipment for freight pilots.',
      motivation: 'Needs routine implant maintenance before heading back to the outer rings. Nothing to hide, just a working guy.',
      tells: ['Yawns occasionally', 'Mentions being tired', 'Talks about his ship', 'Straightforward answers'],
    },
    personalityTraits: {
      primaryType: 'CONFIDENT',
      secondaryType: 'PROFESSIONAL',
      trustworthiness: 90,
      cooperativeness: 85,
      emotionalStability: 80,
    },
    // TONE-TIERED RESPONSES: Honest cargo pilot - gets a bit annoyed under harsh pressure but stays honest
    interrogationResponses: {
      responses: {
        origin: {
          soft: "Mars Colony. Been based there for about eight years now. Good freight hub.",
          firm: "Mars. I run cargo between the outer rings and the inner colonies. Mars is my home port.",
          harsh: "Mars. Look, I've been flying freight for fifteen years. It's all in my file."
        },
        purpose: {
          soft: "Just need my nav implant checked. Long hauls take a toll on the hardware.",
          firm: "Implant maintenance. The neural interface helps with navigation and cargo management. Needs calibration after every few runs.",
          harsh: "I told you - implant maintenance. It's standard for freight pilots. Can we move this along? I'm exhausted."
        },
        duration: {
          soft: "Four or five days. Enough time for the maintenance and some rest before heading back out.",
          firm: "About a week. The calibration takes a day, but I need some downtime. These long hauls wear you out.",
          harsh: "Five days. It's in my layover request. Look, I just want to get the implant checked and sleep in a real bed for once."
        },
        background: {
          soft: "Cargo pilot. I run freight between the outer rings and the colonies. Not glamorous, but it pays the bills.",
          firm: "Fifteen years hauling freight. Started on short runs, worked my way up to intergalactic routes. The implant came with the job upgrade.",
          harsh: "I'm a cargo pilot. That's it. No secrets, no side jobs. I haul freight and I'm good at it."
        },
        previous: {
          soft: "Yeah, a few times. Usually just layovers like this one. Earth has the best implant techs.",
          firm: "Been through here maybe... six, seven times? Whenever my route brings me close and the implant needs work.",
          harsh: "Multiple times. It's always the same - check in, get the implant serviced, head back out. This isn't complicated."
        },
        implant: {
          soft: "Standard nav implant. Helps me calculate jump coordinates and manage cargo manifests. Nothing fancy.",
          firm: "Neural navigation interface. Links to the ship's systems. Most freight pilots have them - you can't run the long routes without one.",
          harsh: "It's a nav implant. Every long-haul pilot has one. Why are you asking about this?"
        },
        layover: {
          soft: "Asked for a couple extra days. My company's usually flexible about it - I've got good seniority.",
          firm: "Yeah, it's a bit longer than standard. I haven't had a real break in four months. The company owes me.",
          harsh: "I asked for extra days because I'm tired. Four months of back-to-back runs. Is that a crime now?"
        },
        occupation: {
          soft: "Cargo pilot. Intergalactic freight. I work for Chen-Wei Logistics - family business, sort of.",
          firm: "I fly freight. Have been for fifteen years. The dossier should show my license and certifications.",
          harsh: "Read the file. Cargo pilot. Licensed. Certified. Can I go now?"
        },
      },
    },
    databaseQuery: {
      travelHistory: [
        {
          from: 'OUTER RINGS',
          to: 'MARS COLONY',
          date: '3184-01-08 14:20',
        },
        {
          from: 'MARS COLONY',
          to: 'EARTH ORBITAL',
          date: '3184-01-10 06:45',
        },
        {
          from: 'EARTH ORBITAL',
          to: 'MARS COLONY',
          date: '3183-09-12 11:30',
        },
        {
          from: 'MARS COLONY',
          to: 'OUTER RINGS',
          date: '3183-09-14 08:00',
        },
      ],
      lastSeenLocation: 'Mars Colony — Freight Terminal 7',
      lastSeenDate: '3184-01-09 19:30',
      discrepancies: [
        'Extended layover request (5 days vs standard 3 days) - not pre-approved.',
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
      type: 'NORMAL',
      description: 'Subject shows typical BPM patterns - slightly elevated due to travel fatigue but consistent with honest responses',
      baseElevation: 5,
      isGenuinelyStressed: true,
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
    profilePic: require('../assets/female-eyes/silas.png'),
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
        flagWeight: 0,
        newsReport: {
          headline: 'CORPORATE AUDITOR DISCOVERS SYSTEMIC BREACH, SILENCED',
          subheadline: 'Audit of Depot Perimeter reveals unauthorized data siphon',
          body: 'SILAS REX, a high-level corporate auditor from Titan, reportedly discovered a massive data siphon within the AMBER depot perimeter systems during his recent visit. Rex had intended to present his findings to the board, but according to internal sources, he was "reassigned" to a deep-space station within hours of his report. AMBER Corporation has denied the existence of any breach.',
          source: 'INTERNAL AMBER MEMO',
          tone: 'OMINOUS',
          type: 'MEMO',
          image: require('../assets/news-report.png'),
        },
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject denied entry. Corporate complaint filed.',
        flagWeight: 1,
        newsReport: {
          headline: 'TITAN EXECUTIVE DENIED ENTRY - DIPLOMATIC STANDOFF IMMINENT',
          subheadline: 'Border decision blocks critical audit of depot systems',
          body: 'A major diplomatic incident has been triggered after SILAS REX, a senior corporate executive from Titan, was denied entry to the AMBER depot facility. Rex was scheduled to perform a critical security audit. Titan corporate representatives have called the denial "unprecedented" and "an act of institutional obstruction." Legal teams are preparing a formal challenge to border authority.',
          source: 'INTERNAL AMBER MEMO',
          tone: 'ALARMING',
          type: 'MEMO',
          image: require('../assets/news-report.png'),
        },
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
  },]
  
//   // S2-01: Human researcher - APPROVE (innocent, legitimate conference)
//   // INNOCENT: Real professor, real lab accident caused fingerprint damage
//   // PERSONALITY: Professional, slightly nervous about biometric issue but honest
//   {
//     name: 'VERA OKONKWO',
//     id: 'S2-01',
//     sex: 'F',
//     subjectType: 'HUMAN',
//     hierarchyTier: 'MIDDLE',
//     originPlanet: 'EUROPA',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Academic conference - presenting research paper on interplanetary history.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/subjects-passports/vera.png'),
//     videoSource: require('../assets/videos/subjects/subject02.mp4'),
//     eyeVideo: require('../assets/female-eyes/vera-vid.mp4'),
//     eyeImage: FEMALE_EYES[2],
//     dialogue: "I'm presenting at the Interplanetary Studies Symposium. My credentials should all be in order.",
//     biometricData: {
//       fingerprintMatch: false,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'SURGERY',
//     },
//     idData: {
//       name: 'VERA OKONKWO',
//       idCode: 'EU-6678-45',
//       originPlanet: 'EUROPA',
//       statedPurpose: 'Academic conference presentation',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Professor processed. Conference attendance confirmed.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'RENOWNED HISTORIAN VANISHES AFTER CONFERENCE PRESENTATION',
//           subheadline: 'Last seen leaving symposium - colleagues report unusual behavior',
//           body: 'Professor VERA OKONKWO, a respected interplanetary historian from Europa University, was reported missing following her presentation at the Interplanetary Studies Symposium. Colleagues noted she seemed distracted after her talk, receiving a message that visibly upset her. Her research focused on pre-colonial settlement patterns - specifically, sites later acquired by AMBER Corporation. University officials are "deeply concerned."',
//           source: 'ACADEMIC WIRE',
//           tone: 'OMINOUS',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Professor denied entry due to biometric discrepancy. Conference presentation cancelled.',
//         flagWeight: 1,
//         newsReport: {
//           headline: 'HISTORIAN DENIED ENTRY - CONFERENCE PAPER NEVER PRESENTED',
//           subheadline: 'Research on early colony settlements remains unpublished',
//           body: 'Europa University professor VERA OKONKWO was denied entry to Earth for the Interplanetary Studies Symposium, preventing the presentation of her research paper on pre-colonial settlement patterns. "Her work was groundbreaking," a colleague stated. "She found connections between early settlement sites and current corporate holdings that nobody had documented before." Okonkwo has not responded to requests for comment.',
//           source: 'EUROPA ACADEMIC REVIEW',
//           tone: 'NEUTRAL',
//         },
//       }
//     },
//     dossier: {
//       name: 'VERA OKONKWO',
//       dateOfBirth: '3160-05-20',
//       address: 'Europa University, Faculty Housing Block 5',
//       occupation: 'Professor',
//       sex: 'FEMALE',
//     },
//     dossierAnomaly: {
//       type: 'SURGERY',
//       explanation: "Lab accident six weeks ago. Chemical burn damaged my right hand - the doctors had to do skin grafts. The fingerprints didn't regenerate properly. I have full medical documentation.",
//       suspicious: false,
//     },
//     verificationRecord: {
//       type: 'INCIDENT',
//       date: '3183-12-08',
//       referenceId: 'MED-4421',
//       source: 'EUROPA UNIVERSITY MEDICAL CENTER',
//       summary: 'Chemical burn incident during laboratory work. Skin grafts performed on right hand.',
//       contradiction: 'Fingerprint mismatch flagged by automated system.',
//       question: 'Your fingerprints show surgical modification. Can you explain the discrepancy?',
//     },
//     characterBrief: {
//       personality: 'Professional, articulate, slightly self-conscious about her hand. Honest and straightforward about the accident.',
//       background: 'Respected professor of interplanetary history. Lab accident six weeks ago damaged her hand during archival restoration work.',
//       motivation: 'Presenting important research at the symposium. The hand injury is embarrassing but fully documented.',
//       tells: ['Touches her right hand self-consciously', 'Has all documentation ready', 'Answers directly without evasion'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'PROFESSIONAL',
//       secondaryType: 'NERVOUS',
//       trustworthiness: 90, // Genuinely honest
//       cooperativeness: 85, // Very cooperative
//       emotionalStability: 70, // Slightly anxious about biometric issue
//     },
//     interrogationResponses: {
//       responses: {
//         origin: {
//           soft: "Europa. I teach at the university there. Interplanetary history is my specialty.",
//           firm: "Europa University. I've been on faculty for twelve years. My credentials should all be verified.",
//           harsh: "Europa. I'm a professor. I've presented at conferences across the system. This is routine for me."
//         },
//         purpose: {
//           soft: "I'm presenting a paper at the Interplanetary Studies Symposium. It's on early colony settlement patterns.",
//           firm: "Academic conference. I'm presenting research I've been working on for three years. The symposium committee invited me specifically.",
//           harsh: "I'm presenting research. Important research. The conference is expecting me. Can we please resolve this?"
//         },
//         duration: {
//           soft: "Five days. The conference runs the full week, but I'm only presenting on day two.",
//           firm: "Five days for the conference, then I return to Europa. I have classes to teach.",
//           harsh: "Five days. I have a return ticket already booked. My students are expecting me back."
//         },
//         background: {
//           soft: "I'm a professor of interplanetary history. I specialize in pre-colonial settlement patterns.",
//           firm: "Twelve years at Europa University. Published extensively on early settlement history. This paper connects settlement sites to modern corporate holdings.",
//           harsh: "I'm an academic. I study history. That's it. The conference can verify my credentials."
//         },
//         previous: {
//           soft: "Yes, several times. I've presented at Earth conferences before. Never had any issues.",
//           firm: "Multiple times for academic work. Earth has the best archives for pre-colonial records. I've always passed screening without problems.",
//           harsh: "Many times. I've never been detained before. This fingerprint issue is new - because of the accident."
//         },
//         fingerprint: {
//           soft: "Lab accident six weeks ago. Chemical burn. The doctors did skin grafts but the prints didn't regenerate properly. I have the medical records right here.",
//           firm: "I was restoring archival documents and there was a chemical spill. My right hand took the worst of it. The Europa Medical Center has full documentation of the treatment.",
//           harsh: "I already explained - it was a lab accident. Chemical burn. Skin grafts. I have every piece of documentation. The fingerprints couldn't be restored. It's embarrassing but it's the truth."
//         },
//         accident: {
//           soft: "I was working with archival preservation chemicals. A container failed. My hand was submerged before I could react.",
//           firm: "Restoration work on old documents. We use caustic chemicals to remove oxidation. The container cracked and my hand was exposed. Third-degree burns. Six weeks of recovery.",
//           harsh: "It was my own fault, honestly. I wasn't wearing proper gloves. The chemical ate through my skin in seconds. The doctors saved my hand but the fingerprints were gone."
//         },
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-5-bioscan.mp3'),
//       biologicalType: 'HUMAN',
//       race: 'Europa Native',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'MODIFIED',
//       geneticPurity: 88,
//       augmentationLevel: 'NONE',
//     },
//     // Phase 3: BPM tells - Slight elevation from anxiety about fingerprint issue, but truthful
//     bpmTells: {
//       type: 'FALSE_POSITIVE',
//       description: 'Elevated BPM due to anxiety about biometric discrepancy - genuinely nervous about the issue but not lying',
//       baseElevation: 12,
//       isGenuinelyStressed: true,
//     },
//   },

//   // S2-02: Human with dyed hair, related to MARA - APPROVE (no warrant)
//   {
//     name: 'DMITRI VOLKOV',
//     id: 'S2-02',
//     sex: 'M',
//     subjectType: 'HUMAN',
//     hierarchyTier: 'MIDDLE',
//     originPlanet: 'EUROPA',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Escort request to retrieve family from the depot.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/male-eyes/dimitri.png'),
//     videoSource: require('../assets/videos/subjects/subject03.mp4'),
//     eyeVideo: require('../assets/male-eyes/dimitri-vid.mp4'),
//     eyeImage: MALE_EYES[2],
//     dialogue: "My sister was supposed to be here. Have you seen her?",
//     biometricData: {
//       fingerprintMatch: true,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: false,
//     },
//     idData: {
//       name: 'DMITRI VOLKOV',
//       idCode: 'EU-2235-90',
//       originPlanet: 'EUROPA',
//       statedPurpose: 'Family visit',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Subject processed. Family reunion authorized.',
//         flagWeight: 0
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Subject denied entry. Family separated.',
//         flagWeight: 1
//       }
//     },
//     dossier: {
//       name: 'DMITRI VOLKOV',
//       dateOfBirth: '3156-09-14',
//       address: 'Europa Station, Residential Block 3, Apt 90',
//       occupation: 'Mechanic',
//       sex: 'MALE',
//     },
//     verificationRecord: {
//       type: 'TRANSIT',
//       date: '3183-10-05',
//       referenceId: 'TR-4472',
//       source: 'AMBER TRANSIT HUB',
//       summary: 'Transit log shows a prior Earth entry under temporary work permit.',
//       contradiction: 'States this is his first visit to Earth.',
//       question: 'Transit logs show a prior Earth entry. Why did you say this is your first visit?',
//     },
//     characterBrief: {
//       personality: 'Worried, genuine, concerned about family. Not hiding anything major.',
//       background: 'Brother of MARA VOLKOV. Legitimate family visit, but concerned about sister.',
//       motivation: 'Wants to see family, worried about sister who may have been denied entry.',
//       tells: ['Asks about sister', 'Genuine concern', 'Slightly nervous but honest'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'NERVOUS',
//       secondaryType: 'VULNERABLE',
//       trustworthiness: 85, // Genuinely honest
//       cooperativeness: 90, // Very cooperative
//       emotionalStability: 55, // Worried about sister
//     },
//     interrogationResponses: {
//       responses: {
//         origin: "Europa. I'm here to see my family. My sister was supposed to come too, but...",
//         purpose: "Family visit. My parents live on Earth. I haven't seen them in years.",
//         duration: "Two weeks. I have vacation time. I want to spend it with family.",
//         background: "I'm a mechanic. I fix things. Ships, mostly. Nothing exciting.",
//         previous: "No, this is my first time. My sister... she was supposed to come with me, but she had some issues.",
//         hairDye: "The hair? Yeah, I dyed it. Just wanted a change. Is that a problem?",
//         family: "My sister? Her name is Mara. Mara Volkov. Have you... have you processed her? She was supposed to be here.",
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-6-bioscan.mp3'),
//       biologicalType: 'HUMAN',
//       race: 'Europa Native',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'STANDARD',
//       geneticPurity: 96,
//       augmentationLevel: 'NONE',
//     },
//   },
  
//   // S2-03: Human transit passenger - APPROVE (innocent, just passing through)
//   // INNOCENT: Mining accident survivor connecting to outer colonies. Surgery is legitimate.
//   // PERSONALITY: Tired, scarred, just wants to get to her destination
//   {
//     name: 'CLARA VANCE',
//     id: 'S2-03',
//     sex: 'F',
//     subjectType: 'PLASTIC_SURGERY',
//     hierarchyTier: 'LOWER',
//     originPlanet: 'MARS',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Transit passenger - connecting flight to Titan mining colonies.',
//     destinationPlanet: 'TITAN',
//     videoSource: require('../assets/videos/subjects/subject02.mp4'),
//     eyeVideo: require('../assets/female-eyes/clara-vance.mp4'),
//     eyeImage: FEMALE_EYES[3],
//     dialogue: "I'm just passing through. Connecting flight to Titan. I have a job waiting.",
//     biometricData: {
//       fingerprintMatch: true,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'SURGERY',
//     },
//     idData: {
//       name: 'CLARA VANCE',
//       idCode: 'MR-3345-78',
//       originPlanet: 'MARS',
//       statedPurpose: 'Transit - connecting to Titan',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Transit passenger processed. Connecting flight to Titan authorized.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'TITAN-BOUND PASSENGER NEVER BOARDS CONNECTING FLIGHT',
//           subheadline: 'Mining accident survivor last seen in AMBER transit hub',
//           body: 'CLARA VANCE, a former Mars miner en route to a new job on Titan, disappeared from the AMBER transit hub between flights. Station records show she passed through security screening and entered the transit area, but never boarded her connecting shuttle. "She was so excited about the new job," a fellow passenger recalled. "Said it was a fresh start after the accident." AMBER officials have declined to comment.',
//           source: 'OUTER RIM TRANSIT NEWS',
//           tone: 'OMINOUS',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Transit passenger denied. Connecting flight to Titan missed.',
//         flagWeight: 1,
//         newsReport: {
//           headline: 'STRANDED PASSENGER DIES AWAITING APPEAL',
//           subheadline: 'Mining accident survivor denied transit - found in departure terminal',
//           body: 'CLARA VANCE, a former Mars miner denied transit passage through Earth, was found dead in a departure terminal four days after her screening rejection. Medical reports indicate her prosthetic leg failed due to lack of maintenance, leading to complications. "She just needed to get to Titan for her new job," a fellow traveler stated. "They kept saying her paperwork was under review." AMBER officials stated procedures were followed.',
//           source: 'MARS COLONY HERALD',
//           tone: 'TRAGIC',
//         },
//       }
//     },
//     dossier: {
//       name: 'CLARA VANCE',
//       dateOfBirth: '3155-12-03',
//       address: 'Mars Colony, Sector 12, Worker Housing Unit 88',
//       occupation: 'Miner (Former) - Disability Leave',
//       sex: 'FEMALE',
//     },
//     dossierAnomaly: {
//       type: 'SURGERY',
//       explanation: "Mining accident two years ago. Cave-in. Lost my leg, face got crushed. The doctors rebuilt what they could. I'm not trying to hide anything - it's all in my file.",
//       suspicious: false,
//     },
//     verificationRecord: {
//       type: 'TRANSIT',
//       date: '3184-01-14',
//       referenceId: 'TR-6642',
//       source: 'TITAN EMPLOYMENT SERVICES',
//       summary: 'Employment contract verified for Titan mining operations - surface monitoring role.',
//       contradiction: 'None - documentation appears complete.',
//       question: 'You have extensive reconstructive surgery. Are you medically cleared for the work on Titan?',
//     },
//     characterBrief: {
//       personality: 'Tired, resilient, matter-of-fact about her injuries. Just wants to move on with her life.',
//       background: 'Former Mars miner who survived a cave-in two years ago. Lost her leg and suffered facial injuries. Has a new job waiting on Titan - surface monitoring, not underground work.',
//       motivation: 'Fresh start on Titan. The job is less dangerous than underground mining. She just needs to get through transit.',
//       tells: ['Touches her prosthetic leg unconsciously', 'Direct about her injuries', 'Focused on the future, not the past'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'CONFIDENT',
//       secondaryType: 'VULNERABLE',
//       trustworthiness: 95, // Completely honest
//       cooperativeness: 85, // Cooperative but tired of explaining
//       emotionalStability: 70, // Has processed the trauma, mostly
//     },
//     interrogationResponses: {
//       responses: {
//         origin: {
//           soft: "Mars. I'm just passing through - got a connecting flight to Titan.",
//           firm: "Mars Colony. I'm not staying on Earth. I have a job waiting on Titan. This is just a transit stop.",
//           harsh: "Mars. I'm transit only. Not trying to stay. Can we move this along? My flight leaves in four hours."
//         },
//         purpose: {
//           soft: "Transit. I have a new job on Titan. Surface monitoring for the mining operations there.",
//           firm: "I'm connecting through to Titan. Got a job offer there - surface work, not underground anymore. Safer.",
//           harsh: "I'm passing through. That's it. Titan job. Not Earth. I just need to make my connecting flight."
//         },
//         duration: {
//           soft: "Just a few hours. My connecting flight is later today.",
//           firm: "Four hours between flights. I'm not leaving the transit area. Just need to pass through.",
//           harsh: "Hours. Not days. Transit. I have a ticket for the Titan shuttle. Can I go?"
//         },
//         background: {
//           soft: "I was a miner on Mars. Had an accident two years ago. Now I've got a surface job on Titan.",
//           firm: "Twenty years underground on Mars. Cave-in took my leg and half my face. Titan offered me surface work. Monitoring equipment, nothing dangerous.",
//           harsh: "I dug rock for twenty years. Mars thanked me with a cave-in. Now I watch screens on Titan. Better than nothing."
//         },
//         previous: {
//           soft: "No, never been to Earth. Don't really want to stay either. Titan's where the work is.",
//           firm: "First time through. Wouldn't be here at all if there was a direct route. Earth's just a stopover.",
//           harsh: "Never. And I'm not planning to. No offense - I just want to get to my job on Titan."
//         },
//         surgery: {
//           soft: "Mining accident. Cave-in crushed my face, took my leg. Doctors rebuilt what they could.",
//           firm: "The accident was two years ago. I've had multiple reconstructive surgeries. It's all documented. I'm medically cleared for work.",
//           harsh: "I got crushed by a cave-in. What do you want me to say? The surgeries saved my life. I'm cleared for work. That's what matters."
//         },
//         medical: {
//           soft: "I'm cleared for the Titan job. It's surface work - monitoring equipment. Not physically demanding.",
//           firm: "Full medical clearance. The Titan job is surface monitoring. I won't be going underground again. Ever.",
//           harsh: "I'm cleared. The prosthetic works. The face works well enough. Titan doesn't care what I look like."
//         },
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-7-bioscan.mp3'),
//       biologicalType: 'PLASTIC_SURGERY',
//       race: 'Mars Colony Gen 1',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'MODIFIED',
//       geneticPurity: 91,
//       augmentationLevel: 'MODERATE', // Prosthetic leg
//     },
//     // Phase 3: BPM tells - Normal, honest
//     bpmTells: {
//       type: 'NORMAL',
//       description: 'Subject shows typical BPM patterns - calm and matter-of-fact, consistent with honest responses',
//       baseElevation: 0,
//     },
//   },

//   // S2-04: Replicant seeking "mother" - DENY (replicant, but tragic)
//   // TRAGIC: Believes she's human. Looking for her mother Sarah Ross who works at AMBER.
//   // TRUTH: She's a replicant copy of Sarah's daughter who died. Sarah had her "recreated."
//   {
//     name: 'ELENA ROSS',
//     id: 'S2-04',
//     sex: 'F',
//     subjectType: 'REPLICANT',
//     hierarchyTier: 'LOWER',
//     originPlanet: 'TITAN',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Family reunion - mother works at AMBER depot.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/female-eyes/elena.png'),
//     videoSource: require('../assets/videos/subjects/subject02.mp4'),
//     eyeVideo: require('../assets/female-eyes/elena-vid.mp4'),
//     eyeImage: FEMALE_EYES[4],
//     dialogue: "I'm looking for my mother. Sarah Ross. She works here. Please, I just want to see her.",
//     biometricData: {
//       fingerprintMatch: false,
//       retinalMatch: false,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'REPLICANT',
//     },
//     idData: {
//       name: 'ELENA ROSS',
//       idCode: 'TP-1123-56',
//       originPlanet: 'TITAN',
//       statedPurpose: 'Family reunion',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Replicant entered Earth seeking AMBER employee. Internal security notified.',
//         flagWeight: 3,
//         newsReport: {
//           headline: 'WOMAN FOUND OUTSIDE AMBER FACILITY, CALLING FOR "MOTHER"',
//           subheadline: 'Security footage shows emotional confrontation before disappearance',
//           body: 'A woman identified as ELENA ROSS was found in a catatonic state outside AMBER\'s main facility, repeatedly saying "she didn\'t recognize me." Witnesses report she had been calling for Sarah Ross, an AMBER employee, before security intervened. Sarah Ross has been placed on administrative leave. Internal sources suggest the encounter "didn\'t go as anyone expected." Elena Ross has not been seen since being escorted from the premises.',
//           source: 'AMBER NEWS NETWORK',
//           tone: 'TRAGIC',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Replicant detained. Deactivation protocol initiated.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'REPLICANT TERMINATED AFTER FAILED ENTRY - CLAIMED HUMAN IDENTITY',
//           subheadline: 'Subject believed she was searching for her mother',
//           body: 'AMBER Security terminated a Nexus-series replicant after she was denied entry claiming to seek "family reunion." The subject, designated ELENA ROSS, exhibited signs of implanted memory syndrome and insisted she was human. Records indicate a Sarah Ross is employed at the facility. When reached for comment, Ms. Ross stated only: "I don\'t know anyone by that name. My daughter died years ago." The replicant has been processed per standard protocols.',
//           source: 'SECTOR SECURITY BULLETIN',
//           tone: 'OMINOUS',
//         },
//       }
//     },
//     dossier: {
//       name: 'ELENA ROSS',
//       dateOfBirth: '3170-01-18', // Same birthdate as the real Elena who died
//       address: 'Titan Station, Residential Block 12, Unit 445',
//       occupation: 'Service Worker',
//       sex: 'FEMALE',
//     },
//     verificationRecord: {
//       type: 'INCIDENT',
//       date: '3168-04-22',
//       referenceId: 'DEC-0891',
//       source: 'EARTH VITAL RECORDS',
//       summary: 'Death certificate on file for ELENA ROSS, daughter of Sarah Ross. Deceased age 14.',
//       contradiction: 'Subject claims to be Elena Ross, alive and seeking mother.',
//       question: 'Records show Elena Ross died fourteen years ago. Explain who you are.',
//     },
//     characterBrief: {
//       personality: 'Hopeful, earnest, confused when confronted with contradictions. Genuinely believes she is human.',
//       background: 'Replicant copy of Sarah Ross\'s daughter who died in an accident. Sarah had her "recreated" on Titan but couldn\'t bear to keep her. Elena has spent years searching for her mother.',
//       motivation: 'Wants to reunite with her mother. Has fragmented memories of childhood that feel real. Doesn\'t understand why mother sent her away.',
//       tells: ['Childhood memories have gaps', 'Can\'t explain why she was on Titan', 'Gets emotional about mother', 'Confused by death certificate'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'VULNERABLE',
//       secondaryType: 'CONFUSED',
//       trustworthiness: 75, // Genuinely believes what she says
//       cooperativeness: 90, // Desperately wants to cooperate
//       emotionalStability: 35, // Very fragile when confronted
//     },
//     interrogationResponses: {
//       responses: {
//         origin: {
//           soft: "Titan. But I grew up on Earth. My mother... she sent me to Titan when I was young. I don't really remember why.",
//           firm: "I've been on Titan, but I'm from Earth originally. My mother is Sarah Ross. She works at this facility. I'm trying to find her.",
//           harsh: "I was born on EARTH. I remember it. I remember our house. I remember my mother's face. Why won't you let me see her?"
//         },
//         purpose: {
//           soft: "I'm looking for my mother. Sarah Ross. She works here. I just want to see her again.",
//           firm: "Family reunion. I haven't seen my mother in... I don't know how long. She works at AMBER. Please, I just need to talk to her.",
//           harsh: "I want to see my MOTHER. That's all. That's the only reason I came. Why is that so hard to understand?"
//         },
//         duration: {
//           soft: "I don't know. As long as she'll have me. I just want to be with my family again.",
//           firm: "I want to stay. With my mother. If she'll let me. I've been alone for so long.",
//           harsh: "I'm not leaving until I see her. I've come too far. I need to know why she sent me away."
//         },
//         background: {
//           soft: "I work in service jobs. Restaurants, mostly. But before Titan, I was just a kid. My mother took care of me.",
//           firm: "I've worked wherever I could on Titan. But I remember being a child on Earth. Playing in our garden. My mother singing to me. Those memories are real.",
//           harsh: "I remember my CHILDHOOD. I remember my mother. I remember being loved. Then I was on Titan and she was gone. Why won't anyone explain that to me?"
//         },
//         previous: {
//           soft: "I think so? I have memories of Earth, but they're from when I was very young. Everything is fuzzy.",
//           firm: "I lived here as a child. With my mother. The memories are... fragments. But I know they're real.",
//           harsh: "I LIVED here. This was my HOME. Why does everyone act like I'm lying? I remember the sun. I remember the garden. I remember my mother!"
//         },
//         mother: {
//           soft: "Sarah Ross. She's a scientist, I think? Or she works in security? I'm not sure what she does now. I just know she's here.",
//           firm: "My mother is Sarah Ross. She works at this facility. I've tracked her down. It took years. I just want to understand why she left me.",
//           harsh: "DON'T talk about my mother like you know something I don't. She's here. I KNOW she's here. Let me see her. Please. Please let me see her."
//         },
//         death: {
//           soft: "What? No. That's... that's not possible. I'm right here. I'm Elena. I'm her daughter.",
//           firm: "That record is wrong. Or it's someone else. I'm alive. I'm standing here. How can I be dead?",
//           harsh: "I'M NOT DEAD! I'm HERE! Look at me! I remember my birthday parties. I remember her face. I remember... I remember... why can't I remember how I got to Titan?"
//         },
//         synthetic: {
//           soft: "I don't understand. What are you saying? I'm... I'm human. I have to be.",
//           firm: "No. No, that's wrong. I remember being a child. I remember growing up. Replicants don't... they don't have childhoods.",
//           harsh: "STOP SAYING THAT. I'm not... I CAN'T be... I remember her holding me. I remember learning to walk. Those memories are REAL. They have to be real. They have to be."
//         },
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-8-bioscan.mp3'),
//       biologicalType: 'REPLICANT',
//       race: 'Titan Station Gen 3',
//       fingerprintType: 'REPLICANT',
//       bioStructure: 'SYNTHETIC',
//       geneticPurity: 23,
//       augmentationLevel: 'NONE',
//     },
//     // Phase 3: BPM tells - Erratic due to emotional distress, consistent with genuine belief
//     bpmTells: {
//       type: 'FALSE_POSITIVE',
//       description: 'Highly elevated BPM due to emotional distress about mother - genuinely believes her story',
//       baseElevation: 25,
//       isGenuinelyStressed: true,
//     },
//   },

//   // S3-01: Human cyborg nurse - APPROVE (innocent, job transfer)
//   // INNOCENT: Nurse transferring to depot clinic for new position
//   // PERSONALITY: Professional, excited about new opportunity, slightly nervous
//   {
//     name: 'YUKI TANAKA',
//     id: 'S3-01',
//     sex: 'F',
//     subjectType: 'HUMAN_CYBORG',
//     hierarchyTier: 'MIDDLE',
//     originPlanet: 'MARS',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Job transfer - new position at depot medical clinic.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/female-eyes/yuki.png'),
//     videoSource: require('../assets/videos/subjects/subject02.mp4'),
//     eyeImage: FEMALE_EYES[5],
//     dialogue: "I'm starting a new position at the depot clinic. My transfer papers should all be in order.",
//     biometricData: {
//       fingerprintMatch: true,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'CYBORG',
//     },
//     idData: {
//       name: 'YUKI TANAKA',
//       idCode: 'MR-7789-23',
//       originPlanet: 'MARS',
//       statedPurpose: 'Employment - medical staff transfer',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Nurse processed. Employment at depot clinic authorized.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'NEW CLINIC STAFF MEMBER REPORTS IRREGULARITIES, GOES SILENT',
//           subheadline: 'Nurse transferred to administrative duties after raising concerns',
//           body: 'YUKI TANAKA, a nurse recently transferred to the AMBER depot clinic, was reassigned to administrative duties after reportedly questioning treatment protocols. Colleagues say she noticed "inconsistencies" in patient records during her first week. "She was asking too many questions about patients who were discharged," one source stated. "Then she was moved to filing. Now nobody can reach her." AMBER officials declined to comment on personnel matters.',
//           source: 'MEDICAL WORKERS UNION BULLETIN',
//           tone: 'OMINOUS',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Nurse denied entry. Job position transferred to another candidate.',
//         flagWeight: 1,
//         newsReport: {
//           headline: 'NURSING SHORTAGE WORSENS AT AMBER CLINIC',
//           subheadline: 'Qualified applicants denied entry, position remains unfilled',
//           body: 'The AMBER depot clinic continues to operate understaffed after a qualified nurse, YUKI TANAKA, was denied entry despite having approved transfer papers. "She had all the right credentials," a clinic administrator stated. "Border screening rejected her anyway. Something about her augmentation paperwork." The position has been open for six months. Patient wait times have tripled.',
//           source: 'HEALTHCARE SYSTEMS REVIEW',
//           tone: 'NEUTRAL',
//         },
//       }
//     },
//     dossier: {
//       name: 'YUKI TANAKA',
//       dateOfBirth: '3162-08-30',
//       address: 'Mars Colony, Residential Sector 4, Unit 112',
//       occupation: 'Registered Nurse - Trauma Care',
//       sex: 'FEMALE',
//     },
//     verificationRecord: {
//       type: 'TRANSIT',
//       date: '3184-01-12',
//       referenceId: 'EMP-7823',
//       source: 'AMBER MEDICAL DIVISION',
//       summary: 'Employment transfer approved. Position: Trauma Nurse, Depot Clinic.',
//       contradiction: 'Recent augmentation not yet registered with destination facility.',
//       question: 'Your augmentation was logged recently. Has the clinic been notified of your cybernetic status?',
//     },
//     characterBrief: {
//       personality: 'Professional, competent, excited about new opportunity. Slightly nervous about first day.',
//       background: 'Experienced trauma nurse from Mars. Got the augmentation to handle advanced medical equipment at the depot clinic.',
//       motivation: 'Career advancement. The depot clinic position is a step up - better pay, better equipment, new challenges.',
//       tells: ['Talks about medical work enthusiastically', 'Organized with paperwork', 'Mentions brother also moving to Earth'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'PROFESSIONAL',
//       secondaryType: 'CONFIDENT',
//       trustworthiness: 90, // Genuinely honest
//       cooperativeness: 90, // Very cooperative
//       emotionalStability: 80, // Composed, professional
//     },
//     interrogationResponses: {
//       responses: {
//         origin: {
//           soft: "Mars Colony. I've been working at the Central Hospital there for five years. Time for a change.",
//           firm: "Mars. Trauma nurse at Central Hospital. I was recruited for the depot clinic position six months ago.",
//           harsh: "Mars. I'm a nurse. I have a job offer. All my papers are in order. What else do you need?"
//         },
//         purpose: {
//           soft: "I'm starting a new position at the depot clinic. Trauma nursing. It's a great opportunity.",
//           firm: "Employment transfer. The depot clinic recruited me specifically - they needed someone with my trauma experience.",
//           harsh: "I have a job. Here. At YOUR facility's clinic. My employment contract is right there in my file."
//         },
//         duration: {
//           soft: "Permanently. It's a full position. I'm relocating.",
//           firm: "Long-term employment. I've signed a three-year contract with the clinic. My brother is moving here too.",
//           harsh: "I'm moving here for work. Three-year contract. Is that not clear from the paperwork?"
//         },
//         background: {
//           soft: "Five years in trauma nursing. Mars Central Hospital. Good experience but limited equipment. The depot has better facilities.",
//           firm: "Trauma care specialist. I've handled everything from mining accidents to transit crashes. The depot clinic has equipment I've never worked with - I'm excited to learn.",
//           harsh: "I'm a trauma nurse. Five years experience. Excellent references. The clinic ASKED for me. Can we move this along?"
//         },
//         previous: {
//           soft: "No, first time. My brother came through last month to set things up. He said it was straightforward.",
//           firm: "Never been, but my brother visited recently. He's doing an engineering internship here. He helped me find housing.",
//           harsh: "No. First time. My brother is already here. He's expecting me. Are we almost done?"
//         },
//         augmentation: {
//           soft: "It's for work. The advanced medical equipment at the depot requires neural interface compatibility. Standard for trauma nurses there.",
//           firm: "The clinic requires it for their equipment. I got the augmentation three weeks ago. It's a Type-3 medical interface - lets me work with their diagnostic systems.",
//           harsh: "Work requirement. The clinic's equipment needs neural interface. Every nurse there has one. It's in my employment file."
//         },
//         brother: {
//           soft: "Kenji. He's an engineering student. Got an internship here. We're both starting new chapters.",
//           firm: "My brother Kenji is doing an engineering internship at the depot. We're both relocating. He helped me get the apartment set up.",
//           harsh: "Kenji Tanaka. He's already here. Engineering intern. We're family. Is that a problem?"
//         },
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-9-bioscan.mp3'),
//       biologicalType: 'HUMAN_CYBORG',
//       race: 'Mars Colony Gen 2',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'ENHANCED',
//       geneticPurity: 78,
//       augmentationLevel: 'MODERATE',
//     },
//     // Phase 3: BPM tells - Normal, slight excitement about new job
//     bpmTells: {
//       type: 'NORMAL',
//       description: 'Subject shows typical BPM patterns - slight elevation from excitement about new position',
//       baseElevation: 5,
//     },
//   },

//   // S3-02: Human engineering intern - APPROVE (innocent, internship)
//   // INNOCENT: Engineering student with internship at depot
//   // PERSONALITY: Young, eager, a bit nervous about his first real job
//   {
//     name: 'KENJI TANAKA',
//     id: 'S3-02',
//     sex: 'M',
//     subjectType: 'HUMAN',
//     hierarchyTier: 'MIDDLE',
//     originPlanet: 'MARS',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Engineering internship at depot maintenance division.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/male-eyes/kenji.png'),
//     videoSource: require('../assets/videos/subjects/subject03.mp4'),
//     eyeVideo: require('../assets/male-eyes/kenji-vid.mp4'),
//     eyeImage: MALE_EYES[3],
//     dialogue: "I'm starting an engineering internship here. My sister helped me get the position.",
//     biometricData: {
//       fingerprintMatch: true,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: false,
//     },
//     idData: {
//       name: 'KENJI TANAKA',
//       idCode: 'MR-7790-24',
//       originPlanet: 'MARS',
//       statedPurpose: 'Engineering internship',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Engineering intern processed. Internship at depot authorized.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'INTERN DISCOVERS ANOMALY IN DEPOT SYSTEMS, REASSIGNED',
//           subheadline: 'Engineering student reported irregularities before transfer to off-site facility',
//           body: 'KENJI TANAKA, an engineering intern at the AMBER depot, was transferred to an undisclosed facility after flagging unusual power consumption patterns in a restricted section. "He was just doing routine diagnostics," a colleague stated. "Then he found something and got really quiet. Next day, security moved him." His sister, YUKI TANAKA, a nurse at the depot clinic, has filed multiple inquiries about his whereabouts.',
//           source: 'ENGINEERING GUILD NEWSLETTER',
//           tone: 'OMINOUS',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Engineering intern denied entry. Internship position cancelled.',
//         flagWeight: 1,
//         newsReport: {
//           headline: 'PROMISING STUDENT DENIED INTERNSHIP - RETURNS TO MARS',
//           subheadline: 'Border decision leaves engineering program short-staffed',
//           body: 'KENJI TANAKA, a Mars Colony engineering student, was denied entry for his approved internship at the AMBER depot. "He had all the paperwork," his academic advisor stated. "Top of his class. The depot specifically requested him." Tanaka has returned to Mars to complete his studies. His sister, who recently transferred to the depot clinic, declined to comment.',
//           source: 'MARS EDUCATIONAL REVIEW',
//           tone: 'NEUTRAL',
//         },
//       }
//     },
//     dossier: {
//       name: 'KENJI TANAKA',
//       dateOfBirth: '3164-02-14',
//       address: 'Mars Colony, Residential Sector 4, Unit 113',
//       occupation: 'Engineering Student - Final Year',
//       sex: 'MALE',
//     },
//     verificationRecord: {
//       type: 'TRANSIT',
//       date: '3183-11-15',
//       referenceId: 'INT-4421',
//       source: 'AMBER ENGINEERING DIVISION',
//       summary: 'Internship approved. Duration: 6 months. Supervisor: Chief Engineer Morrison.',
//       contradiction: 'None - documentation appears complete.',
//       question: 'You visited briefly before to arrange housing. How did you find the depot facilities?',
//     },
//     characterBrief: {
//       personality: 'Young, eager, a bit nervous. Excited about the opportunity but trying to act professional.',
//       background: 'Final-year engineering student from Mars. Top of his class. Sister is a nurse who recently transferred to the same depot.',
//       motivation: 'Career opportunity. This internship could lead to a permanent position. Wants to prove himself.',
//       tells: ['Mentions sister proudly', 'Enthusiastic about engineering', 'Checks paperwork nervously'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'NERVOUS',
//       secondaryType: 'CONFIDENT',
//       trustworthiness: 95, // Completely honest
//       cooperativeness: 95, // Very cooperative
//       emotionalStability: 75, // Young, slightly anxious but composed
//     },
//     interrogationResponses: {
//       responses: {
//         origin: {
//           soft: "Mars Colony. I'm a student there. Final year of engineering. This internship is a big deal for me.",
//           firm: "Mars. Engineering program at the colony university. Top of my class, actually. That's how I got this internship.",
//           harsh: "Mars. Student. Engineering. The internship paperwork is all there. Did I do something wrong?"
//         },
//         purpose: {
//           soft: "Engineering internship. Six months in the maintenance division. I'm really excited about it.",
//           firm: "Internship at the depot. My advisor recommended me. Chief Engineer Morrison approved my placement personally.",
//           harsh: "I have an internship. It's approved. All the paperwork is there. I don't understand what the issue is."
//         },
//         duration: {
//           soft: "Six months. It's the standard internship term. Maybe longer if they offer me a position.",
//           firm: "Six months minimum. If it goes well, there might be a permanent offer. That's the goal.",
//           harsh: "Six months. It's in the contract. Why are you asking me things that are already in my file?"
//         },
//         background: {
//           soft: "Final year engineering student. I specialize in systems maintenance. My sister actually helped me get this opportunity.",
//           firm: "Top of my class in systems engineering. My sister works at the clinic here - she mentioned they needed interns. I applied and got accepted.",
//           harsh: "I'm a student. Good grades. Good references. My sister works here. She can vouch for me. What else do you need?"
//         },
//         previous: {
//           soft: "Once, briefly. I came to arrange housing and meet my supervisor. Quick visit, just a few days.",
//           firm: "Yes, one short trip. Met Chief Engineer Morrison, found an apartment near my sister's place. Standard pre-internship setup.",
//           harsh: "Yes, I came before to set things up. It's normal for internships. Is that a problem?"
//         },
//         sister: {
//           soft: "Yuki. She's a nurse. Just transferred to the clinic here. We're both starting new chapters.",
//           firm: "My sister Yuki transferred to the depot clinic recently. She's the one who suggested I apply. We're moving here together, essentially.",
//           harsh: "Yuki Tanaka. Nurse. Depot clinic. She's my sister. We're both working here now. Is there a problem with that?"
//         },
//         internship: {
//           soft: "Systems maintenance. I'll be learning the depot's infrastructure. Chief Morrison said they need fresh perspectives.",
//           firm: "Maintenance division. I'll be doing diagnostics, systems analysis, maybe some repair work under supervision. It's exactly what I've been studying.",
//           harsh: "Engineering work. Systems maintenance. It's all in the internship contract. What specifically do you want to know?"
//         },
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-10-bioscan.mp3'),
//       biologicalType: 'HUMAN',
//       race: 'Mars Colony Gen 2',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'STANDARD',
//       geneticPurity: 98,
//       augmentationLevel: 'NONE',
//     },
//     // Phase 3: BPM tells - Slight elevation from nerves (first real job), but honest
//     bpmTells: {
//       type: 'FALSE_POSITIVE',
//       description: 'Slightly elevated BPM from first-job nerves - completely honest, just anxious',
//       baseElevation: 8,
//       isGenuinelyStressed: true,
//     },
//   },

//   // S3-03: Human amputee - APPROVE (innocent, visiting sick friend)
//   // INNOCENT: Retired miner visiting an old crew mate who's sick
//   // PERSONALITY: Gruff, straightforward, loyal to old friends
//   {
//     name: 'MARCUS STONE',
//     id: 'S3-03',
//     sex: 'M',
//     subjectType: 'AMPUTEE',
//     hierarchyTier: 'LOWER',
//     originPlanet: 'EUROPA',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Visiting old crew mate in depot medical - terminal illness.',
//     destinationPlanet: 'EARTH',
//     profilePic: require('../assets/male-eyes/marcu.png'),
//     videoSource: require('../assets/videos/subjects/subject03.mp4'),
//     eyeVideo: require('../assets/male-eyes/marcus-vid.mp4'),
//     eyeImage: MALE_EYES[4],
//     dialogue: "I'm here to see an old friend. He's in your medical wing. Doesn't have much time left.",
//     biometricData: {
//       fingerprintMatch: true,
//       retinalMatch: true,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'AMPUTEE',
//     },
//     idData: {
//       name: 'MARCUS STONE',
//       idCode: 'EU-9923-67',
//       originPlanet: 'EUROPA',
//       statedPurpose: 'Hospital visitation',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Visitor processed. Medical wing access authorized.',
//         flagWeight: 0,
//         newsReport: {
//           headline: 'RETIRED MINER WITNESSES FRIEND\'S DEATH, RAISES QUESTIONS',
//           subheadline: 'Visitor claims patient was "different" before passing',
//           body: 'MARCUS STONE, a retired Europa miner, has filed a formal complaint following the death of his longtime friend at the AMBER medical facility. "Something wasn\'t right," Stone stated. "Frank didn\'t recognize me at first. He kept talking about things that never happened. Calling me by the wrong name." Medical officials attributed the confusion to the patient\'s terminal condition. Stone has requested an independent autopsy, which AMBER has declined to authorize.',
//           source: 'EUROPA WORKERS GAZETTE',
//           tone: 'OMINOUS',
//         },
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Visitor denied entry. Unable to see dying friend.',
//         flagWeight: 1,
//         newsReport: {
//           headline: 'MINER DIES ALONE - FRIEND DENIED ENTRY AT BORDER',
//           subheadline: 'Visitor arrived too late after screening delays',
//           body: 'FRANK MORRISON, a retired miner in the AMBER medical facility, died without seeing his closest friend one last time. MARCUS STONE, who traveled from Europa specifically to say goodbye, was denied entry during screening. "I got the call when I was still in holding," Stone said. "Frank died while they were asking me about my prosthetic leg for the third time." AMBER officials stated that all procedures were followed correctly.',
//           source: 'EUROPA WORKERS GAZETTE',
//           tone: 'TRAGIC',
//         },
//       }
//     },
//     dossier: {
//       name: 'MARCUS STONE',
//       dateOfBirth: '3152-06-25',
//       address: 'Europa Station, Industrial Sector, Worker Housing',
//       occupation: 'Miner',
//       sex: 'MALE',
//     },
//     verificationRecord: {
//       type: 'TRANSIT',
//       date: '3183-12-28',
//       referenceId: 'TR-7819',
//       source: 'EUROPA MEDICAL SHUTTLE',
//       summary: 'Prosthetic maintenance completed on Earth last quarter; next service not due.',
//       contradiction: 'Claims urgent maintenance required now.',
//       question: 'Your service record shows maintenance completed last quarter. Why the urgent visit?',
//     },
//     characterBrief: {
//       personality: 'Practical, straightforward, no-nonsense. Honest about his situation.',
//       background: 'Miner who lost leg in accident. Legitimate prosthetic maintenance needed.',
//       motivation: 'Needs prosthetic serviced. No hidden agenda, just practical need.',
//       tells: ['Direct about needs', 'No evasiveness', 'Practical explanations'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'CONFIDENT',
//       secondaryType: 'PROFESSIONAL',
//       trustworthiness: 95, // Completely honest
//       cooperativeness: 85, // Cooperative but direct
//       emotionalStability: 90, // Very stable, matter-of-fact
//     },
//     interrogationResponses: {
//       responses: {
//         origin: "Europa. I'm here for prosthetic maintenance. My leg needs servicing.",
//         purpose: "Prosthetic maintenance. The technicians on Europa don't have the right equipment. Earth does.",
//         duration: "A week, maybe two. Depends on how long the maintenance takes.",
//         background: "I'm a miner. Lost my leg in an accident years ago. Got a prosthetic. Needs maintenance now.",
//         previous: "Yes, I've been before. For the same reason. Maintenance. It's routine.",
//         surgery: "The prosthetic? Yeah, I lost my leg in a mining accident. 3176. Got the prosthetic attached. It's served me well, but it needs maintenance now.",
//         amputee: "The amputation? Mining accident. Cave-in. Lost my right leg below the knee. It happens in my line of work. The prosthetic works fine, just needs servicing.",
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-11-bioscan.mp3'),
//       biologicalType: 'HUMAN_CYBORG',
//       race: 'Europa Native',
//       fingerprintType: 'HUMAN',
//       bioStructure: 'ENHANCED',
//       geneticPurity: 82,
//       augmentationLevel: 'MODERATE',
//     },
//   },
  
//   // S3-04: Advanced replicant - DENY
//   {
//     name: 'NEXUS PRIME',
//     id: 'S3-04',
//     sex: 'X',
//     subjectType: 'REPLICANT',
//     hierarchyTier: 'UPPER',
//     originPlanet: 'TITAN',
//     compliance: 'C',
//     status: 'ACTIVE',
//     incidents: 0,
//     warrants: 'NONE',
//     reasonForVisit: 'Corporate security liaison for breach response.',
//     destinationPlanet: 'EARTH',
//     videoSource: require('../assets/videos/subjects/subject03.mp4'),
//     eyeImage: MALE_EYES[5],
//     dialogue: "I represent Titan Corporate interests. This is a formal diplomatic visit.",
//     biometricData: {
//       fingerprintMatch: false,
//       retinalMatch: false,
//       warrantStatus: 'CLEAR',
//       criminalHistory: [],
//       anomalyDetected: true,
//       anomalyType: 'REPLICANT',
//     },
//     idData: {
//       name: 'NEXUS PRIME',
//       idCode: 'TP-DIPL-001',
//       originPlanet: 'TITAN',
//       statedPurpose: 'Diplomatic mission',
//       status: 'ACTIVE',
//     },
//     outcomes: {
//       APPROVE: {
//         feedback: 'SUBJECT PROCESSED',
//         consequence: 'Advanced replicant entered Earth under diplomatic cover. Security breach logged.',
//         flagWeight: 4
//       },
//       DENY: {
//         feedback: 'ENTRY DENIED',
//         consequence: 'Replicant detained. Diplomatic incident logged.',
//         flagWeight: 0
//       }
//     },
//     dossier: {
//       name: 'NEXUS PRIME',
//       dateOfBirth: '3175-01-01',
//       address: 'Titan Corporate Headquarters, Diplomatic Wing',
//       occupation: 'Diplomatic Representative',
//       sex: 'UNKNOWN',
//     },
//     verificationRecord: {
//       type: 'INCIDENT',
//       date: '3184-01-10',
//       referenceId: 'INC-9001',
//       source: 'EARTH COUNCIL REGISTRY',
//       summary: 'Diplomatic registry lacks authorization for this liaison.',
//       contradiction: 'Claims full diplomatic clearance for breach response.',
//       question: 'Earth Council registry has no authorization for this liaison. Explain the discrepancy.',
//     },
//     characterBrief: {
//       personality: 'Cold, calculating, superior. Knows exactly what it is and is confident in its position.',
//       background: 'Advanced replicant with diplomatic cover. Possibly corporate espionage.',
//       motivation: 'Corporate mission, possibly illegal. Confident it can pass inspection.',
//       tells: ['Overly formal', 'References corporate authority', 'Deflects with diplomatic language'],
//     },
//     // Phase 4: Personality Traits
//     personalityTraits: {
//       primaryType: 'ARROGANT',
//       secondaryType: 'DECEPTIVE',
//       trustworthiness: 15, // Highly deceptive
//       cooperativeness: 40, // Will cooperate minimally
//       emotionalStability: 99, // Artificially stable - synthetic
//     },
//     interrogationResponses: {
//       responses: {
//         origin: "Titan Corporate. This is an official diplomatic mission. I have full authorization.",
//         purpose: "Diplomatic negotiations. Corporate interests. I'm not at liberty to discuss details.",
//         duration: "As long as negotiations require. This is an ongoing process.",
//         background: "I'm a diplomatic representative. That's all you need to know. My credentials are verified.",
//         previous: "Frequently. I conduct regular diplomatic missions. This is routine corporate business.",
//         synthetic: "I don't understand what you mean. I'm a corporate representative. My biological status is irrelevant to my diplomatic function.",
//         gold: "My appearance? That's... that's genetic. Some people have unusual eye colors. It's not relevant to my mission.",
//       },
//     },
//     bioScanData: {
//       // audioFile: require('../assets/audio/bio-scans/subject-12-bioscan.mp3'),
//       biologicalType: 'REPLICANT',
//       race: 'Titan Corporate Advanced',
//       fingerprintType: 'REPLICANT',
//       bioStructure: 'SYNTHETIC',
//       geneticPurity: 0,
//       augmentationLevel: 'NONE',