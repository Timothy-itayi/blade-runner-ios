// =============================================================================
// FACE GENERATOR - Procedural facial geometry parameters
// =============================================================================
// Generates deterministic facial features from a subject seed
// Design goal: "A machine's imperfect reconstruction of a human"

import { SeededRandom } from './seededRandom';

/**
 * Facial geometry parameters used to render a procedural portrait
 */
export interface FaceGeometry {
  // Head shape
  headWidth: number;
  headHeight: number;
  jawWidth: number;
  jawHeight: number;
  foreheadHeight: number;
  
  // Eyes - intentionally misaligned
  eyeSpacing: number;
  eyeHeight: number;
  eyeWidth: number;
  eyeSlant: number;
  eyeDepth: number;
  leftEyeOffset: { x: number; y: number; scale: number };  // Left eye drift
  rightEyeOffset: { x: number; y: number; scale: number }; // Right eye drift
  pupilMisalignment: { left: number; right: number };      // Pupils don't track together
  
  // Nose
  noseLength: number;
  noseWidth: number;
  noseBridge: number;
  noseSkew: number; // Nose slightly off-center
  
  // Mouth
  mouthWidth: number;
  mouthHeight: number;
  lipThickness: number;
  mouthSkew: number; // Mouth asymmetry
  
  // Ears
  earSize: number;
  earPosition: number;
  leftEarScale: number;  // Ears different sizes
  rightEarScale: number;
  
  // Deliberate asymmetry - more pronounced than before
  asymmetryX: number;
  asymmetryY: number;
  skullTilt: number; // Head slightly tilted
  
  // Reconstruction defects
  defects: ReconstructionDefect[];
  
  // Instability parameters
  jitterFrequency: number;  // How often vertices jump
  jitterAmplitude: number;  // How much they jump
  driftSpeed: number;       // Slow drift of features
  
  // Data corruption
  glitchSeed: number;
  scanlineOffset: number;
  corruptionLevel: number;  // 0-1, affects missing geometry

  // PORTRAIT SYNTHESIS PARAMS (Option 1)
  baseHeadIndex: number; // 0-23
  overlayVariant: number;
  overlayIntensity: number;
  overlayScale: number;
  overlayRotation: number;
  warp: {
    jawTaper: number;
    cheekFullness: number;
    browHeight: number;
    eyeSpacing: number;
    noseWidth: number;
    mouthWidth: number;
  };
  tone: {
    hueShift: number; // -0.5 to 0.5
    saturation: number; // 0.5 to 1.5
    contrast: number; // 0.8 to 1.2
  };
  details: {
    freckleDensity: number;
    poreStrength: number;
    blemishSeed: number;
  };
  cyber: {
    barcodeIndex: number;
    scratchIntensity: number;
    glowStrength: number;
    scanlineIntensity: number;
  };
}

/**
 * Types of reconstruction defects the machine might produce
 */
export type DefectType = 
  | 'IMPLANT'           // Visible mechanical implant
  | 'GAP'               // Missing geometry hole
  | 'WIREFRAME_ONLY'    // Section renders as wireframe only
  | 'DUPLICATE'         // Ghosted/doubled feature
  | 'MISSING_FEATURE'   // Entire feature absent
  | 'GLITCH_ZONE'       // Area that flickers/corrupts
  | 'DEPTH_ERROR';      // Feature at wrong Z depth

export interface ReconstructionDefect {
  type: DefectType;
  location: 'LEFT_EYE' | 'RIGHT_EYE' | 'NOSE' | 'MOUTH' | 'LEFT_CHEEK' | 'RIGHT_CHEEK' | 'FOREHEAD' | 'JAW' | 'LEFT_EAR' | 'RIGHT_EAR';
  severity: number; // 0-1
  offset?: { x: number; y: number; z: number };
}

/**
 * Subject-specific visual traits derived from their type
 */
export interface SubjectVisualTraits {
  // Color scheme - cold, clinical
  primaryHue: number;        // 0-360 hue value
  glowIntensity: number;     // 0.5 - 2.0
  wireframeOpacity: number;  // 0.3 - 0.8
  fillOpacity: number;       // 0 - 0.3 (partial fill, mostly wireframe)
  
  // Uncanny indicators
  hasAnomalyMarkers: boolean;
  anomalyIntensity: number;
  
  // Machine perception artifacts
  signalNoise: number;       // Static/corruption
  scanStability: number;     // How stable the reconstruction is
  reconstructionQuality: number; // 0-1, lower = more defects visible
  
  // Dead eye effect
  eyeGlowColor: string;      // Usually different from face
  eyeFlickerRate: number;    // How often eyes flicker
  pupilDilation: number;     // Fixed, unnatural pupil size
}

type Range = [number, number];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

type SynthStyleProfile = {
  tone: {
    hueShift: Range;
    saturation: Range;
    contrast: Range;
  };
  details: {
    freckleDensity: Range;
    poreStrength: Range;
  };
  cyber: {
    scanlineIntensity: Range;
    scratchIntensity: Range;
    glowStrength: Range;
  };
  barcodeChance: number;
};

const OVERLAY_VARIANTS = 3;

