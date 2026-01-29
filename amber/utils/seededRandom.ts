// =============================================================================
// SEEDED RANDOM - Deterministic PRNG for procedural generation
// =============================================================================
// Ensures the same subject ID always generates identical visual parameters

/**
 * Simple string hash function (djb2)
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit
}

/**
 * Creates a seeded random number generator
 * Returns a function that produces deterministic pseudo-random numbers [0, 1)
 */
export function createSeededRandom(seed: string | number): () => number {
  let state = typeof seed === 'string' ? hashString(seed) : seed;
  
  // Ensure non-zero state
  if (state === 0) state = 1;
  
  return () => {
    // xorshift32 algorithm - fast and good distribution
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state = state >>> 0; // Keep as unsigned 32-bit
    return state / 0xffffffff;
  };
}

/**
 * Seeded random utilities class for more complex generation
 */
export class SeededRandom {
  private rng: () => number;
  
  constructor(seed: string | number) {
    this.rng = createSeededRandom(seed);
  }
  
  /** Random float [0, 1) */
  next(): number {
    return this.rng();
  }
  
  /** Random float in range [min, max) */
  range(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }
  
  /** Random integer in range [min, max] inclusive */
  int(min: number, max: number): number {
    return Math.floor(min + this.rng() * (max - min + 1));
  }
  
  /** Random boolean with optional probability */
  bool(probability = 0.5): boolean {
    return this.rng() < probability;
  }
  
  /** Pick random item from array */
  pick<T>(array: T[]): T {
    return array[Math.floor(this.rng() * array.length)];
  }
  
  /** Gaussian distribution (Box-Muller) */
  gaussian(mean = 0, stdDev = 1): number {
    const u1 = this.rng();
    const u2 = this.rng();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }
}
