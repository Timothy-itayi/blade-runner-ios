// =============================================================================
// SUBJECT GREETING SYSTEM - Phase 4: Subject Interaction
// Communication styles and greeting data for each subject
// =============================================================================

// 6 Communication Styles
export type CommunicationStyle =
  | 'FLUENT'      // Clear, confident speech
  | 'BROKEN'      // Fragmented, uncertain speech
  | 'GIBBERISH'   // Incomprehensible, possibly alien/damaged
  | 'SILENT'      // Refuses to speak or minimal response
  | 'AGITATED'    // Nervous, rushed, emotional
  | 'FORMAL';     // Stiff, bureaucratic, rehearsed

export interface SubjectGreeting {
  subjectId: string;
  communicationStyle: CommunicationStyle;
  greeting: string;
  credentialBehavior: CredentialBehavior;
  bpmBaselineModifier: number; // Affects initial BPM based on greeting behavior
}

// 6 Credential Presentation Behaviors
export type CredentialBehavior =
  | 'COOPERATIVE'   // Hands over credentials willingly
  | 'RELUCTANT'     // Hesitates, slow to present
  | 'MISSING'       // Claims to have lost/forgotten credentials
  | 'FORGED'        // Presents suspicious/altered credentials
  | 'MULTIPLE'      // Presents multiple conflicting credentials
  | 'NONE';         // Refuses to present any credentials

// Style descriptions for UI display
export const COMMUNICATION_STYLE_DESCRIPTIONS: Record<CommunicationStyle, string> = {
  FLUENT: 'Subject speaks clearly and confidently',
  BROKEN: 'Subject speech is fragmented and uncertain',
  GIBBERISH: 'Subject communication is largely incomprehensible',
  SILENT: 'Subject refuses to speak or responds minimally',
  AGITATED: 'Subject appears nervous and rushed',
  FORMAL: 'Subject uses stiff, bureaucratic language',
};

export const CREDENTIAL_BEHAVIOR_DESCRIPTIONS: Record<CredentialBehavior, string> = {
  COOPERATIVE: 'Credentials presented willingly',
  RELUCTANT: 'Hesitant to present credentials',
  MISSING: 'Claims credentials are lost or forgotten',
  FORGED: 'Credentials appear altered or suspicious',
  MULTIPLE: 'Multiple conflicting credentials presented',
  NONE: 'Refuses to present credentials',
};

// Subject greeting data - matches subjects.ts by ID
// Greetings are kept intentionally short to fit the terminal HUD
export const SUBJECT_GREETINGS: SubjectGreeting[] = [
  // ============= SHIFT 1 =============
  {
    subjectId: 'S1-01', // EVA PROM - Replicant with false memories
    communicationStyle: 'BROKEN',
    greeting: "I'm here to enter the depot. Clearance should be in the file.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 15,
  },
  {
    subjectId: 'S1-02', // MARA VOLKOV - Human with active warrant
    communicationStyle: 'AGITATED',
    greeting: "Please—let me inside. They're still in the depot.",
    credentialBehavior: 'RELUCTANT',
    bpmBaselineModifier: 20,
  },
  {
    subjectId: 'S1-03', // JAMES CHEN - Human cyborg
    communicationStyle: 'FORMAL',
    greeting: "Security escort. Documentation ready for breach protocol.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 5,
  },
  {
    subjectId: 'S1-04', // SILAS REX - Corporate cyborg
    communicationStyle: 'FORMAL',
    greeting: "Corporate clearance. Open the gate.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 0,
  },

  // ============= SHIFT 2 =============
  {
    subjectId: 'S2-01', // VERA OKONKWO - Fingerprint modification
    communicationStyle: 'FLUENT',
    greeting: "Okonkwo. Systems consultant. Breach response team.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: -5,
  },
  {
    subjectId: 'S2-02', // DMITRI VOLKOV - Mara's brother
    communicationStyle: 'AGITATED',
    greeting: "My sister's inside. I need access now.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 12,
  },
  {
    subjectId: 'S2-03', // CLARA VANCE - Extensive plastic surgery
    communicationStyle: 'BROKEN',
    greeting: "I... I need to get inside. It's not safe out here.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 10,
  },
  {
    subjectId: 'S2-04', // ELENA ROSS - Replicant unaware
    communicationStyle: 'BROKEN',
    greeting: "Elena. Maintenance applicant. I was told to report here.",
    credentialBehavior: 'RELUCTANT',
    bpmBaselineModifier: 18,
  },

  // ============= SHIFT 3 =============
  {
    subjectId: 'S3-01', // YUKI TANAKA - Recent surgery, family emergency
    communicationStyle: 'AGITATED',
    greeting: "Emergency—my brother is trapped inside.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 25,
  },
  {
    subjectId: 'S3-02', // KENJI TANAKA - Yuki's brother
    communicationStyle: 'FLUENT',
    greeting: "I'm with Tanaka. We need access to the inner ring.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 8,
  },
  {
    subjectId: 'S3-03', // MARCUS STONE - Amputee
    communicationStyle: 'FLUENT',
    greeting: "Prosthetic service. I have a scheduled repair window.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: 0,
  },
  {
    subjectId: 'S3-04', // NEXUS PRIME - Advanced replicant
    communicationStyle: 'FORMAL',
    greeting: "Titan Corporate. Breach audit team. Designation TCP.",
    credentialBehavior: 'COOPERATIVE',
    bpmBaselineModifier: -10,
  },
];

// Helper function to get greeting data by subject ID or from subject data
export function getSubjectGreeting(
  subjectId: string,
  subjectData?: import('./subjects').SubjectData
): SubjectGreeting | undefined {
  // If subject has inline greeting data (from factory), use that
  if (subjectData?.communicationStyle && subjectData?.greetingText) {
    // Calculate BPM modifier from subject's BPM (factory sets initial BPM with modifier)
    const baseBPM = 72;
    const bpmModifier = typeof subjectData.bpm === 'number' 
      ? subjectData.bpm - baseBPM 
      : 0;
    
    return {
      subjectId,
      communicationStyle: subjectData.communicationStyle,
      greeting: subjectData.greetingText,
      credentialBehavior: subjectData.credentialBehavior || 'COOPERATIVE',
      bpmBaselineModifier: bpmModifier,
    };
  }
  
  // Otherwise, look up from static array
  return SUBJECT_GREETINGS.find(g => g.subjectId === subjectId);
}

// Helper to get communication style description
export function getStyleDescription(style: CommunicationStyle): string {
  return COMMUNICATION_STYLE_DESCRIPTIONS[style];
}

// Helper to get credential behavior description
export function getCredentialDescription(behavior: CredentialBehavior): string {
  return CREDENTIAL_BEHAVIOR_DESCRIPTIONS[behavior];
}

// Calculate initial BPM from greeting interaction
export function calculateGreetingBPM(baselineBPM: number, greeting: SubjectGreeting): number {
  return baselineBPM + greeting.bpmBaselineModifier;
}
