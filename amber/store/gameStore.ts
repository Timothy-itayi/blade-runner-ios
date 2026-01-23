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
  // Lives system
  lives: number;
  setLives: (count: number) => void;
  loseLife: (amount?: number) => void;
  resetLives: () => void;
  
  // Equipment system
  equipment: Record<EquipmentType, Equipment>;
  glitchEquipment: (type: EquipmentType) => void;
  breakEquipment: (type: EquipmentType) => void;
  repairEquipment: (type: EquipmentType) => void;
  checkEquipmentStatus: (type: EquipmentType) => EquipmentStatus;
  isEquipmentGlitching: (type: EquipmentType) => boolean;
  
  // Citations system (like Papers Please)
  citations: Citation[];
  addCitation: (reason: string, severity?: Citation['severity']) => void;
  clearCitations: () => void;
  getCitationCount: () => number;
  
}

const INITIAL_EQUIPMENT: Record<EquipmentType, Equipment> = {
  BIOMETRIC_SCANNER: { type: 'BIOMETRIC_SCANNER', status: 'OPERATIONAL', glitchChance: 0.1 },
  ID_SCANNER: { type: 'ID_SCANNER', status: 'OPERATIONAL', glitchChance: 0.15 },
  DATABASE: { type: 'DATABASE', status: 'OPERATIONAL', glitchChance: 0.2 },
  CREDENTIAL_VERIFIER: { type: 'CREDENTIAL_VERIFIER', status: 'OPERATIONAL', glitchChance: 0.15 },
  TURING_TEST: { type: 'TURING_TEST', status: 'OPERATIONAL', glitchChance: 0.25 },
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Lives
  lives: 3, // Start with 3 lives
  setLives: (count) => set({ lives: Math.max(0, count) }),
  loseLife: (amount = 1) => set((state) => ({ lives: Math.max(0, state.lives - amount) })),
  resetLives: () => set({ lives: 3 }),
  
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
  repairEquipment: (type) => {
    set((state) => ({
      equipment: {
        ...state.equipment,
        [type]: { ...state.equipment[type], status: 'OPERATIONAL' }
      }
    }));
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
}));