const SYNTH_STYLE_PROFILES: Record<string, SynthStyleProfile> = {
  DEFAULT: {
    tone: {
      hueShift: [-0.12, 0.12],
      saturation: [0.8, 1.25],
      contrast: [1.0, 1.35],
    },
    details: {
      freckleDensity: [0, 1],
      poreStrength: [0, 0.5],
    },
    cyber: {
      scanlineIntensity: [0.2, 0.6],
      scratchIntensity: [0, 0.4],
      glowStrength: [0, 0.6],
    },
    barcodeChance: 0.3,
  },
  HUMAN: {
    tone: {
      hueShift: [-0.05, 0.05],
      saturation: [0.9, 1.15],
      contrast: [0.95, 1.2],
    },
    details: {
      freckleDensity: [0.2, 1],
      poreStrength: [0.15, 0.5],
    },
    cyber: {
      scanlineIntensity: [0.15, 0.45],
      scratchIntensity: [0, 0.25],
      glowStrength: [0.05, 0.35],
    },
    barcodeChance: 0.1,
  },
  REPLICANT: {
    tone: {
      hueShift: [-0.2, -0.05],
      saturation: [0.7, 1.05],
      contrast: [1.2, 1.5],
    },
    details: {
      freckleDensity: [0, 0.2],
      poreStrength: [0.1, 0.35],
    },
    cyber: {
      scanlineIntensity: [0.5, 0.85],
      scratchIntensity: [0.25, 0.7],
      glowStrength: [0.3, 0.8],
    },
    barcodeChance: 0.8,
  },
  HUMAN_CYBORG: {
    tone: {
      hueShift: [0.08, 0.2],
      saturation: [0.85, 1.2],
      contrast: [1.2, 1.45],
    },
    details: {
      freckleDensity: [0, 0.25],
      poreStrength: [0.15, 0.45],
    },
    cyber: {
      scanlineIntensity: [0.45, 0.8],
      scratchIntensity: [0.2, 0.6],
      glowStrength: [0.4, 0.9],
    },
    barcodeChance: 0.65,
  },
  ROBOT_CYBORG: {
    tone: {
      hueShift: [0.18, 0.32],
      saturation: [0.6, 0.95],
      contrast: [1.3, 1.6],
    },
    details: {
      freckleDensity: [0, 0.1],
      poreStrength: [0.05, 0.35],
    },
    cyber: {
      scanlineIntensity: [0.6, 0.95],
      scratchIntensity: [0.35, 0.85],
      glowStrength: [0.6, 1.1],
    },
    barcodeChance: 0.85,
  },
  PLASTIC_SURGERY: {
    tone: {
      hueShift: [0.04, 0.14],
      saturation: [1.05, 1.35],
      contrast: [1.05, 1.3],
    },
    details: {
      freckleDensity: [0, 0.1],
      poreStrength: [0, 0.2],
    },
    cyber: {
      scanlineIntensity: [0.2, 0.5],
      scratchIntensity: [0, 0.2],
      glowStrength: [0.2, 0.5],
    },
    barcodeChance: 0.2,
  },
  AMPUTEE: {
    tone: {
      hueShift: [-0.08, 0.08],
      saturation: [0.75, 1.1],
      contrast: [1.15, 1.4],
    },
    details: {
      freckleDensity: [0.1, 0.5],
      poreStrength: [0.2, 0.55],
    },
    cyber: {
      scanlineIntensity: [0.35, 0.75],
      scratchIntensity: [0.2, 0.6],
      glowStrength: [0.2, 0.6],
    },
    barcodeChance: 0.4,
  },
};

type VisualTraitsProfile = {
  baseHue: Range;
  glowIntensity: Range;
  wireframeOpacity: Range;
  fillOpacity: Range;
  signalNoise: Range;
  scanStability: Range;
  reconstructionQuality: Range;
  eyeFlickerRate: Range;
  pupilDilation: Range;
};

