import { create } from 'zustand';

// Equipment types that can break/glitch
export type EquipmentType = 'BIOMETRIC_SCANNER' | 'ID_SCANNER' | 'DATABASE' | 'CREDENTIAL_VERIFIER' | 'TURING_TEST';

export type EquipmentStatus = 'OPERATIONAL' | 'GLITCHING' | 'BROKEN';

export interface Equipment {
  type: EquipmentType;
  status: EquipmentStatus;
  glitchChance: number; // 0-1, chance of producing wrong info when glitching
}

export interface Citation {
  id: string;
  reason: string;
  timestamp: number;
  severity: 'WARNING' | 'CITATION' | 'FINAL_WARNING';
}

interface GameStore {
  // Credits system
  credits: number;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => void;
  
  // Resources per subject (per-shift budget)
  resourcesRemaining: number;
  resourcesPerShift: number;
  useResource: () => boolean; // Returns true if resource was used, false if none left
  resetResourcesForShift: (count: number) => void;
  
  // Equipment system
  equipment: Record<EquipmentType, Equipment>;
  glitchEquipment: (type: EquipmentType) => void;
  breakEquipment: (type: EquipmentType) => void;
  repairEquipment: (type: EquipmentType, cost: number) => boolean; // Returns true if repaired
  checkEquipmentStatus: (type: EquipmentType) => EquipmentStatus;
  isEquipmentGlitching: (type: EquipmentType) => boolean;
  
  // Citations system (like Papers Please)
  citations: Citation[];
  addCitation: (reason: string, severity?: Citation['severity']) => void;
  clearCitations: () => void;
  getCitationCount: () => number;
  
  // Subject processing
  currentSubjectResources: number; // Resources used for current subject
  resetSubjectResources: () => void;
  useSubjectResource: () => boolean;
}

const INITIAL_EQUIPMENT: Record<EquipmentType, Equipment> = {
  BIOMETRIC_SCANNER: { type: 'BIOMETRIC_SCANNER', status: 'OPERATIONAL', glitchChance: 0.1 },
  ID_SCANNER: { type: 'ID_SCANNER', status: 'OPERATIONAL', glitchChance: 0.15 },
  DATABASE: { type: 'DATABASE', status: 'OPERATIONAL', glitchChance: 0.2 },
  CREDENTIAL_VERIFIER: { type: 'CREDENTIAL_VERIFIER', status: 'OPERATIONAL', glitchChance: 0.15 },
  TURING_TEST: { type: 'TURING_TEST', status: 'OPERATIONAL', glitchChance: 0.25 },
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Credits
  credits: 0, // Start with 0 credits
  addCredits: (amount) => set((state) => ({ credits: state.credits + amount })),
  spendCredits: (amount) => set((state) => ({ 
    credits: Math.max(0, state.credits - amount) 
  })),
  
  // Resources
  resourcesRemaining: 3, // Per shift - start with 3
  resourcesPerShift: 3,
  useResource: () => {
    const state = get();
    if (state.resourcesRemaining > 0) {
      set({ resourcesRemaining: state.resourcesRemaining - 1 });
      return true;
    }
    return false;
  },
  resetResourcesForShift: (count = 3) => set({ 
    resourcesRemaining: count, 
    resourcesPerShift: count 
  }),
  
  // Equipment
  equipment: INITIAL_EQUIPMENT,
  glitchEquipment: (type) => set((state) => ({
    equipment: {
      ...state.equipment,
      [type]: { ...state.equipment[type], status: 'GLITCHING' }
    }
  })),
  breakEquipment: (type) => set((state) => ({
    equipment: {
      ...state.equipment,
      [type]: { ...state.equipment[type], status: 'BROKEN' }
    }
  })),
  repairEquipment: (type, cost) => {
    const state = get();
    if (state.credits >= cost) {
      set({
        credits: state.credits - cost,
        equipment: {
          ...state.equipment,
          [type]: { ...state.equipment[type], status: 'OPERATIONAL' }
        }
      });
      return true;
    }
    return false;
  },
  checkEquipmentStatus: (type) => {
    return get().equipment[type].status;
  },
  isEquipmentGlitching: (type) => {
    const status = get().equipment[type].status;
    return status === 'GLITCHING' || status === 'BROKEN';
  },
  
  // Citations
  citations: [],
  addCitation: (reason, severity = 'WARNING') => set((state) => ({
    citations: [
      ...state.citations,
      {
        id: `CIT-${Date.now()}`,
        reason,
        timestamp: Date.now(),
        severity
      }
    ]
  })),
  clearCitations: () => set({ citations: [] }),
  getCitationCount: () => get().citations.length,
  
  // Subject resources
  currentSubjectResources: 0,
  resetSubjectResources: () => set({ currentSubjectResources: 0 }),
  useSubjectResource: () => {
    const state = get();
    if (state.useResource()) {
      set({ currentSubjectResources: state.currentSubjectResources + 1 });
      return true;
    }
    return false;
  },
}));
