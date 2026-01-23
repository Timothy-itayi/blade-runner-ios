// =============================================================================
// SUBJECT MANAGER - Phase 5: Factory & Generation
// =============================================================================
// Manages mixing of manual and procedurally generated subjects

import { SubjectData } from '../data/subjects';
import { SUBJECTS } from '../data/subjects';
import { 
  generateRandomSubject, 
  generateSubjectFromSeed, 
  generateSubjectBatch,
  createSubjectFromTraits,
} from './subjectFactory';
import { generateRandomTraits, SubjectTraits } from '../data/subjectTraits';

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
      const manualSubject = SUBJECTS.find(s => s.id === subjectId);
      if (manualSubject) {
        pool.push(manualSubject);
      }
    }
    return pool;
  }
  
  const pool: SubjectData[] = [];
  const usedManualIds = new Set<string>();
  const usedGeneratedSeeds = new Set<number>();
  
  // First, add required manual subjects
  for (const subjectId of requiredSubjectIds) {
    const manualSubject = SUBJECTS.find(s => s.id === subjectId);
    if (manualSubject) {
      pool.push(manualSubject);
      usedManualIds.add(subjectId);
    }
  }
  
  // Calculate how many more subjects we need
  const remainingSlots = totalSubjects - pool.length;
  const generatedCount = Math.floor(remainingSlots * generatedRatio);
  const manualCount = remainingSlots - generatedCount;
  
  // Add manual subjects (excluding already used ones)
  const availableManualSubjects = SUBJECTS.filter(s => !usedManualIds.has(s.id));
  for (let i = 0; i < manualCount && i < availableManualSubjects.length; i++) {
    pool.push(availableManualSubjects[i]);
  }
  
  // Add generated subjects
  if (seed !== undefined) {
    // Deterministic generation
    for (let i = 0; i < generatedCount; i++) {
      const subjectSeed = seed + i;
      const subject = generateSubjectFromSeed(subjectSeed);
      pool.push(subject);
    }
  } else {
    // Random generation
    const generated = generateSubjectBatch(generatedCount, true);
    pool.push(...generated);
  }
  
  // Shuffle the pool (except required subjects stay at the start)
  const requiredSubjects = pool.slice(0, requiredSubjectIds.length);
  const restOfPool = pool.slice(requiredSubjectIds.length);
  
  // Simple shuffle
  for (let i = restOfPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [restOfPool[i], restOfPool[j]] = [restOfPool[j], restOfPool[i]];
  }
  
  return [...requiredSubjects, ...restOfPool];
}

/**
 * Gets a subject by index, using either manual or generated pool
 */
export function getSubjectByIndex(
  index: number,
  pool: SubjectData[]
): SubjectData {
  if (index < 0 || index >= pool.length) {
    // Fallback: generate a random subject
    return generateRandomSubject();
  }
  
  return pool[index];
}

/**
 * Creates a default subject pool for the game
 * Uses 12 narrative subjects + 3 generated subjects (padding)
 */
export function createDefaultSubjectPool(): SubjectData[] {
  return createSubjectPool({
    generatedRatio: 1.0, // Only the non-required slots are generated
    totalSubjects: 15, // 12 narrative + 3 extra subjects
    seed: 41017, // deterministic extra subjects (stable progression)
    requiredSubjectIds: [
      'S1-01', 'S1-02', 'S1-03', 'S1-04', // Shift 1
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
  return [...SUBJECTS];
}
