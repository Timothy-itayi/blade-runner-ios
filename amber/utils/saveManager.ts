import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVE_KEY = '@amber_save';
const SAVE_VERSION = 3;

export type GamePhase = 'intro' | 'introVideo' | 'news_intro' | 'takeover' | 'boot' | 'logo' | 'briefing' | 'active';

export interface ShiftStats {
  approved: number;
  denied: number;
  correct: number;
}

export interface SaveData {
  version: number;
  gamePhase: GamePhase;
  currentSubjectIndex: number;
  totalCorrectDecisions: number;
  totalAccuracy: number;
  infractions: number;
  shiftStats: ShiftStats;
  decisionHistory: Record<string, 'APPROVE' | 'DENY'>;
  decisionLog: Array<{
    subjectId: string;
    subjectName: string;
    decision: 'APPROVE' | 'DENY';
    correct: boolean;
  }>;
  alertLog?: Array<{
    subjectId: string;
    subjectName: string;
    scenario: import('../types/alertScenario').AlertScenario;
    outcome: import('../store/gameStore').AlertOutcome;
    resolvedAt?: number;
    collateralCount?: number;
    negotiationMethod?: 'INTIMIDATE' | 'PERSUADE' | 'REASON';
    interceptUsed?: boolean;
    detonateUsed?: boolean;
  }>;
  propagandaFeed?: Array<{
    id: string;
    subjectId: string;
    headline: string;
    body: string;
    timestamp: number;
    outcome: import('../store/gameStore').AlertOutcome;
  }>;
  subjectsProcessed: number;
  timestamp: number;
}

export const saveGame = async (data: Omit<SaveData, 'version' | 'timestamp'>): Promise<void> => {
  try {
    const saveData: SaveData = {
      ...data,
      version: SAVE_VERSION,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = async (): Promise<SaveData | null> => {
  try {
    const saved = await AsyncStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const data: SaveData = JSON.parse(saved);

    // Version check - if save version doesn't match, invalidate
    if (data.version !== SAVE_VERSION) {
      await clearSave();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearSave = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch (error) {
    console.error('Failed to clear save:', error);
  }
};

export const hasSaveData = async (): Promise<boolean> => {
  try {
    const saved = await AsyncStorage.getItem(SAVE_KEY);
    if (!saved) return false;

    const data: SaveData = JSON.parse(saved);
    // Only show continue if player has progressed past intro
    return data.version === SAVE_VERSION && data.gamePhase !== 'intro';
  } catch (error) {
    return false;
  }
};

export const getSaveInfo = async (): Promise<{ shiftNumber: number; timestamp: number } | null> => {
  try {
    const saved = await AsyncStorage.getItem(SAVE_KEY);
    if (!saved) return null;

    const data: SaveData = JSON.parse(saved);
    if (data.version !== SAVE_VERSION) return null;

    // Calculate shift number (1-20) from subject index
    const shiftNumber = Math.floor(data.currentSubjectIndex / 4) + 1;

    return {
      shiftNumber: Math.min(shiftNumber, 20),
      timestamp: data.timestamp,
    };
  } catch (error) {
    return null;
  }
};
