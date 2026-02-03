// =============================================================================
// SUBJECT FACTORY - Phase 5: Factory & Generation
// =============================================================================
// Generates subjects from traits with manual override support

import { SubjectData, SubjectType, HierarchyTier, PersonalityTraits, PersonalityType } from '../data/subjects';
import { 
  SubjectTraits, 
  generateNameFromTraits, 
  generateIdCodeFromTraits, 
  generateReasonForVisit,
  generateRandomTraits,
  generateTraitsFromSeed,
  validateTraitCombination,
} from '../data/subjectTraits';
import { assignAssetsToSubject, getManualAssetOverride } from '../data/assetPools';
import { CommunicationStyle, CredentialBehavior, SubjectGreeting } from '../data/subjectGreetings';
import { CredentialType, CredentialDetails, SubjectCredential } from '../data/credentialTypes';
import { OriginPlanet } from '../data/subjectTraits';

// =============================================================================
// FACTORY CONFIGURATION
// =============================================================================

export interface SubjectFactoryConfig {
  seed?: number; // For deterministic generation
  manualOverrides?: Partial<SubjectData>; // Override specific fields
  assetOverrides?: {
    videoSource?: any;
    eyeImage?: any;
    profilePic?: any;
    eyeVideo?: any;
  };
  useProceduralPortrait?: boolean; // If true, skip video assets and use procedural face
}

// =============================================================================
// TRAIT-BASED DATA GENERATION
// =============================================================================

/**
 * Generates biometric data based on subject type
 */
function generateBiometricData(subjectType: SubjectType): SubjectData['biometricData'] {
  const baseData = {
    fingerprintMatch: true,
    retinalMatch: true,
    warrantStatus: 'CLEAR' as const,
    criminalHistory: [] as string[],
    anomalyDetected: false,
  };

  switch (subjectType) {
    case 'REPLICANT':
      return {
        ...baseData,
        fingerprintMatch: false,
        retinalMatch: false,
        anomalyDetected: true,
        anomalyType: 'REPLICANT',
      };
    case 'HUMAN_CYBORG':
    case 'ROBOT_CYBORG':
      return {
        ...baseData,
        anomalyDetected: true,
        anomalyType: 'CYBORG',
      };
    case 'PLASTIC_SURGERY':
      return {
        ...baseData,
        anomalyDetected: true,
        anomalyType: 'SURGERY',
      };
    case 'AMPUTEE':
      return {
        ...baseData,
        anomalyDetected: true,
        anomalyType: 'AMPUTEE',
      };
    default:
      return baseData;
  }
}

/**
 * Generates bio scan data based on subject type
 */
function generateBioScanData(subjectType: SubjectType): SubjectData['bioScanData'] {
  const baseData = {
    biologicalType: subjectType,
    race: 'Standard',
    fingerprintType: 'HUMAN' as const,
    bioStructure: 'STANDARD' as const,
    geneticPurity: 100,
    augmentationLevel: 'NONE' as const,
  };

  switch (subjectType) {
    case 'REPLICANT':
      return {
        ...baseData,
        biologicalType: 'REPLICANT',
        fingerprintType: 'REPLICANT',
        bioStructure: 'SYNTHETIC',
        geneticPurity: 0,
      };
    case 'HUMAN_CYBORG':
      return {
        ...baseData,
        biologicalType: 'HUMAN_CYBORG',
        fingerprintType: 'CYBORG',
        bioStructure: 'ENHANCED',
        geneticPurity: 75,
        augmentationLevel: 'MODERATE',
      };
    case 'ROBOT_CYBORG':
      return {
        ...baseData,
        biologicalType: 'ROBOT_CYBORG',
        fingerprintType: 'CYBORG',
        bioStructure: 'SYNTHETIC',
        geneticPurity: 50,
        augmentationLevel: 'MAJOR',
      };
    case 'PLASTIC_SURGERY':
      return {
        ...baseData,
        biologicalType: 'PLASTIC_SURGERY',
        bioStructure: 'MODIFIED',
        geneticPurity: 90,
      };
    case 'AMPUTEE':
      return {
        ...baseData,
        biologicalType: 'AMPUTEE',
        fingerprintType: 'AMPUTEE',
        bioStructure: 'MODIFIED',
        geneticPurity: 95,
      };
    default:
      return baseData;
  }
}

