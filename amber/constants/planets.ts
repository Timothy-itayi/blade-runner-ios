// Planet safety levels based on real-world countries
export type PlanetSafetyLevel = 'SAFE' | 'MODERATE' | 'DANGEROUS';

export interface Planet {
  name: string;
  safetyLevel: PlanetSafetyLevel;
  description: string;
  realWorldAnalog: string; // Region it's based on
}

// Safe districts (stable zones)
export const SAFE_PLANETS: Planet[] = [
  { name: 'CENTRAL HUB', safetyLevel: 'SAFE', description: 'Administrative core, heavily regulated', realWorldAnalog: 'Capitol' },
  { name: 'DISTRICT 1', safetyLevel: 'SAFE', description: 'Commerce and finance zone', realWorldAnalog: 'Downtown' },
  { name: 'DISTRICT 2', safetyLevel: 'SAFE', description: 'Civic and residential zone', realWorldAnalog: 'Midtown' },
];

// Moderate districts (complex or tense zones)
export const MODERATE_PLANETS: Planet[] = [
  { name: 'DISTRICT 3', safetyLevel: 'MODERATE', description: 'Industrial zone, frequent labor disputes', realWorldAnalog: 'Factory belt' },
  { name: 'DISTRICT 4', safetyLevel: 'MODERATE', description: 'Transit and logistics zone', realWorldAnalog: 'Port district' },
];

// Dangerous districts (restricted or unstable zones)
export const DANGEROUS_PLANETS: Planet[] = [
  { name: 'DISTRICT 5', safetyLevel: 'DANGEROUS', description: 'Restricted zone, heavy enforcement', realWorldAnalog: 'Quarantine zone' },
  { name: 'OUTER RING', safetyLevel: 'DANGEROUS', description: 'Peripheral blocks, minimal oversight', realWorldAnalog: 'No-go area' },
];

export const ALL_PLANETS: Planet[] = [
  ...SAFE_PLANETS,
  ...MODERATE_PLANETS,
  ...DANGEROUS_PLANETS,
];

export const PLANET_MAP: Record<string, Planet> = ALL_PLANETS.reduce((acc, planet) => {
  acc[planet.name] = planet;
  return acc;
}, {} as Record<string, Planet>);

// Get planet safety level
export const getPlanetSafety = (planetName: string): PlanetSafetyLevel => {
  const planet = PLANET_MAP[planetName.toUpperCase()];
  return planet?.safetyLevel || 'MODERATE';
};

// Check if transit is suspicious
export const isSuspiciousTransit = (fromPlanet: string, toPlanet: string): boolean => {
  const fromSafety = getPlanetSafety(fromPlanet);
  const toSafety = getPlanetSafety(toPlanet);
  
  // Traveling TO a dangerous planet is always suspicious
  if (toSafety === 'DANGEROUS') {
    return true;
  }
  
  // Coming FROM a dangerous planet is also suspicious
  if (fromSafety === 'DANGEROUS') {
    return true;
  }
  
  // Rapid transitions between very different safety levels
  if (fromSafety === 'SAFE' && toSafety === 'DANGEROUS') {
    return true;
  }
  
  if (fromSafety === 'DANGEROUS' && toSafety === 'SAFE') {
    return true;
  }
  
  return false;
};

// Get transit risk level
export const getTransitRisk = (fromPlanet: string, toPlanet: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const fromSafety = getPlanetSafety(fromPlanet);
  const toSafety = getPlanetSafety(toPlanet);
  
  if (toSafety === 'DANGEROUS' || fromSafety === 'DANGEROUS') {
    return 'HIGH';
  }
  
  if (toSafety === 'MODERATE' || fromSafety === 'MODERATE') {
    return 'MEDIUM';
  }
  
  return 'LOW';
};