const VISUAL_TRAIT_PROFILES: Record<string, VisualTraitsProfile> = {
  DEFAULT: {
    baseHue: [170, 195],
    glowIntensity: [0.35, 0.9],
    wireframeOpacity: [0.55, 0.92],
    fillOpacity: [0.05, 0.18],
    signalNoise: [0.12, 0.32],
    scanStability: [0.35, 0.75],
    reconstructionQuality: [0.4, 0.75],
    eyeFlickerRate: [1.2, 4.5],
    pupilDilation: [0.35, 0.95],
  },
  HUMAN: {
    baseHue: [165, 185],
    glowIntensity: [0.25, 0.6],
    wireframeOpacity: [0.45, 0.75],
    fillOpacity: [0.08, 0.2],
    signalNoise: [0.08, 0.2],
    scanStability: [0.55, 0.9],
    reconstructionQuality: [0.6, 0.9],
    eyeFlickerRate: [0.8, 2.2],
    pupilDilation: [0.4, 0.85],
  },
  REPLICANT: {
    baseHue: [210, 240],
    glowIntensity: [0.6, 1.2],
    wireframeOpacity: [0.7, 1.0],
    fillOpacity: [0.02, 0.12],
    signalNoise: [0.25, 0.55],
    scanStability: [0.2, 0.55],
    reconstructionQuality: [0.25, 0.55],
    eyeFlickerRate: [2.5, 6.0],
    pupilDilation: [0.2, 0.6],
  },
  HUMAN_CYBORG: {
    baseHue: [35, 60],
    glowIntensity: [0.6, 1.1],
    wireframeOpacity: [0.6, 0.95],
    fillOpacity: [0.03, 0.14],
    signalNoise: [0.2, 0.45],
    scanStability: [0.3, 0.65],
    reconstructionQuality: [0.35, 0.65],
    eyeFlickerRate: [2.0, 5.0],
    pupilDilation: [0.25, 0.7],
  },
  ROBOT_CYBORG: {
    baseHue: [25, 55],
    glowIntensity: [0.8, 1.5],
    wireframeOpacity: [0.75, 1.05],
    fillOpacity: [0.0, 0.1],
    signalNoise: [0.3, 0.6],
    scanStability: [0.15, 0.5],
    reconstructionQuality: [0.2, 0.5],
    eyeFlickerRate: [3.0, 6.5],
    pupilDilation: [0.15, 0.5],
  },
  PLASTIC_SURGERY: {
    baseHue: [300, 330],
    glowIntensity: [0.4, 0.8],
    wireframeOpacity: [0.5, 0.85],
    fillOpacity: [0.08, 0.2],
    signalNoise: [0.1, 0.25],
    scanStability: [0.5, 0.85],
    reconstructionQuality: [0.55, 0.85],
    eyeFlickerRate: [1.0, 3.0],
    pupilDilation: [0.35, 0.75],
  },
  AMPUTEE: {
    baseHue: [150, 190],
    glowIntensity: [0.4, 0.9],
    wireframeOpacity: [0.6, 0.95],
    fillOpacity: [0.04, 0.16],
    signalNoise: [0.18, 0.4],
    scanStability: [0.3, 0.7],
    reconstructionQuality: [0.35, 0.7],
    eyeFlickerRate: [1.5, 4.5],
    pupilDilation: [0.3, 0.8],
  },
};

const getSynthStyleProfile = (subjectType?: string): SynthStyleProfile =>
  SYNTH_STYLE_PROFILES[subjectType || ''] || SYNTH_STYLE_PROFILES.DEFAULT;

const getVisualTraitProfile = (subjectType?: string): VisualTraitsProfile =>
  VISUAL_TRAIT_PROFILES[subjectType || ''] || VISUAL_TRAIT_PROFILES.DEFAULT;

function buildSynthParams(rng: SeededRandom, subjectType?: string, isAnomaly?: boolean) {
  const profile = getSynthStyleProfile(subjectType);
  const anomalyBoost = isAnomaly || subjectType === 'REPLICANT';

  let hueShift = rng.range(profile.tone.hueShift[0], profile.tone.hueShift[1]);
  let saturation = rng.range(profile.tone.saturation[0], profile.tone.saturation[1]);
  let contrast = rng.range(profile.tone.contrast[0], profile.tone.contrast[1]);
  let freckleDensity = rng.range(profile.details.freckleDensity[0], profile.details.freckleDensity[1]);
  let poreStrength = rng.range(profile.details.poreStrength[0], profile.details.poreStrength[1]);
  let scanlineIntensity = rng.range(profile.cyber.scanlineIntensity[0], profile.cyber.scanlineIntensity[1]);
  let scratchIntensity = rng.range(profile.cyber.scratchIntensity[0], profile.cyber.scratchIntensity[1]);
  let glowStrength = rng.range(profile.cyber.glowStrength[0], profile.cyber.glowStrength[1]);

  if (anomalyBoost) {
    hueShift += rng.range(-0.03, 0.03);
    saturation *= rng.range(0.9, 1.05);
    contrast *= rng.range(1.05, 1.2);
    scanlineIntensity += rng.range(0.08, 0.18);
    scratchIntensity += rng.range(0.08, 0.2);
    glowStrength += rng.range(0.1, 0.25);
  }

  return {
    tone: {
      hueShift: clamp(hueShift, -0.35, 0.35),
      saturation: clamp(saturation, 0.6, 1.5),
      contrast: clamp(contrast, 0.85, 1.7),
    },
    details: {
      freckleDensity: clamp(freckleDensity, 0, 1),
      poreStrength: clamp(poreStrength, 0, 0.7),
      blemishSeed: rng.next(),
    },
    cyber: {
      barcodeIndex: rng.bool(profile.barcodeChance) ? rng.int(1, 5) : 0,
      scratchIntensity: clamp(scratchIntensity, 0, 0.9),
      glowStrength: clamp(glowStrength, 0, 1.2),
      scanlineIntensity: clamp(scanlineIntensity, 0, 1.2),
    },
  };
}

/**
 * Complete procedural portrait data
 */
export interface ProceduralPortraitData {
  geometry: FaceGeometry;
  traits: SubjectVisualTraits;
  seed: string;
}

/**
 * Generates reconstruction defects based on seed
 */
