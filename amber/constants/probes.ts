// =============================================================================
// INTERROGATION PROBE SYSTEM - Action-based dialogue mechanics
// =============================================================================

export type ProbeType = 'HANDS' | 'BUSINESS' | 'DISCREPANCY' | 'IDENTITY';

export interface ProbeDefinition {
  type: ProbeType;
  label: string;
  command: string;
  description: string;
}

// The four interrogation probes available to the operator
export const PROBE_TYPES: Record<ProbeType, ProbeDefinition> = {
  HANDS: {
    type: 'HANDS',
    label: 'SHOW HANDS',
    command: 'DISPLAY EXTREMITIES FOR SCAN',
    description: 'Biometric compliance check',
  },
  BUSINESS: {
    type: 'BUSINESS',
    label: 'STATE BUSINESS',
    command: 'DECLARE PURPOSE OF TRANSIT',
    description: 'Purpose verification',
  },
  DISCREPANCY: {
    type: 'DISCREPANCY',
    label: 'EXPLAIN DISCREPANCY',
    command: 'CLARIFY DATA INCONSISTENCY',
    description: 'Challenge contradictions',
  },
  IDENTITY: {
    type: 'IDENTITY',
    label: 'CONFIRM IDENTITY',
    command: 'VERIFY PERSONAL DETAILS',
    description: 'Identity verification',
  },
};

// Order of probe buttons in the UI (2x2 grid)
// IDENTITY and BUSINESS first (initial probes), then HANDS and DISCREPANCY unlock later
export const PROBE_ORDER: ProbeType[] = ['IDENTITY', 'BUSINESS', 'HANDS', 'DISCREPANCY'];

// Probe response interface (used in subject data)
export interface ProbeResponse {
  probeType: ProbeType;
  response: string | string[]; // Can be array for multiple variations
  toneShift?: 'NEUTRAL' | 'AGITATED' | 'NERVOUS' | 'EVASIVE' | 'COOPERATIVE';
  revealsFlag?: {
    keyword: string;
    category: string;
  };
  contradictsField?: string; // Key of field that contradicts this response
}

// Helper to get response text (handles array of variations)
export const getProbeResponseText = (response: string | string[], count: number = 0): string => {
  if (typeof response === 'string') return response;
  // Use count to cycle through variations, or use last one if count exceeds
  return response[Math.min(count, response.length - 1)] || response[response.length - 1];
};

// Probe state for tracking completion
export interface ProbeState {
  completedProbes: Set<ProbeType>;
  currentResponse: ProbeResponse | null;
  hasDiscrepancy: boolean;
}

// Initial probe state
export const INITIAL_PROBE_STATE: ProbeState = {
  completedProbes: new Set(),
  currentResponse: null,
  hasDiscrepancy: false,
};

// Helper to check if required probes are complete
export const areRequiredProbesComplete = (
  completedProbes: Set<ProbeType>,
  requiredProbes?: ProbeType[]
): boolean => {
  if (!requiredProbes || requiredProbes.length === 0) {
    return true;
  }
  return requiredProbes.every(probe => completedProbes.has(probe));
};