/**
 * Generates personality traits based on hierarchy tier
 */
function generatePersonalityTraits(hierarchyTier: HierarchyTier): PersonalityTraits {
  const personalityMap: Record<HierarchyTier, { primary: PersonalityType; trustworthiness: number; cooperativeness: number; stability: number }> = {
    LOWER: {
      primary: 'NERVOUS',
      trustworthiness: 60,
      cooperativeness: 70,
      stability: 50,
    },
    MIDDLE: {
      primary: 'PROFESSIONAL',
      trustworthiness: 75,
      cooperativeness: 80,
      stability: 70,
    },
    UPPER: {
      primary: 'CONFIDENT',
      trustworthiness: 70,
      cooperativeness: 60,
      stability: 80,
    },
    VIP: {
      primary: 'ARROGANT',
      trustworthiness: 50,
      cooperativeness: 40,
      stability: 90,
    },
  };

  const base = personalityMap[hierarchyTier];
  return {
    primaryType: base.primary,
    trustworthiness: base.trustworthiness + Math.floor(Math.random() * 20) - 10,
    cooperativeness: base.cooperativeness + Math.floor(Math.random() * 20) - 10,
    emotionalStability: base.stability + Math.floor(Math.random() * 20) - 10,
  };
}

/**
 * Generates ID data based on traits
 */
function generateIdData(traits: SubjectTraits, name: string, idCode: string): SubjectData['idData'] {
  return {
    name,
    idCode,
    originPlanet: traits.originPlanet,
    statedPurpose: generateReasonForVisit(traits),
    status: 'ACTIVE',
  };
}

/**
 * Generates communication style based on traits and personality
 */
function generateCommunicationStyle(
  traits: SubjectTraits,
  personality: PersonalityTraits
): CommunicationStyle {
  // Nervous personalities tend to be agitated or broken
  if (personality.primaryType === 'NERVOUS') {
    return Math.random() > 0.5 ? 'AGITATED' : 'BROKEN';
  }
  
  // Deceptive personalities might be formal or silent
  if (personality.primaryType === 'DECEPTIVE') {
    return Math.random() > 0.5 ? 'FORMAL' : 'SILENT';
  }
  
  // Arrogant personalities are formal
  if (personality.primaryType === 'ARROGANT') {
    return 'FORMAL';
  }
  
  // VIPs are typically formal
  if (traits.hierarchyTier === 'VIP') {
    return 'FORMAL';
  }
  
  // Lower tier might be broken or agitated
  if (traits.hierarchyTier === 'LOWER') {
    return Math.random() > 0.3 ? 'BROKEN' : 'FLUENT';
  }
  
  // Replicants might be confused (gibberish) or broken
  if (traits.subjectType === 'REPLICANT') {
    return Math.random() > 0.7 ? 'GIBBERISH' : 'BROKEN';
  }
  
  // Default: fluent or formal based on tier
  return traits.hierarchyTier === 'UPPER' ? 'FORMAL' : 'FLUENT';
}

/**
 * Generates credential behavior based on traits and personality
 */
function generateCredentialBehavior(
  traits: SubjectTraits,
  personality: PersonalityTraits
): CredentialBehavior {
  // Deceptive or nervous might be reluctant
  if (personality.primaryType === 'DECEPTIVE' || personality.primaryType === 'NERVOUS') {
    return Math.random() > 0.5 ? 'RELUCTANT' : 'COOPERATIVE';
  }
  
  // Arrogant might refuse or be reluctant
  if (personality.primaryType === 'ARROGANT') {
    return Math.random() > 0.7 ? 'NONE' : 'COOPERATIVE';
  }
  
  // Lower tier might have missing credentials
  if (traits.hierarchyTier === 'LOWER' && Math.random() > 0.8) {
    return 'MISSING';
  }
  
  // Replicants might have forged credentials
  if (traits.subjectType === 'REPLICANT' && Math.random() > 0.6) {
    return 'FORGED';
  }
  
  // Default: cooperative
  return 'COOPERATIVE';
}