function generateDefects(rng: SeededRandom): ReconstructionDefect[] {
  const defects: ReconstructionDefect[] = [];
  const defectCount = rng.int(2, 5); // 2-5 defects - more visible wrongness
  
  const locations: ReconstructionDefect['location'][] = [
    'LEFT_EYE', 'RIGHT_EYE', 'NOSE', 'MOUTH', 
    'LEFT_CHEEK', 'RIGHT_CHEEK', 'FOREHEAD', 'JAW',
    'LEFT_EAR', 'RIGHT_EAR'
  ];
  
  const types: DefectType[] = [
    'IMPLANT', 'GAP', 'WIREFRAME_ONLY', 'DUPLICATE',
    'GLITCH_ZONE', 'DEPTH_ERROR'
  ];
  
  const usedLocations = new Set<string>();
  
  for (let i = 0; i < defectCount; i++) {
    let location = rng.pick(locations);
    // Avoid duplicate locations
    let attempts = 0;
    while (usedLocations.has(location) && attempts < 10) {
      location = rng.pick(locations);
      attempts++;
    }
    usedLocations.add(location);
    
    defects.push({
      type: rng.pick(types),
      location,
      severity: rng.range(0.3, 1.0),
      offset: {
        x: rng.range(-0.02, 0.02),
        y: rng.range(-0.02, 0.02),
        z: rng.range(-0.01, 0.03),
      },
    });
  }
  
  return defects;
}

/**
 * Generates facial geometry parameters from a subject seed
 * Design: Machine's imperfect reconstruction - subtly wrong, unsettling
 */
export function generateFaceGeometry(
  seed: string,
  subjectType?: string,
  isAnomaly?: boolean,
  baseHeadIndexOverride?: number
): FaceGeometry {
  const rng = new SeededRandom(seed);
  const styleRng = new SeededRandom(`${seed}_synth`);
  const synthParams = buildSynthParams(styleRng, subjectType, isAnomaly);
  
  // Base eye parameters
  const baseEyeSpacing = rng.range(0.32, 0.45);
  const baseEyeHeight = rng.range(0.02, 0.12);
  const baseEyeWidth = rng.range(0.09, 0.14);
  
  const geometry: FaceGeometry = {
    // Head shape - slightly off
    headWidth: rng.range(0.85, 1.15),
    headHeight: rng.range(0.88, 1.12),
    jawWidth: rng.range(0.55, 0.85),
    jawHeight: rng.range(0.25, 0.42),
    foreheadHeight: rng.range(0.14, 0.32),
    
    // Eyes - intentionally misaligned for uncanny effect
    eyeSpacing: baseEyeSpacing,
    eyeHeight: baseEyeHeight,
    eyeWidth: baseEyeWidth,
    eyeSlant: rng.range(-15, 15),
    eyeDepth: rng.range(0.02, 0.06),
    
    // Left eye - pronounced drift for uncanny effect
    leftEyeOffset: {
      x: rng.range(-0.04, 0.02),
      y: rng.range(-0.035, 0.04),
      scale: rng.range(0.82, 1.12),  // More size mismatch
    },
    
    rightEyeOffset: {
      x: rng.range(-0.02, 0.04),
      y: rng.range(-0.04, 0.035),
      scale: rng.range(0.85, 1.15),
    },
    
    // Pupils don't track - fixed, wrong
    pupilMisalignment: {
      left: rng.range(-0.05, 0.05),
      right: rng.range(-0.05, 0.05),
    },
    
    // Nose - slightly crooked
    noseLength: rng.range(0.16, 0.26),
    noseWidth: rng.range(0.06, 0.12),
    noseBridge: rng.range(0.02, 0.05),
    noseSkew: rng.range(-0.02, 0.02),
    
    // Mouth - asymmetric, slightly wrong
    mouthWidth: rng.range(0.16, 0.30),
    mouthHeight: rng.range(-0.26, -0.14),
    lipThickness: rng.range(0.02, 0.05),
    mouthSkew: rng.range(-0.03, 0.03),
    
    // Ears - different sizes (machine can't reconstruct consistently)
    earSize: rng.range(0.08, 0.15),
    earPosition: rng.range(-0.06, 0.1),
    leftEarScale: rng.range(0.85, 1.15),
    rightEarScale: rng.range(0.85, 1.15),
    
    // Strong asymmetry - visibly wrong
    asymmetryX: rng.range(-0.055, 0.055),
    asymmetryY: rng.range(-0.048, 0.048),
    skullTilt: rng.range(-7, 7),
    
    defects: generateDefects(rng),
    
    // Unstable reconstruction - visible jitter
    jitterFrequency: rng.range(3, 10),
    jitterAmplitude: rng.range(0.006, 0.022),
    driftSpeed: rng.range(0.15, 0.5),
    
    glitchSeed: rng.int(0, 10000),
    scanlineOffset: rng.next(),
    corruptionLevel: rng.range(0.2, 0.55),  // More dropout, missing data

    // PORTRAIT SYNTHESIS PARAMS
    baseHeadIndex: baseHeadIndexOverride ?? rng.int(0, 2), // 3 ai portraits available
    overlayVariant: rng.int(0, OVERLAY_VARIANTS - 1),
    overlayIntensity: rng.range(0.12, 0.45),
    overlayScale: rng.range(0.75, 1.45),
    overlayRotation: rng.range(-0.6, 0.6),
    warp: {
      jawTaper: rng.range(-0.12, 0.12),
      cheekFullness: rng.range(-0.09, 0.09),
      browHeight: rng.range(-0.08, 0.08),
      eyeSpacing: rng.range(-0.09, 0.09),
      noseWidth: rng.range(-0.09, 0.09),
      mouthWidth: rng.range(-0.09, 0.09),
    },
    tone: synthParams.tone,
    details: synthParams.details,
    cyber: synthParams.cyber,
  };

  if (subjectType === 'REPLICANT') {
    geometry.headHeight *= rng.range(1.05, 1.12);
    geometry.mouthWidth *= rng.range(0.78, 0.92);
    geometry.eyeSpacing *= rng.range(1.08, 1.18);
    geometry.warp.eyeSpacing = clamp(Math.abs(geometry.warp.eyeSpacing) + rng.range(0.03, 0.08), -0.2, 0.2);
    geometry.warp.mouthWidth = clamp(-Math.abs(geometry.warp.mouthWidth) - rng.range(0.02, 0.06), -0.2, 0.2);
    geometry.warp.jawTaper = clamp(geometry.warp.jawTaper + rng.range(0.02, 0.08), -0.2, 0.2);
  }

  return geometry;
}

