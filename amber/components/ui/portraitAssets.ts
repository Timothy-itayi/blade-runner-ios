// =============================================================================
// SEX-SEGREGATED HUMAN PORTRAITS
// =============================================================================

// Male human portraits
export const HUMAN_PORTRAITS_MALE = [
  require('../../assets/ai-portraits/asian-late30s-male.png'),
  require('../../assets/ai-portraits/male-white-40s.png'),
  require('../../assets/ai-portraits/male-white-late30s.png'),
  require('../../assets/ai-portraits/black-male-teens.png'),
];

// Female human portraits
export const HUMAN_PORTRAITS_FEMALE = [
  require('../../assets/ai-portraits/female-late30s-white.png'),
  require('../../assets/ai-portraits/mixed-female-young.png'),
  require('../../assets/ai-portraits/white-female-20s.png'),
];

// Combined for legacy compatibility
export const HUMAN_PORTRAITS = [
  ...HUMAN_PORTRAITS_MALE,
  ...HUMAN_PORTRAITS_FEMALE,
];

// =============================================================================
// COMBINED ASSETS (legacy compatibility)
// =============================================================================

// Human-only portrait set (synthetics removed)
export const HEAD_ASSETS = [
  ...HUMAN_PORTRAITS,
];

// All male portraits (for sex-aware fallback)
export const HEAD_ASSETS_MALE = [
  ...HUMAN_PORTRAITS_MALE,
];

// All female portraits (for sex-aware fallback)
export const HEAD_ASSETS_FEMALE = [
  ...HUMAN_PORTRAITS_FEMALE,
];

// =============================================================================
// PORTRAIT SELECTION FUNCTIONS
// =============================================================================

export type SubjectSex = 'M' | 'F' | 'X';
// Kept for compatibility with call-sites, but this module only serves human portraits now.
export type SubjectType = 'HUMAN' | 'REPLICANT' | 'HYBRID' | 'CONSTRUCT' | 'REMNANT' | 'UNKNOWN';

/**
 * Legacy function - gets portrait by index only (may mismatch sex)
 * @deprecated Use getHeadAssetBySex instead
 */
export const getHeadAsset = (index: number) =>
  HEAD_ASSETS[index % HEAD_ASSETS.length];

/**
 * Sex-aware portrait selection - ensures portrait matches subject's sex
 */
export const getHeadAssetBySex = (index: number, sex: SubjectSex): any => {
  switch (sex) {
    case 'M':
      return HEAD_ASSETS_MALE[index % HEAD_ASSETS_MALE.length];
    case 'F':
      return HEAD_ASSETS_FEMALE[index % HEAD_ASSETS_FEMALE.length];
    case 'X':
    default:
      // Non-binary/unknown: fall back to full human set
      return HEAD_ASSETS[index % HEAD_ASSETS.length];
  }
};

/**
 * Get portrait by subject type (legacy - no sex awareness)
 * @deprecated Use getPortraitByTypeAndSex instead
 */
export const getPortraitByType = (type: SubjectType, index: number) => {
  // Human-only: ignore `type` and return from the human pool.
  return HUMAN_PORTRAITS[index % HUMAN_PORTRAITS.length];
};

/**
 * Sex-aware portrait selection by type - primary function to use
 */
export const getPortraitByTypeAndSex = (
  type: SubjectType,
  sex: SubjectSex,
  index: number
): any => {
  // Human-only: ignore `type`, keep sex-aware selection for humans.
  return getHeadAssetBySex(index, sex);
};

/**
 * Get portrait index range for a given sex (used by face generator)
 */
export const getPortraitIndexRangeForSex = (sex: SubjectSex): { min: number; max: number } => {
  switch (sex) {
    case 'M':
      return { min: 0, max: HEAD_ASSETS_MALE.length - 1 };
    case 'F':
      return { min: 0, max: HEAD_ASSETS_FEMALE.length - 1 };
    case 'X':
    default:
      return { min: 0, max: HEAD_ASSETS.length - 1 };
  }
};

export const OVERLAY_ASSETS = [
  require('../../assets/textures/Texturelabs_Glass_127S.jpg'),
  require('../../assets/textures/Texturelabs_Grunge_342S.jpg'),
  require('../../assets/textures/leather_red_02_coll1_1k.png'),
];

export const getOverlayAsset = (index: number) =>
  OVERLAY_ASSETS[index % OVERLAY_ASSETS.length];
