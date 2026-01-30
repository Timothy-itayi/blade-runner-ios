export type PortraitPreset = 'scanner' | 'comms' | 'dossier';

export const PORTRAIT_GENERATOR_VERSION = 'v9';
export const PORTRAIT_HEADSET_VERSION = 'v1';

export const PORTRAIT_OUTPUT_SIZES: Record<PortraitPreset, number> = {
  scanner: 256,
  comms: 256,
  dossier: 512,
};

export const PORTRAIT_CACHE_BUDGETS: Record<number, number> = {
  256: 20 * 1024 * 1024, // 20 MB for thumbnails
  512: 60 * 1024 * 1024, // 60 MB for detail renders
};

export type PortraitFraming = {
  scale: number;
  x: number;
  y: number;
  rotation: number;
};

export const PORTRAIT_PRESETS: Record<PortraitPreset, PortraitFraming> = {
  scanner: {
    scale: 1.32,
    x: 0,
    y: -0.03,
    rotation: 0,
  },
  comms: {
    scale: 1.12,
    x: 0,
    y: -0.02,
    rotation: 0,
  },
  dossier: {
    scale: 0.96,
    x: 0,
    y: 0.03,
    rotation: 0,
  },
};

export const PORTRAIT_HEAD_CALIBRATION: Record<number, Partial<PortraitFraming>> = {
  0: { x: 0, y: 0, scale: 1 },
  1: { x: -0.01, y: 0.006, scale: 1.01 },
  2: { x: 0.008, y: -0.004, scale: 0.99 },
  3: { x: -0.004, y: -0.002, scale: 1.0 },
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const resolvePortraitFraming = (preset: PortraitPreset, headIndex: number): PortraitFraming => {
  const base = PORTRAIT_PRESETS[preset];
  const calibration = PORTRAIT_HEAD_CALIBRATION[headIndex] || {};

  return {
    scale: clamp(base.scale * (calibration.scale ?? 1), 0.75, 1.6),
    x: clamp(base.x + (calibration.x ?? 0), -0.2, 0.2),
    y: clamp(base.y + (calibration.y ?? 0), -0.2, 0.2),
    rotation: clamp(base.rotation + (calibration.rotation ?? 0), -5, 5),
  };
};
