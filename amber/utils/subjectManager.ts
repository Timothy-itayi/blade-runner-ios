// =============================================================================
// SUBJECT MANAGER - Phase 5: Factory & Generation
// =============================================================================
// Manages mixing of manual and procedurally generated subjects

import { SubjectData } from '../data/subjects';
import { SUBJECT_SEEDS } from '../data/subjectSeeds';
import { buildSubjectFromSeed } from './subjectDirector';
import { getShiftForSubject } from '../constants/shifts';
import { DIRECTIVES } from '../data/directives';
import { SeededRandom } from './seededRandom';
import { generateTraitsFromSeed } from '../data/subjectTraits';
import type { SubjectSeed, SubjectRole } from '../types/subjectSeed';

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface SubjectManagerConfig {
  /** Ratio of generated to manual subjects (0.0 = all manual, 1.0 = all generated) */
  generatedRatio: number;
  /** Total number of subjects to generate */
  totalSubjects: number;
  /** Seed for deterministic generation (optional) */
  seed?: number;
  /** Manual subject IDs to always include (narrative-critical) */
  requiredSubjectIds?: string[];
}

const ROLE_POOL: SubjectRole[] = ['ENGINEER', 'MEDICAL', 'SECURITY', 'DIPLOMAT', 'CIVILIAN'];
const NAME_POOL = {
  M: ['EVA', 'REX', 'ORIN', 'JACE', 'DION', 'HUGO', 'COLE', 'REED'],
  F: ['NOVA', 'CASS', 'KIRA', 'ZARA', 'LYRA', 'IRIS', 'WREN', 'ZOYA'],
  X: ['SAGE', 'MIRA', 'FINN', 'REMY', 'TOVA', 'ASH', 'NYLA', 'NICO'],
};
const SURNAME_POOL = ['KANE', 'VOSS', 'RYDER', 'NOX', 'VALE', 'KELL', 'SOL', 'DANE'];

const createGeneratedSeed = (seedValue: number, index: number): SubjectSeed => {
  const rng = new SeededRandom(seedValue);
  const traits = generateTraitsFromSeed(seedValue);
  const sex = rng.pick(['M', 'F', 'X'] as const);
  const first = rng.pick(NAME_POOL[sex]);
  const last = rng.pick(SURNAME_POOL);
  const role = rng.pick(ROLE_POOL);
  return {
    id: `G-${seedValue}-${index}`,
    seed: seedValue,
    name: `${first} ${last}`,
    sex,
    subjectType: traits.subjectType,
    hierarchyTier: traits.hierarchyTier,
    originPlanet: traits.originPlanet,
    role,
    reasonForVisit: 'Transit clearance.',
    truthFlags: {
      hasWarrant: rng.bool(0.2),
      hasTransitIssue: rng.bool(0.3),
      hasIncident: rng.bool(0.2),
    },
    exceptionTags: [],
  };
};

// =============================================================================
// SUBJECT MANAGER
// =============================================================================

/**
 * Creates a subject pool mixing manual and generated subjects
 */
export function createSubjectPool(config: SubjectManagerConfig): SubjectData[] {
  const { generatedRatio, totalSubjects, seed, requiredSubjectIds = [] } = config;
  
  // Optimization: If we only need required subjects and no generation, return them directly
  if (generatedRatio === 0.0 && totalSubjects === requiredSubjectIds.length) {
    const pool: SubjectData[] = [];
    for (const subjectId of requiredSubjectIds) {
      const manualSeed = SUBJECT_SEEDS.find(s => s.id === subjectId);
      if (!manualSeed) continue;
      const shift = getShiftForSubject(pool.length);
      const directive = shift.directiveModel ?? DIRECTIVES.SHIFT_1;
      pool.push(buildSubjectFromSeed(manualSeed, directive));
    }
    return pool;
  }
  
  const seedPool: SubjectSeed[] = [];
  const usedManualIds = new Set<string>();
  
  // First, add required manual subjects
  for (const subjectId of requiredSubjectIds) {
    const manualSeed = SUBJECT_SEEDS.find(s => s.id === subjectId);
    if (!manualSeed) continue;
    seedPool.push(manualSeed);
    usedManualIds.add(subjectId);
  }
  
  // Calculate how many more subjects we need
  const remainingSlots = totalSubjects - seedPool.length;
  const generatedCount = Math.floor(remainingSlots * generatedRatio);
  const manualCount = remainingSlots - generatedCount;
  
  // Add manual subjects (excluding already used ones)
  const availableManualSeeds = SUBJECT_SEEDS.filter(s => !usedManualIds.has(s.id));
  for (let i = 0; i < manualCount && i < availableManualSeeds.length; i++) {
    seedPool.push(availableManualSeeds[i]);
  }
  
  // Add generated subjects
  const baseSeed = seed ?? Math.floor(Math.random() * 100000);
  for (let i = 0; i < generatedCount; i++) {
    seedPool.push(createGeneratedSeed(baseSeed + i, i));
  }
  
  // Shuffle the pool (except required subjects stay at the start)
  const requiredSeeds = seedPool.slice(0, requiredSubjectIds.length);
  const restOfPool = seedPool.slice(requiredSubjectIds.length);
  
  // Simple shuffle
  for (let i = restOfPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [restOfPool[i], restOfPool[j]] = [restOfPool[j], restOfPool[i]];
  }
  
  const finalSeeds = [...requiredSeeds, ...restOfPool];
  return finalSeeds.map((seedItem, index) => {
    const shift = getShiftForSubject(index);
    const directive = shift.directiveModel ?? DIRECTIVES.SHIFT_1;
    return buildSubjectFromSeed(seedItem, directive);
  });
}

/**
 * Gets a subject by index, using either manual or generated pool
 */
export function getSubjectByIndex(
  index: number,
  pool: SubjectData[]
): SubjectData {
  if (index < 0 || index >= pool.length) {
    return pool[0];
  }
  
  return pool[index];
}

/**
 * Creates a default subject pool for the game
 * Uses 12 narrative subjects + 3 generated subjects (padding)
 */
export function createDefaultSubjectPool(): SubjectData[] {
  return createSubjectPool({
    generatedRatio: 0.0,
    totalSubjects: SUBJECT_SEEDS.length,
    seed: 41017,
    requiredSubjectIds: [
      'S1-01', 'S1-02', 'S1-03', 'S1-04', 'S1-05', 'S1-06', 'S1-07', 'S1-08', 'S1-09', // Shift 1
      'S2-01', 'S2-02', 'S2-03', 'S2-04', // Shift 2
      'S3-01', 'S3-02', 'S3-03', 'S3-04', // Shift 3
    ],
  });
}

/**
 * Creates a fully generated subject pool (for testing/procedural mode)
 */
export function createGeneratedSubjectPool(count: number, seed?: number): SubjectData[] {
  return createSubjectPool({
    generatedRatio: 1.0,
    totalSubjects: count,
    seed,
  });
}

/**
 * Creates a fully manual subject pool (original behavior)
 */
export function createManualSubjectPool(): SubjectData[] {
  return createSubjectPool({
    generatedRatio: 0.0,
    totalSubjects: SUBJECT_SEEDS.length,
    requiredSubjectIds: SUBJECT_SEEDS.map((seedItem) => seedItem.id),
  });
}
