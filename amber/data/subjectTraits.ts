// =============================================================================
// SUBJECT TRAIT SYSTEM - Phase 5: Factory & Generation
// =============================================================================
// 3-trait system for procedural subject generation
// Trait combinations create 72+ unique subject variations

import { SubjectType, HierarchyTier } from './subjects';

// =============================================================================
// TRAIT DEFINITIONS
// =============================================================================

export type OriginPlanet = 'MARS' | 'EUROPA' | 'TITAN' | 'GANYMEDE' | 'CALLISTO';

export interface SubjectTraits {
  subjectType: SubjectType;
  hierarchyTier: HierarchyTier;
  originPlanet: OriginPlanet;
}

// =============================================================================
// TRAIT VALUES
// =============================================================================

export const SUBJECT_TYPES: SubjectType[] = [
  'HUMAN',
  'HUMAN_CYBORG',
  'ROBOT_CYBORG',
  'REPLICANT',
  'PLASTIC_SURGERY',
  'AMPUTEE',
];

export const HIERARCHY_TIERS: HierarchyTier[] = [
  'LOWER',
  'MIDDLE',
  'UPPER',
  'VIP',
];

export const ORIGIN_PLANETS: OriginPlanet[] = [
  'MARS',
  'EUROPA',
  'TITAN',
  'GANYMEDE',
  'CALLISTO',
];

// =============================================================================
// TRAIT COMBINATION VALIDATION
// =============================================================================

/**
 * Validates trait combinations to avoid impossible or broken combinations
 */
export function validateTraitCombination(traits: SubjectTraits): {
  valid: boolean;
  reason?: string;
} {
  // Replicants are typically lower/middle tier (corporate experiments)
  if (traits.subjectType === 'REPLICANT' && traits.hierarchyTier === 'VIP') {
    return {
      valid: false,
      reason: 'Replicants are not typically VIP tier',
    };
  }

  // Robot cyborgs are typically middle/upper tier (corporate assets)
  if (traits.subjectType === 'ROBOT_CYBORG' && traits.hierarchyTier === 'LOWER') {
    return {
      valid: false,
      reason: 'Robot cyborgs are typically corporate assets, not lower tier',
    };
  }

  // VIPs are typically human or human cyborg (corporate executives)
  if (traits.hierarchyTier === 'VIP' && 
      (traits.subjectType === 'REPLICANT' || traits.subjectType === 'AMPUTEE')) {
    return {
      valid: false,
      reason: 'VIP tier is typically reserved for human/human-cyborg executives',
    };
  }

  // Amputees are typically lower/middle tier (workers, accident victims)
  if (traits.subjectType === 'AMPUTEE' && traits.hierarchyTier === 'VIP') {
    return {
      valid: false,
      reason: 'Amputees are typically workers or accident victims, not VIP',
    };
  }

  return { valid: true };
}

// =============================================================================
// TRAIT COMBINATION GENERATION
// =============================================================================

/**
 * Generates all valid trait combinations
 */
export function generateAllTraitCombinations(): SubjectTraits[] {
  const combinations: SubjectTraits[] = [];

  for (const subjectType of SUBJECT_TYPES) {
    for (const hierarchyTier of HIERARCHY_TIERS) {
      for (const originPlanet of ORIGIN_PLANETS) {
        const traits: SubjectTraits = {
          subjectType,
          hierarchyTier,
          originPlanet,
        };

        const validation = validateTraitCombination(traits);
        if (validation.valid) {
          combinations.push(traits);
        }
      }
    }
  }

  return combinations;
}

/**
 * Generates a random valid trait combination
 */
export function generateRandomTraits(): SubjectTraits {
  const allCombinations = generateAllTraitCombinations();
  const randomIndex = Math.floor(Math.random() * allCombinations.length);
  return allCombinations[randomIndex];
}

/**
 * Generates deterministic traits based on a seed
 */
export function generateTraitsFromSeed(seed: number): SubjectTraits {
  const allCombinations = generateAllTraitCombinations();
  const index = seed % allCombinations.length;
  return allCombinations[index];
}

