// =============================================================================
// ASSET POOLS - Deprecated (Procedural Portrait System)
// =============================================================================
// This file is maintained for backwards compatibility.
// New subjects use procedural portrait generation and don't need asset pools.

import { SubjectType, HierarchyTier } from './subjects';

// =============================================================================
// ASSET POOL INTERFACE
// =============================================================================

export interface AssetPool {
  videoSources: any[];
  eyeImages: any[];
  profilePics: any[];
  eyeVideos?: any[];
}

// =============================================================================
// ASSET POOLS - Empty (using procedural portraits now)
// =============================================================================

/**
 * Gets asset pool based on subject type and hierarchy
 * Returns empty pools as we're using procedural portraits
 */
export function getAssetPoolForTraits(
  _subjectType: SubjectType,
  _hierarchyTier: HierarchyTier,
  _sex: 'M' | 'F' | 'X'
): AssetPool {
  // All subjects now use procedural portraits
  return {
    videoSources: [],
    eyeImages: [],
    profilePics: [],
    eyeVideos: [],
  };
}

/**
 * Selects a random asset from a pool
 */
export function selectAssetFromPool<T>(pool: T[], seed?: number): T | undefined {
  if (pool.length === 0) {
    return undefined;
  }

  if (seed !== undefined) {
    return pool[seed % pool.length];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Assigns assets to a subject based on traits
 * Returns undefined for all assets as we're using procedural portraits
 */
export function assignAssetsToSubject(
  _subjectType: SubjectType,
  _hierarchyTier: HierarchyTier,
  _sex: 'M' | 'F' | 'X',
  _seed?: number
): {
  videoSource: any;
  eyeImage: any;
  profilePic?: any;
  eyeVideo?: any;
} {
  // All subjects now use procedural portraits
  return {
    videoSource: undefined,
    eyeImage: undefined,
    profilePic: undefined,
    eyeVideo: undefined,
  };
}

// =============================================================================
// MANUAL ASSET OVERRIDES - No longer used
// =============================================================================

export interface ManualAssetOverride {
  subjectId: string;
  videoSource?: any;
  eyeImage?: any;
  profilePic?: any;
  eyeVideo?: any;
}

/**
 * Checks if a subject has manual asset overrides
 * Always returns null as we're using procedural portraits
 */
export function getManualAssetOverride(_subjectId: string): ManualAssetOverride | null {
  return null;
}
