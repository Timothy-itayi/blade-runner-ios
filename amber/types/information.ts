/**
 * Information Tracking System
 * 
 * Tracks what information the player has gathered for each subject.
 * This is the foundation of the information-based deduction system.
 */

export type EquipmentType = 'BIOMETRIC_SCANNER' | 'BPM_MONITOR';

export interface GatheredInformation {
  // Basic scan (free, always available)
  basicScan: boolean;
  
  // Resource-costing information gathering
  bioScan: boolean;
  warrantCheck: boolean;
  transitLog: boolean;
  incidentHistory: boolean;
  
  // Interrogation (free)
  interrogation: {
    questionsAsked: number;
    responses: string[];
    bpmChanges: number[]; // BPM value at each question
  };
  
  // Equipment status
  equipmentFailures: EquipmentType[]; // Which equipment is broken
  bpmDataAvailable: boolean; // Is BPM monitor working?
  
  // Timestamps for tracking
  timestamps: {
    basicScan?: number;
    bioScan?: number;
    warrantCheck?: number;
    transitLog?: number;
    incidentHistory?: number;
    interrogation?: number[];
  };
}

/**
 * Creates a fresh information tracking object for a new subject
 * Equipment failures should be determined externally and passed in
 */
export const createEmptyInformation = (equipmentFailures: EquipmentType[] = []): GatheredInformation => ({
  basicScan: false,
  bioScan: false,
  warrantCheck: false,
  transitLog: false,
  incidentHistory: false,
  interrogation: {
    questionsAsked: 0,
    responses: [],
    bpmChanges: [],
  },
  equipmentFailures,
  bpmDataAvailable: !equipmentFailures.includes('BPM_MONITOR'),
  timestamps: {},
});

/**
 * Checks if all information gathering tools have been used
 */
export const hasAllInformation = (info: GatheredInformation): boolean => {
  return (
    info.basicScan &&
    info.bioScan &&
    info.warrantCheck &&
    info.transitLog &&
    info.incidentHistory
  );
};

/**
 * Checks if some information has been gathered (but not all)
 */
export const hasSomeInformation = (info: GatheredInformation): boolean => {
  return (
    info.bioScan ||
    info.warrantCheck ||
    info.transitLog ||
    info.incidentHistory
  );
};