/**
 * Generates visual traits based on subject type and seed
 * Design: Cold, clinical, slightly wrong - machine perception
 */
export function generateVisualTraits(
  seed: string,
  subjectType?: string,
  isAnomaly?: boolean
): SubjectVisualTraits {
  const rng = new SeededRandom(seed + '_traits');
  const profile = getVisualTraitProfile(subjectType);
  const hasAnomalyMarkers = isAnomaly || subjectType === 'REPLICANT';
  
  const baseHue = rng.range(profile.baseHue[0], profile.baseHue[1]);
  let glowIntensity = rng.range(profile.glowIntensity[0], profile.glowIntensity[1]);
  let wireframeOpacity = rng.range(profile.wireframeOpacity[0], profile.wireframeOpacity[1]);
  let fillOpacity = rng.range(profile.fillOpacity[0], profile.fillOpacity[1]);
  let signalNoise = rng.range(profile.signalNoise[0], profile.signalNoise[1]);
  let scanStability = rng.range(profile.scanStability[0], profile.scanStability[1]);
  let reconstructionQuality = rng.range(profile.reconstructionQuality[0], profile.reconstructionQuality[1]);
  let eyeFlickerRate = rng.range(profile.eyeFlickerRate[0], profile.eyeFlickerRate[1]);
  let pupilDilation = rng.range(profile.pupilDilation[0], profile.pupilDilation[1]);
  
  if (hasAnomalyMarkers) {
    glowIntensity += rng.range(0.1, 0.25);
    wireframeOpacity += rng.range(0.05, 0.12);
    fillOpacity *= rng.range(0.6, 0.85);
    signalNoise += rng.range(0.1, 0.25);
    scanStability -= rng.range(0.1, 0.25);
    reconstructionQuality -= rng.range(0.15, 0.3);
    eyeFlickerRate += rng.range(0.6, 2.0);
    pupilDilation *= rng.range(0.7, 0.95);
  }
  
  // Eye color - often different from face, adds to wrongness
  const eyeHues = ['#ff3333', '#ffaa00', '#00ffaa', '#ff00ff', '#ffffff'];
  const eyeGlowColor = rng.pick(eyeHues);
  
  return {
    primaryHue: baseHue,
    glowIntensity: clamp(glowIntensity, 0.2, 1.6),
    wireframeOpacity: clamp(wireframeOpacity, 0.35, 1.05),
    fillOpacity: clamp(fillOpacity, 0.0, 0.25),
    
    hasAnomalyMarkers,
    anomalyIntensity: hasAnomalyMarkers ? rng.range(0.6, 1.0) : rng.range(0.2, 0.4),
    
    signalNoise: clamp(signalNoise, 0.05, 0.65),
    scanStability: clamp(scanStability, 0.1, 0.95),  // More unstable - visible drift/jitter
    reconstructionQuality: clamp(reconstructionQuality, 0.15, 0.95),
    
    eyeGlowColor,
    eyeFlickerRate: clamp(eyeFlickerRate, 0.6, 7.0),  // More frequent flicker/glitch
    pupilDilation: clamp(pupilDilation, 0.12, 1.0),  // More fixed, wrong size
  };
}

/**
 * Generates complete portrait data from subject info
 */
export function generatePortraitData(
  subjectId: string,
  subjectType?: string,
  isAnomaly?: boolean
): ProceduralPortraitData {
  return {
    geometry: generateFaceGeometry(subjectId, subjectType, isAnomaly),
    traits: generateVisualTraits(subjectId, subjectType, isAnomaly),
    seed: subjectId,
  };
}

/**
 * Template-based geometry: one reference face (from template seed) + subject variation.
 * Use when the base face comes from a reference (e.g. face-template.png); each subject
 * gets a new face with defined characteristics (eyes, nose, mouth, proportions), slightly
 * different per subjectId. Base is currently from fixed seed; to use scanned image geometry,
 * run a face-mesh/depth tool on the template image, export landmarks to JSON, and load that
 * as the base instead of generateFaceGeometry(TEMPLATE_GEOMETRY_SEED).
 */
export const TEMPLATE_GEOMETRY_SEED = '__template__';

