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

export interface DecisionLogEntry {
  subjectId: string;
  subjectName: string;
  decision: 'APPROVE' | 'DENY';
  correct: boolean;
  // Additional context for map display
  subjectType?: string;
  originPlanet?: string;
  destinationPlanet?: string;
  permitType?: string;
  permitStatus?: string;
  denyReason?: string; // Why they were denied (directive violation, warrant, etc.)
  warrants?: string;
}

export type AlertOutcome =
  | 'PENDING'
  | 'IGNORED'
  | 'DETONATED'
  | 'INTERCEPTED'
  | 'NEGOTIATED_SUCCESS'
  | 'NEGOTIATED_FAIL';

export interface AlertLogEntry {
  subjectId: string;
  subjectName: string;
  scenario: import('../types/alertScenario').AlertScenario;
  outcome: AlertOutcome;
  resolvedAt?: number;
  collateralCount?: number;
  negotiationMethod?: 'INTIMIDATE' | 'PERSUADE' | 'REASON';
  interceptUsed?: boolean;
  detonateUsed?: boolean;
}

export interface PropagandaEntry {
  id: string;
  subjectId: string;
  headline: string;
  body: string;
  timestamp: number;
  outcome: AlertOutcome;
}

interface GameStore {
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

  // Consequence map decisions
  decisionLog: DecisionLogEntry[];
  addDecisionLog: (entry: DecisionLogEntry) => void;
  clearDecisionLog: () => void;
  setDecisionLog: (entries: DecisionLogEntry[]) => void;

  // Amber alerts and propaganda
  alertLog: AlertLogEntry[];
  addAlert: (entry: AlertLogEntry) => void;
  resolveAlert: (subjectId: string, update: Partial<AlertLogEntry>) => void;
  clearAlertLog: () => void;
  setAlertLog: (entries: AlertLogEntry[]) => void;
  propagandaFeed: PropagandaEntry[];
  addPropaganda: (entry: PropagandaEntry) => void;
  clearPropaganda: () => void;
  setPropagandaFeed: (entries: PropagandaEntry[]) => void;
}

const INITIAL_EQUIPMENT: Record<EquipmentType, Equipment> = {
  BIOMETRIC_SCANNER: { type: 'BIOMETRIC_SCANNER', status: 'OPERATIONAL', glitchChance: 0.1 },
  ID_SCANNER: { type: 'ID_SCANNER', status: 'OPERATIONAL', glitchChance: 0.15 },
  DATABASE: { type: 'DATABASE', status: 'OPERATIONAL', glitchChance: 0.2 },
  CREDENTIAL_VERIFIER: { type: 'CREDENTIAL_VERIFIER', status: 'OPERATIONAL', glitchChance: 0.15 },
  TURING_TEST: { type: 'TURING_TEST', status: 'OPERATIONAL', glitchChance: 0.25 },
};

export const useGameStore = create<GameStore>((set, get) => ({
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

  // Consequence map decisions
  decisionLog: [],
  addDecisionLog: (entry) => set((state) => ({
    decisionLog: [...state.decisionLog, entry],
  })),
  clearDecisionLog: () => set({ decisionLog: [] }),
  setDecisionLog: (entries) => set({ decisionLog: entries }),

  // Amber alerts and propaganda
  alertLog: [],
  addAlert: (entry) => set((state) => ({
    alertLog: [...state.alertLog, entry],
  })),
  resolveAlert: (subjectId, update) => set((state) => ({
    alertLog: state.alertLog.map((entry) =>
      entry.subjectId === subjectId ? { ...entry, ...update } : entry
    ),
  })),
  clearAlertLog: () => set({ alertLog: [] }),
  setAlertLog: (entries) => set({ alertLog: entries }),
  propagandaFeed: [],
  addPropaganda: (entry) => set((state) => ({
    propagandaFeed: [entry, ...state.propagandaFeed].slice(0, 20),
  })),
  clearPropaganda: () => set({ propagandaFeed: [] }),
  setPropagandaFeed: (entries) => set({ propagandaFeed: entries }),
}));