// =============================================================================
// TRAIT-BASED DATA GENERATION
// =============================================================================

/**
 * Generates subject name based on traits
 */
export function generateNameFromTraits(
  traits: SubjectTraits,
  sex: 'M' | 'F' | 'X'
): string {
  // Name pools based on origin planet and hierarchy
  const namePrefixes: Record<OriginPlanet, { M: string[]; F: string[] }> = {
    MARS: {
      M: ['Marcus', 'Terra', 'Red', 'Colony'],
      F: ['Mara', 'Ares', 'Rust', 'Dust'],
    },
    EUROPA: {
      M: ['Erik', 'Ice', 'Frost', 'Crystal'],
      F: ['Elena', 'Frost', 'Ice', 'Glacier'],
    },
    TITAN: {
      M: ['Titan', 'Corp', 'Nexus', 'Prime'],
      F: ['Terra', 'Corp', 'Nexus', 'Prime'],
    },
    GANYMEDE: {
      M: ['Gan', 'Jove', 'Outer', 'Rim'],
      F: ['Gan', 'Jove', 'Outer', 'Rim'],
    },
    CALLISTO: {
      M: ['Cal', 'Deep', 'Far', 'Edge'],
      F: ['Cal', 'Deep', 'Far', 'Edge'],
    },
  };

  const nameSuffixes: Record<HierarchyTier, string[]> = {
    LOWER: ['Worker', 'Unit', 'Gen', 'Block'],
    MIDDLE: ['Tech', 'Admin', 'Sector', 'Level'],
    UPPER: ['Executive', 'Director', 'Chief', 'Prime'],
    VIP: ['Ambassador', 'Chancellor', 'Senator', 'Prime'],
  };

  const prefixes = namePrefixes[traits.originPlanet][sex];
  const suffixes = nameSuffixes[traits.hierarchyTier];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${prefix} ${suffix}`;
}

/**
 * Generates ID code based on traits
 */
export function generateIdCodeFromTraits(traits: SubjectTraits): string {
  const planetCodes: Record<OriginPlanet, string> = {
    MARS: 'MA',
    EUROPA: 'EU',
    TITAN: 'TP',
    GANYMEDE: 'GA',
    CALLISTO: 'CA',
  };

  const tierCodes: Record<HierarchyTier, string> = {
    LOWER: 'L',
    MIDDLE: 'M',
    UPPER: 'U',
    VIP: 'V',
  };

  const typeCodes: Record<SubjectType, string> = {
    HUMAN: 'H',
    HUMAN_CYBORG: 'HC',
    ROBOT_CYBORG: 'RC',
    REPLICANT: 'R',
    PLASTIC_SURGERY: 'PS',
    AMPUTEE: 'A',
  };

  const randomNum = Math.floor(Math.random() * 10000);
  const planetCode = planetCodes[traits.originPlanet];
  const tierCode = tierCodes[traits.hierarchyTier];
  const typeCode = typeCodes[traits.subjectType];

  return `${planetCode}-${randomNum}-${tierCode}${typeCode}`;
}

/**
 * Generates reason for visit based on traits
 */
export function generateReasonForVisit(traits: SubjectTraits): string {
  const reasons: Record<HierarchyTier, string[]> = {
    LOWER: [
      'Seeking employment opportunities',
      'Family reunion',
      'Medical treatment',
      'Refugee status',
      'Work permit application',
    ],
    MIDDLE: [
      'Business meeting',
      'Academic conference',
      'Medical consultation',
      'Family visit',
      'Work assignment',
    ],
    UPPER: [
      'Corporate negotiations',
      'Diplomatic mission',
      'Executive meeting',
      'Strategic planning',
      'High-level consultation',
    ],
    VIP: [
      'Diplomatic summit',
      'Corporate merger',
      'Interplanetary treaty',
      'Executive retreat',
      'VIP exclusive event',
    ],
  };

  const tierReasons = reasons[traits.hierarchyTier];
  return tierReasons[Math.floor(Math.random() * tierReasons.length)];
}