export function getTemplateBasedGeometry(
  subjectId: string,
  subjectType?: string,
  isAnomaly?: boolean,
  baseHeadIndexOverride?: number
): FaceGeometry {
  const base = generateFaceGeometry(TEMPLATE_GEOMETRY_SEED);
  const rng = new SeededRandom(subjectId);
  const styleRng = new SeededRandom(`${subjectId}_synth`);
  const synthParams = buildSynthParams(styleRng, subjectType, isAnomaly);

  const geometry: FaceGeometry = {
    ...base,
    headWidth: base.headWidth * (1 + rng.range(-0.06, 0.06)),
    headHeight: base.headHeight * (1 + rng.range(-0.06, 0.06)),
    jawWidth: base.jawWidth * (1 + rng.range(-0.08, 0.08)),
    jawHeight: base.jawHeight * (1 + rng.range(-0.08, 0.08)),
    foreheadHeight: base.foreheadHeight * (1 + rng.range(-0.08, 0.08)),
    eyeSpacing: base.eyeSpacing * (1 + rng.range(-0.08, 0.08)),
    eyeHeight: base.eyeHeight + rng.range(-0.015, 0.015),
    eyeWidth: base.eyeWidth * (1 + rng.range(-0.1, 0.1)),
    eyeSlant: base.eyeSlant + rng.range(-4, 4),
    leftEyeOffset: {
      ...base.leftEyeOffset,
      x: base.leftEyeOffset.x + rng.range(-0.02, 0.02),
      y: base.leftEyeOffset.y + rng.range(-0.02, 0.02),
      scale: base.leftEyeOffset.scale * (1 + rng.range(-0.08, 0.08)),
    },
    rightEyeOffset: {
      ...base.rightEyeOffset,
      x: base.rightEyeOffset.x + rng.range(-0.02, 0.02),
      y: base.rightEyeOffset.y + rng.range(-0.02, 0.02),
      scale: base.rightEyeOffset.scale * (1 + rng.range(-0.08, 0.08)),
    },
    pupilMisalignment: {
      left: base.pupilMisalignment.left + rng.range(-0.02, 0.02),
      right: base.pupilMisalignment.right + rng.range(-0.02, 0.02),
    },
    noseLength: base.noseLength * (1 + rng.range(-0.1, 0.1)),
    noseWidth: base.noseWidth * (1 + rng.range(-0.12, 0.12)),
    noseBridge: base.noseBridge * (1 + rng.range(-0.15, 0.15)),
    noseSkew: base.noseSkew + rng.range(-0.01, 0.01),
    mouthWidth: base.mouthWidth * (1 + rng.range(-0.1, 0.1)),
    mouthHeight: base.mouthHeight + rng.range(-0.02, 0.02),
    lipThickness: base.lipThickness * (1 + rng.range(-0.15, 0.15)),
    mouthSkew: base.mouthSkew + rng.range(-0.02, 0.02),
    earSize: base.earSize * (1 + rng.range(-0.1, 0.1)),
    earPosition: base.earPosition + rng.range(-0.02, 0.02),
    leftEarScale: base.leftEarScale * (1 + rng.range(-0.08, 0.08)),
    rightEarScale: base.rightEarScale * (1 + rng.range(-0.08, 0.08)),
    asymmetryX: base.asymmetryX + rng.range(-0.02, 0.02),
    asymmetryY: base.asymmetryY + rng.range(-0.02, 0.02),
    skullTilt: base.skullTilt + rng.range(-2, 2),
    defects: generateDefects(rng),
    jitterFrequency: base.jitterFrequency * (1 + rng.range(-0.2, 0.2)),
    jitterAmplitude: base.jitterAmplitude * (1 + rng.range(-0.2, 0.2)),
    driftSpeed: base.driftSpeed * (1 + rng.range(-0.2, 0.2)),
    glitchSeed: rng.int(0, 10000),
    scanlineOffset: rng.next(),
    corruptionLevel: Math.max(0.1, Math.min(0.6, base.corruptionLevel * (1 + rng.range(-0.15, 0.15)))),
    
    // PORTRAIT SYNTHESIS PARAMS
    baseHeadIndex: baseHeadIndexOverride ?? rng.int(0, 2),
    overlayVariant: rng.int(0, OVERLAY_VARIANTS - 1),
    overlayIntensity: rng.range(0.12, 0.45),
    overlayScale: rng.range(0.75, 1.45),
    overlayRotation: rng.range(-0.6, 0.6),
    warp: {
      jawTaper: rng.range(-0.12, 0.12),
      cheekFullness: rng.range(-0.09, 0.09),
      browHeight: rng.range(-0.08, 0.08),
      eyeSpacing: rng.range(-0.09, 0.09),
      noseWidth: rng.range(-0.09, 0.09),
      mouthWidth: rng.range(-0.09, 0.09),
    },
    tone: synthParams.tone,
    details: synthParams.details,
    cyber: synthParams.cyber,
  };

  if (subjectType === 'REPLICANT') {
    geometry.headHeight *= rng.range(1.05, 1.12);
    geometry.mouthWidth *= rng.range(0.78, 0.92);
    geometry.eyeSpacing *= rng.range(1.08, 1.18);
    geometry.warp.eyeSpacing = clamp(Math.abs(geometry.warp.eyeSpacing) + rng.range(0.03, 0.08), -0.2, 0.2);
    geometry.warp.mouthWidth = clamp(-Math.abs(geometry.warp.mouthWidth) - rng.range(0.02, 0.06), -0.2, 0.2);
    geometry.warp.jawTaper = clamp(geometry.warp.jawTaper + rng.range(0.02, 0.08), -0.2, 0.2);
  }

  return geometry;
}

/**
 * Calculates vertex positions for the face mesh
 * Returns array of [x, y, z] positions for key facial landmarks
 * Design: Intentionally imperfect, asymmetric, unsettling
 */