/**
 * Generates greeting text based on traits and communication style
 */
function generateGreetingText(
  traits: SubjectTraits,
  name: string,
  communicationStyle: CommunicationStyle,
  reasonForVisit: string
): string {
  const templates: Record<CommunicationStyle, string[]> = {
    FLUENT: [
      `Good ${Math.random() > 0.5 ? 'morning' : 'afternoon'}. I'm ${name}. ${reasonForVisit}.`,
      `Hello. ${name} here. I need to ${reasonForVisit.toLowerCase()}.`,
      `Hi there. I'm here for ${reasonForVisit.toLowerCase()}. Everything should be in order.`,
    ],
    BROKEN: [
      `I... I am ${name}. I come... ${reasonForVisit.toLowerCase()}. Please.`,
      `Hello. I... ${name}. Here for... ${reasonForVisit.toLowerCase()}.`,
      `I need... I need to ${reasonForVisit.toLowerCase()}. My name is ${name}.`,
    ],
    GIBBERISH: [
      `Blorg zorp nexus... ${name}... terra firma...`,
      `Nexus prime ${name}... zorp blorg...`,
      `Terra... ${name}... nexus blorg zorp...`,
    ],
    SILENT: [
      `...`,
      `*[Subject stands silently]*`,
      `*[No response]*`,
    ],
    AGITATED: [
      `Please, I need to get through! ${reasonForVisit}! My name is ${name}!`,
      `Let me in! I'm ${name}! I have to ${reasonForVisit.toLowerCase()}!`,
      `Please! ${name}! I need... I need to ${reasonForVisit.toLowerCase()}!`,
    ],
    FORMAL: [
      `Good day. I am ${name}. I have all required documentation prepared. ${reasonForVisit}.`,
      `I trust this won't take long. ${name}. ${reasonForVisit}. Everything should be in order.`,
      `Official business. ${name}. ${reasonForVisit}. I expect full protocol compliance.`,
    ],
  };
  
  const pool = templates[communicationStyle];
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generates credential type based on traits
 */
function generateCredentialType(traits: SubjectTraits): CredentialType {
  if (traits.hierarchyTier === 'VIP') {
    return 'DIPLOMATIC_PASS';
  }
  
  if (traits.hierarchyTier === 'UPPER') {
    return Math.random() > 0.5 ? 'WORK_PERMIT' : 'PASSPORT';
  }
  
  const reason = generateReasonForVisit(traits);
  if (reason.toLowerCase().includes('medical')) {
    return 'MEDICAL_CLEARANCE';
  }
  
  if (reason.toLowerCase().includes('work') || reason.toLowerCase().includes('employment')) {
    return 'WORK_PERMIT';
  }
  
  return Math.random() > 0.5 ? 'VISITOR_VISA' : 'TRANSIT_PERMIT';
}

/**
 * Generates credential details based on traits
 */
function generateCredentialDetails(
  traits: SubjectTraits,
  name: string,
  idCode: string,
  credentialType: CredentialType,
  destinationPlanet: string
): CredentialDetails {
  const currentYear = 3184;
  const issuedYear = currentYear - Math.floor(Math.random() * 2);
  const issuedMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const issuedDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  const expirationYear = issuedYear + (credentialType === 'TRANSIT_PERMIT' ? 0.25 : 1);
  const expirationMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const expirationDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  const planetCodes: Record<OriginPlanet, string> = {
    'DISTRICT 1': 'D1',
    'DISTRICT 2': 'D2',
    'DISTRICT 3': 'D3',
    'DISTRICT 4': 'D4',
    'DISTRICT 5': 'D5',
  };
  
  const credentialNumbers: Record<CredentialType, string> = {
    PASSPORT: `PP-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
    WORK_PERMIT: `WP-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
    VISITOR_VISA: `VV-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
    MEDICAL_CLEARANCE: `MC-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
    DIPLOMATIC_PASS: `DP-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
    TRANSIT_PERMIT: `TP-${planetCodes[traits.originPlanet]}-${Math.floor(Math.random() * 10000)}`,
  };
  
  const issuingAuthorities: Record<OriginPlanet, string> = {
    'DISTRICT 1': 'DISTRICT 1 CIVIL REGISTRY',
    'DISTRICT 2': 'DISTRICT 2 PUBLIC SERVICES',
    'DISTRICT 3': 'DISTRICT 3 ADMIN OFFICE',
    'DISTRICT 4': 'DISTRICT 4 MUNICIPAL OFFICE',
    'DISTRICT 5': 'DISTRICT 5 RESIDENT SERVICES',
  };
  
  const anomalies: string[] = [];
  
  // Replicants might have suspicious credentials
  if (traits.subjectType === 'REPLICANT' && Math.random() > 0.5) {
    anomalies.push('Documentation trail incomplete');
    anomalies.push('Issuance date inconsistent with travel records');
  }
  
  return {
    type: credentialType,
    number: credentialNumbers[credentialType],
    issuedBy: issuingAuthorities[traits.originPlanet],
    issuedDate: `${issuedYear}-${issuedMonth}-${issuedDay}`,
    expirationDate: `${Math.floor(expirationYear)}-${expirationMonth}-${expirationDay}`,
    holderName: name,
    originPlanet: traits.originPlanet,
    destinationPlanet,
    purpose: generateReasonForVisit(traits),
    valid: anomalies.length === 0,
    anomalies,
  };
}

/**
 * Generates BPM baseline modifier based on communication style and credential behavior
 */
function generateBPMModifier(
  communicationStyle: CommunicationStyle,
  credentialBehavior: CredentialBehavior,
  personality: PersonalityTraits
): number {
  let modifier = 0;
  
  // Communication style modifiers
  switch (communicationStyle) {
    case 'SILENT':
      modifier += 15;
      break;
    case 'AGITATED':
      modifier += 20;
      break;
    case 'BROKEN':
      modifier += 10;
      break;
    case 'GIBBERISH':
      modifier += 5;
      break;
    case 'FORMAL':
      modifier -= 5;
      break;
    case 'FLUENT':
      modifier -= 2;
      break;
  }
  
  // Credential behavior modifiers
  switch (credentialBehavior) {
    case 'NONE':
      modifier += 15;
      break;
    case 'RELUCTANT':
      modifier += 10;
      break;
    case 'MISSING':
      modifier += 12;
      break;
    case 'FORGED':
      modifier += 8;
      break;
    case 'MULTIPLE':
      modifier += 5;
      break;
    case 'COOPERATIVE':
      modifier -= 2;
      break;
  }
  
  // Personality modifiers
  if (personality.primaryType === 'NERVOUS') {
    modifier += 10;
  } else if (personality.primaryType === 'ARROGANT') {
    modifier -= 5;
  }
  
  return modifier;
}

/**
 * Generates dossier data based on traits
 */
function generateDossierData(traits: SubjectTraits, name: string, sex: 'M' | 'F' | 'X'): SubjectData['dossier'] {
  const occupations: Record<HierarchyTier, string[]> = {
    LOWER: ['Factory Worker', 'Maintenance Tech', 'Service Worker', 'Laborer'],
    MIDDLE: ['Data Analyst', 'Administrator', 'Technician', 'Coordinator'],
    UPPER: ['Executive', 'Director', 'Manager', 'Supervisor'],
    VIP: ['Ambassador', 'Chancellor', 'Senator', 'CEO'],
  };

  const addresses: Record<OriginPlanet, string[]> = {
    'DISTRICT 1': ['District 1, Sector 7', 'District 1, Block 3', 'District 1, Yard 12'],
    'DISTRICT 2': ['District 2, North Row', 'District 2, Block 9', 'District 2, Court 4'],
    'DISTRICT 3': ['District 3, Central Row', 'District 3, Block 5', 'District 3, Lane 8'],
    'DISTRICT 4': ['District 4, West Works', 'District 4, Block 2', 'District 4, Yard 6'],
    'DISTRICT 5': ['District 5, Outer Ring', 'District 5, Block 11', 'District 5, Yard 3'],
  };

  const occupation = occupations[traits.hierarchyTier][
    Math.floor(Math.random() * occupations[traits.hierarchyTier].length)
  ];
  const address = addresses[traits.originPlanet][
    Math.floor(Math.random() * addresses[traits.originPlanet].length)
  ];

  // Generate random date of birth (age 20-60) in dd/mm/yyyy format
  const currentYear = 3184;
  const age = 20 + Math.floor(Math.random() * 40);
  const birthYear = currentYear - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');

  return {
    name,
    dateOfBirth: `${day}/${month}/${birthYear}`,
    address,
    occupation,
    sex: sex === 'M' ? 'MALE' : sex === 'F' ? 'FEMALE' : 'UNKNOWN',
  };
}

// =============================================================================
// MAIN FACTORY FUNCTION
// =============================================================================

/**
 * Creates a subject from traits with optional overrides
 */
export function createSubjectFromTraits(
  traits: SubjectTraits,
  sex: 'M' | 'F' | 'X' = 'M',
  config: SubjectFactoryConfig = {}
): SubjectData {
  // Validate trait combination
  const validation = validateTraitCombination(traits);
  if (!validation.valid) {
    throw new Error(`Invalid trait combination: ${validation.reason}`);
  }

  // Generate base data from traits
  const name = config.manualOverrides?.name || generateNameFromTraits(traits, sex);
  const idCode = config.manualOverrides?.id || generateIdCodeFromTraits(traits);
  const reasonForVisit = config.manualOverrides?.reasonForVisit || generateReasonForVisit(traits);

  // Assign assets (skip if using procedural portrait)
  const useProcedural = config.useProceduralPortrait ?? false;
  const manualAssetOverride = getManualAssetOverride(idCode);
  const assets = useProcedural 
    ? { videoSource: undefined, eyeImage: undefined, profilePic: undefined, eyeVideo: undefined }
    : (config.assetOverrides || manualAssetOverride || 
        assignAssetsToSubject(traits.subjectType, traits.hierarchyTier, sex, config.seed));

  // Generate personality first (needed for communication/credential generation)
  const personality = generatePersonalityTraits(traits.hierarchyTier);
  
  // Generate communication style and credential behavior
  const communicationStyle = config.manualOverrides?.communicationStyle || 
    generateCommunicationStyle(traits, personality);
  const credentialBehavior = config.manualOverrides?.credentialBehavior || 
    generateCredentialBehavior(traits, personality);
  
  // Generate greeting text
  const greetingText = config.manualOverrides?.greetingText || 
    generateGreetingText(traits, name, communicationStyle, reasonForVisit);
  
  // Generate credential details
  const credentialType = generateCredentialType(traits);
  const destinationPlanet = config.manualOverrides?.destinationPlanet || 'CENTRAL HUB';
  const credentialDetails = generateCredentialDetails(traits, name, idCode, credentialType, destinationPlanet);

  // Apply credential behavior flags to credential validity/anomalies
  if (credentialBehavior === 'FORGED') {
    credentialDetails.valid = false;
    credentialDetails.anomalies = [...credentialDetails.anomalies, 'Document forgery suspected'];
  } else if (credentialBehavior === 'MISSING') {
    credentialDetails.valid = false;
    credentialDetails.anomalies = [...credentialDetails.anomalies, 'Credential missing or expired'];
  } else if (credentialBehavior === 'MULTIPLE') {
    credentialDetails.anomalies = [...credentialDetails.anomalies, 'Conflicting credentials presented'];
  } else if (credentialBehavior === 'NONE') {
    credentialDetails.valid = false;
    credentialDetails.anomalies = [...credentialDetails.anomalies, 'No credentials provided'];
  } else if (credentialBehavior === 'RELUCTANT') {
    credentialDetails.anomalies = [...credentialDetails.anomalies, 'Delayed presentation'];
  }
  
  // Generate BPM baseline modifier
  const bpmModifier = generateBPMModifier(communicationStyle, credentialBehavior, personality);
  const baseBPM = 72 + Math.floor(Math.random() * 10);
  const initialBPM = baseBPM + bpmModifier;

  // Dossier (allow partial override)
  const generatedDossier = generateDossierData(traits, name, sex);
  const dossier = config.manualOverrides?.dossier
    ? { ...generatedDossier, ...config.manualOverrides.dossier }
    : generatedDossier;

  // Generate subject data
  const subject: SubjectData = {
    // Core Identity
    name,
    id: idCode,
    sex,
    
    // Traits
    subjectType: traits.subjectType,
    hierarchyTier: traits.hierarchyTier,
    originPlanet: traits.originPlanet,
    
    // Status
    compliance: 'C',
    status: 'ACTIVE',
    
    // Flags
    incidents: 0,
    warrants: 'NONE',
    
    // Request
    reasonForVisit,
    destinationPlanet,
    
    // Assets
    videoSource: assets.videoSource,
    eyeImage: assets.eyeImage,
    profilePic: assets.profilePic,
    eyeVideo: assets.eyeVideo,
    videoStartTime: 0,
    videoEndTime: 3,
    useProceduralPortrait: useProcedural,
    
    // BPM
    bpm: initialBPM,
    
    // Personality (both fields for compatibility)
    personality,
    personalityTraits: personality, // Alias for compatibility
    
    // Phase 4: Communication and credentials (stored for greeting/credential systems)
    communicationStyle,
    credentialBehavior,
    greetingText,
    credentialType,
    credentialDetails: [credentialDetails], // Store as array for compatibility
    
    // Biometric Data
    biometricData: generateBiometricData(traits.subjectType),
    
    // ID Data
    idData: generateIdData(traits, name, idCode),
    
    // Bio Scan Data
    bioScanData: generateBioScanData(traits.subjectType),
    
    // Outcomes (default - should be overridden for narrative subjects)
    outcomes: {
      APPROVE: {
        feedback: 'SUBJECT PROCESSED',
        consequence: 'Subject entered Earth.',
        flagWeight: 0,
      },
      DENY: {
        feedback: 'ENTRY DENIED',
        consequence: 'Subject detained.',
        flagWeight: 0,
      },
    },
    
    // Dossier
    dossier,
  };

  // Apply manual overrides (excluding dossier which is already merged above)
  if (config.manualOverrides) {
    const { dossier: _excludeDossier, ...otherOverrides } = config.manualOverrides;
    Object.assign(subject, otherOverrides);
  }

  return subject;
}

/**
 * Generates a random subject
 */
export function generateRandomSubject(
  sex: 'M' | 'F' | 'X' = 'M',
  useProceduralPortrait: boolean = false
): SubjectData {
  const traits = generateRandomTraits();
  return createSubjectFromTraits(traits, sex, { useProceduralPortrait });
}

/**
 * Generates a subject from a seed (deterministic)
 */
export function generateSubjectFromSeed(
  seed: number,
  sex: 'M' | 'F' | 'X' = 'M',
  useProceduralPortrait: boolean = false
): SubjectData {
  const traits = generateTraitsFromSeed(seed);
  return createSubjectFromTraits(traits, sex, { seed, useProceduralPortrait });
}

/**
 * Generates a procedural subject (no video assets, uses holographic face)
 */
export function generateProceduralSubject(
  seed: number,
  sex: 'M' | 'F' | 'X' = 'M'
): SubjectData {
  return generateSubjectFromSeed(seed, sex, true);
}

/**
 * Generates multiple subjects with variety
 */
export function generateSubjectBatch(
  count: number,
  ensureVariety: boolean = true
): SubjectData[] {
  const subjects: SubjectData[] = [];
  const usedCombinations = new Set<string>();

  for (let i = 0; i < count; i++) {
    let subject: SubjectData;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      const sex = Math.random() > 0.5 ? 'M' : 'F';
      subject = generateRandomSubject(sex);
      
      if (!ensureVariety) break;
      
      const combinationKey = `${subject.subjectType}-${subject.hierarchyTier}-${subject.originPlanet}`;
      if (!usedCombinations.has(combinationKey) || attempts >= maxAttempts) {
        usedCombinations.add(combinationKey);
        break;
      }
      attempts++;
    } while (attempts < maxAttempts);

    subjects.push(subject);
  }

  return subjects;
}
