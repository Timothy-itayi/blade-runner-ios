// Planet safety levels based on real-world countries
export type PlanetSafetyLevel = 'SAFE' | 'MODERATE' | 'DANGEROUS';

export interface Planet {
  name: string;
  safetyLevel: PlanetSafetyLevel;
  description: string;
  realWorldAnalog: string; // Country it's based on
}

// Safe planets (like developed, stable countries)
export const SAFE_PLANETS: Planet[] = [
  { name: 'EARTH', safetyLevel: 'SAFE', description: 'Capital world, highly regulated', realWorldAnalog: 'USA/UK' },
  { name: 'LUNA', safetyLevel: 'SAFE', description: 'Earth\'s moon, established colony', realWorldAnalog: 'Japan' },
  { name: 'MARS', safetyLevel: 'SAFE', description: 'Major colony, stable governance', realWorldAnalog: 'Canada' },
  { name: 'EUROPA', safetyLevel: 'SAFE', description: 'Research hub, high security', realWorldAnalog: 'Switzerland' },
  { name: 'TITAN', safetyLevel: 'SAFE', description: 'Corporate stronghold, regulated', realWorldAnalog: 'Singapore' },
  { name: 'GANYMEDE', safetyLevel: 'SAFE', description: 'Trading post, well-monitored', realWorldAnalog: 'Netherlands' },
];

// Moderate planets (like developing or politically complex countries)
export const MODERATE_PLANETS: Planet[] = [
  { name: 'CALLISTO', safetyLevel: 'MODERATE', description: 'Mining colony, some instability', realWorldAnalog: 'Brazil' },
  { name: 'IO', safetyLevel: 'MODERATE', description: 'Volatile environment, frequent conflicts', realWorldAnalog: 'India' },
  { name: 'ENCELADUS', safetyLevel: 'MODERATE', description: 'Remote outpost, limited oversight', realWorldAnalog: 'Mexico' },
  { name: 'TRITON', safetyLevel: 'MODERATE', description: 'Border world, smuggling routes', realWorldAnalog: 'Thailand' },
  { name: 'PHOBOS', safetyLevel: 'MODERATE', description: 'Martian moon, mixed population', realWorldAnalog: 'Turkey' },
  { name: 'DEIMOS', safetyLevel: 'MODERATE', description: 'Martian moon, industrial zone', realWorldAnalog: 'South Africa' },
];

// Dangerous planets (like authoritarian or conflict zones)
export const DANGEROUS_PLANETS: Planet[] = [
  { name: 'CERES', safetyLevel: 'DANGEROUS', description: 'Authoritarian regime, restricted access', realWorldAnalog: 'North Korea' },
  { name: 'ERIS', safetyLevel: 'DANGEROUS', description: 'Pirate haven, no governance', realWorldAnalog: 'Somalia' },
  { name: 'PLUTO', safetyLevel: 'DANGEROUS', description: 'Isolated dictatorship, human rights violations', realWorldAnalog: 'Myanmar' },
  { name: 'CHARON', safetyLevel: 'DANGEROUS', description: 'Pluto\'s moon, black market hub', realWorldAnalog: 'Venezuela' },
  { name: 'MAKEMAKE', safetyLevel: 'DANGEROUS', description: 'Warlord territory, lawless', realWorldAnalog: 'Afghanistan' },
  { name: 'HAUMEA', safetyLevel: 'DANGEROUS', description: 'Criminal syndicate control', realWorldAnalog: 'Russia' },
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