export function calculateFaceLandmarks(geometry: FaceGeometry): {
  headOutline: Array<[number, number, number]>;
  leftEye: Array<[number, number, number]>;
  rightEye: Array<[number, number, number]>;
  leftPupil: { center: [number, number, number]; radius: number };
  rightPupil: { center: [number, number, number]; radius: number };
  nose: Array<[number, number, number]>;
  mouth: Array<[number, number, number]>;
  leftEar: Array<[number, number, number]>;
  rightEar: Array<[number, number, number]>;
  scanGrid: Array<[number, number, number]>;
  defectMarkers: Array<{ position: [number, number, number]; type: DefectType; severity: number }>;
  implants: Array<{ position: [number, number, number]; size: number }>;
  gaps: Array<{ start: [number, number, number]; end: [number, number, number] }>;
} {
  const {
    headWidth, headHeight, jawWidth, jawHeight,
    eyeSpacing, eyeHeight, eyeWidth, eyeSlant,
    leftEyeOffset, rightEyeOffset, pupilMisalignment,
    noseLength, noseWidth, noseBridge, noseSkew,
    mouthWidth, mouthHeight, lipThickness, mouthSkew,
    earSize, earPosition, leftEarScale, rightEarScale,
    asymmetryX, asymmetryY, skullTilt,
    defects, corruptionLevel
  } = geometry;
  
  // Apply skull tilt transformation
  const tiltRad = (skullTilt * Math.PI) / 180;
  const applyTilt = (x: number, y: number): [number, number] => {
    const rx = x * Math.cos(tiltRad) - y * Math.sin(tiltRad) * 0.3;
    const ry = y + x * Math.sin(tiltRad) * 0.1;
    return [rx + asymmetryX, ry + asymmetryY];
  };
  
  // Head outline (elliptical with jaw) - with imperfections
  const headOutline: Array<[number, number, number]> = [];
  const headSegments = 32; // More segments for more visible irregularity
  for (let i = 0; i <= headSegments; i++) {
    const t = (i / headSegments) * Math.PI * 2;
    let x = Math.sin(t) * headWidth * 0.5;
    let y = Math.cos(t) * headHeight * 0.5;
    
    // Narrow the jaw area
    if (y < -0.1) {
      const jawFactor = Math.abs(y + 0.1) / 0.4;
      x *= 1 - (1 - jawWidth) * Math.min(jawFactor, 1);
    }
    
    // Add subtle irregularity based on corruption level
    const irregularity = Math.sin(i * 7.3) * corruptionLevel * 0.02;
    x += irregularity;
    
    const [tx, ty] = applyTilt(x, y);
    headOutline.push([tx, ty, 0]);
  }
  
  // Left eye (ellipse) - with offset for misalignment
  const leftEye: Array<[number, number, number]> = [];
  const eyeSegments = 16;
  const slantRad = (eyeSlant * Math.PI) / 180;
  const leftEyeCenter: [number, number] = [
    -eyeSpacing + leftEyeOffset.x,
    eyeHeight + leftEyeOffset.y
  ];
  const leftEyeScale = leftEyeOffset.scale;
  
  for (let i = 0; i <= eyeSegments; i++) {
    const t = (i / eyeSegments) * Math.PI * 2;
    const ex = Math.cos(t) * eyeWidth * leftEyeScale;
    const ey = Math.sin(t) * eyeWidth * 0.5 * leftEyeScale;
    const rx = ex * Math.cos(slantRad) - ey * Math.sin(slantRad);
    const ry = ex * Math.sin(slantRad) + ey * Math.cos(slantRad);
    const [tx, ty] = applyTilt(leftEyeCenter[0] + rx, leftEyeCenter[1] + ry);
    leftEye.push([tx, ty, 0.02]);
  }
  
  // Right eye - different offset creates asymmetry
  const rightEye: Array<[number, number, number]> = [];
  const rightEyeCenter: [number, number] = [
    eyeSpacing + rightEyeOffset.x,
    eyeHeight + rightEyeOffset.y
  ];
  const rightEyeScale = rightEyeOffset.scale;
  
  for (let i = 0; i <= eyeSegments; i++) {
    const t = (i / eyeSegments) * Math.PI * 2;
    const ex = Math.cos(t) * eyeWidth * rightEyeScale;
    const ey = Math.sin(t) * eyeWidth * 0.5 * rightEyeScale;
    const rx = ex * Math.cos(-slantRad) - ey * Math.sin(-slantRad);
    const ry = ex * Math.sin(-slantRad) + ey * Math.cos(-slantRad);
    const [tx, ty] = applyTilt(rightEyeCenter[0] + rx, rightEyeCenter[1] + ry);
    rightEye.push([tx, ty, 0.02]);
  }
  
  // Pupils - misaligned, don't track together (dead eyes)
  const pupilRadius = eyeWidth * 0.35;
  const [ltx, lty] = applyTilt(
    leftEyeCenter[0] + pupilMisalignment.left,
    leftEyeCenter[1]
  );
  const [rtx, rty] = applyTilt(
    rightEyeCenter[0] + pupilMisalignment.right,
    rightEyeCenter[1]
  );
  
  const leftPupil = {
    center: [ltx, lty, 0.03] as [number, number, number],
    radius: pupilRadius * leftEyeScale,
  };
  const rightPupil = {
    center: [rtx, rty, 0.03] as [number, number, number],
    radius: pupilRadius * rightEyeScale,
  };
  
  // Nose (slightly skewed)
  const [ntx1, nty1] = applyTilt(noseSkew, eyeHeight - 0.02);
  const [ntx2, nty2] = applyTilt(noseSkew - noseBridge, eyeHeight - 0.05);
  const [ntx3, nty3] = applyTilt(noseSkew + noseBridge, eyeHeight - 0.05);
  const [ntx4, nty4] = applyTilt(noseSkew, eyeHeight - noseLength);
  const [ntx5, nty5] = applyTilt(noseSkew - noseWidth, eyeHeight - noseLength - 0.02);
  const [ntx6, nty6] = applyTilt(noseSkew + noseWidth, eyeHeight - noseLength - 0.02);
  
  const nose: Array<[number, number, number]> = [
    [ntx1, nty1, 0.04],
    [ntx2, nty2, 0.03],
    [ntx3, nty3, 0.03],
    [ntx4, nty4, 0.05],
    [ntx5, nty5, 0.02],
    [ntx6, nty6, 0.02],
  ];
  
  // Mouth (curved line, asymmetric)
  const mouth: Array<[number, number, number]> = [];
  const mouthSegments = 12;
  for (let i = 0; i <= mouthSegments; i++) {
    const t = (i / mouthSegments) - 0.5;
    const x = t * mouthWidth + mouthSkew;
    // Asymmetric curve - one side droops more
    const asymCurve = t > 0 ? 0.7 : 1.0;
    const y = mouthHeight + Math.cos(t * Math.PI) * lipThickness * 0.5 * asymCurve;
    const [tx, ty] = applyTilt(x, y);
    mouth.push([tx, ty, 0.01]);
  }
  
  // Ears (different sizes - machine can't match them)
  const leftEar: Array<[number, number, number]> = [];
  const rightEar: Array<[number, number, number]> = [];
  const earSegments = 8;
  for (let i = 0; i <= earSegments; i++) {
    const t = (i / earSegments) * Math.PI - Math.PI / 2;
    const lex = Math.cos(t) * earSize * 0.3 * leftEarScale;
    const ley = Math.sin(t) * earSize * leftEarScale;
    const rex = Math.cos(t) * earSize * 0.3 * rightEarScale;
    const rey = Math.sin(t) * earSize * rightEarScale;
    
    const [ltx, lty] = applyTilt(-headWidth * 0.5 - 0.02 + lex, earPosition + ley);
    const [rtx, rty] = applyTilt(headWidth * 0.5 + 0.02 - rex, earPosition + rey);
    
    leftEar.push([ltx, lty, 0]);
    rightEar.push([rtx, rty, 0]);
  }
  
  // Scan grid with gaps (corruption)
  const scanGrid: Array<[number, number, number]> = [];
  const gridLines = 16;
  for (let i = 0; i < gridLines; i++) {
    const y = -0.45 + (i / (gridLines - 1)) * 0.9;
    // Some lines are missing (corruption)
    if (Math.sin(i * 3.7 + geometry.glitchSeed) > corruptionLevel * 2 - 1) {
      scanGrid.push([-0.55, y, 0.01]);
      scanGrid.push([0.55, y, 0.01]);
    }
  }
  
  // Process defects into visual markers
  const defectMarkers: Array<{ position: [number, number, number]; type: DefectType; severity: number }> = [];
  const implants: Array<{ position: [number, number, number]; size: number }> = [];
  const gaps: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
  
  const locationPositions: Record<ReconstructionDefect['location'], [number, number, number]> = {
    LEFT_EYE: [leftEyeCenter[0], leftEyeCenter[1], 0.02],
    RIGHT_EYE: [rightEyeCenter[0], rightEyeCenter[1], 0.02],
    NOSE: [noseSkew, eyeHeight - noseLength * 0.5, 0.04],
    MOUTH: [mouthSkew, mouthHeight, 0.01],
    LEFT_CHEEK: [-0.25, 0, 0.01],
    RIGHT_CHEEK: [0.25, 0, 0.01],
    FOREHEAD: [0, 0.35, 0.01],
    JAW: [0, -0.35, 0],
    LEFT_EAR: [-headWidth * 0.5, earPosition, 0],
    RIGHT_EAR: [headWidth * 0.5, earPosition, 0],
  };
  
  for (const defect of defects) {
    const basePos = locationPositions[defect.location];
    const pos: [number, number, number] = [
      basePos[0] + (defect.offset?.x || 0),
      basePos[1] + (defect.offset?.y || 0),
      basePos[2] + (defect.offset?.z || 0),
    ];
    
    defectMarkers.push({ position: pos, type: defect.type, severity: defect.severity });
    
    if (defect.type === 'IMPLANT') {
      implants.push({ position: pos, size: 0.03 + defect.severity * 0.04 });
    } else if (defect.type === 'GAP') {
      gaps.push({
        start: [pos[0] - 0.02, pos[1], pos[2]],
        end: [pos[0] + 0.02, pos[1] + 0.03, pos[2]],
      });
    }
  }
  
  return {
    headOutline,
    leftEye,
    rightEye,
    leftPupil,
    rightPupil,
    nose,
    mouth,
    leftEar,
    rightEar,
    scanGrid,
    defectMarkers,
    implants,
    gaps,
  };
}
