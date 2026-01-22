// =============================================================================
// ASSET POOLS - Phase 5: Factory & Generation
// =============================================================================
// Asset assignment system for procedurally generated subjects

import { SubjectType, HierarchyTier } from './subjects';
import { OriginPlanet } from './subjectTraits';

// Eye image arrays (from subjects.ts)
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
// ASSET POOL INTERFACE
// =============================================================================

export interface AssetPool {
  videoSources: any[];
  eyeImages: any[];
  profilePics: any[];
  eyeVideos?: any[];
}

// =============================================================================
// ASSET POOLS BY TRAIT
// =============================================================================

/**
 * Gets asset pool based on subject type and hierarchy
 */
export function getAssetPoolForTraits(
  subjectType: SubjectType,
  hierarchyTier: HierarchyTier,
  sex: 'M' | 'F' | 'X'
): AssetPool {
  // Default pools (can be expanded with more assets)
  const defaultVideoSources = [
    require('../assets/videos/subjects/subject02.mp4'),
    require('../assets/videos/subjects/subject03.mp4'),
  ];

  const eyeImages = sex === 'F' ? FEMALE_EYES : MALE_EYES;

  // VIP subjects might have special assets
  if (hierarchyTier === 'VIP') {
    return {
      videoSources: defaultVideoSources, // Could add VIP-specific videos
      eyeImages,
      profilePics: [], // Profile pics optional
    };
  }

  // Replicants might have synthetic-looking assets
  if (subjectType === 'REPLICANT') {
    return {
      videoSources: defaultVideoSources,
      eyeImages,
      profilePics: [],
    };
  }

  // Default pool
  return {
    videoSources: defaultVideoSources,
    eyeImages,
    profilePics: [],
  };
}

/**
 * Selects a random asset from a pool
 */
export function selectAssetFromPool<T>(pool: T[], seed?: number): T {
  if (pool.length === 0) {
    throw new Error('Asset pool is empty');
  }

  if (seed !== undefined) {
    return pool[seed % pool.length];
  }

  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Assigns assets to a subject based on traits
 */
export function assignAssetsToSubject(
  subjectType: SubjectType,
  hierarchyTier: HierarchyTier,
  sex: 'M' | 'F' | 'X',
  seed?: number
): {
  videoSource: any;
  eyeImage: any;
  profilePic?: any;
  eyeVideo?: any;
} {
  const pool = getAssetPoolForTraits(subjectType, hierarchyTier, sex);

  return {
    videoSource: selectAssetFromPool(pool.videoSources, seed),
    eyeImage: selectAssetFromPool(pool.eyeImages, seed),
    profilePic: pool.profilePics.length > 0 
      ? selectAssetFromPool(pool.profilePics, seed)
      : undefined,
    eyeVideo: pool.eyeVideos && pool.eyeVideos.length > 0
      ? selectAssetFromPool(pool.eyeVideos, seed)
      : undefined,
  };
}

// =============================================================================
// MANUAL ASSET OVERRIDES
// =============================================================================

/**
 * Manual asset overrides for narrative-critical subjects
 * These subjects have specific assets that should not be procedurally assigned
 */
export interface ManualAssetOverride {
  subjectId: string;
  videoSource?: any;
  eyeImage?: any;
  profilePic?: any;
  eyeVideo?: any;
}

/**
 * Checks if a subject has manual asset overrides
 */
export function getManualAssetOverride(subjectId: string): ManualAssetOverride | null {
  // This would be populated with specific overrides for key subjects
  // For now, return null (no overrides)
  return null;
}
