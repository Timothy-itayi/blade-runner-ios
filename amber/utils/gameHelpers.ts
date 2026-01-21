import { SubjectData } from '../data/subjects';
import { ShiftData } from '../constants/shifts';
import { POSITIVE_MESSAGES, NEGATIVE_MESSAGES, NEUTRAL_MESSAGES } from '../constants/messages';

/**
 * Determines if a decision is correct based on subject data and directive rules
 * 
 * NOTE: This function is temporarily kept for compatibility but will be replaced
 * by the consequence evaluation system in Phase 3. For now, it returns true
 * to prevent breaking the game flow.
 */
export const isDecisionCorrect = (
  subject: SubjectData, 
  decision: 'APPROVE' | 'DENY',
  currentShift: ShiftData
): boolean => {
  // TODO: Phase 3 - Replace with consequence evaluation system
  // For now, return true to allow game to function
  // Decision correctness will be evaluated based on information gathered
  return true;
};

/**
 * Gets narrative message based on game state
 */
export const getNarrativeMessage = (
  triggerConsequence: boolean,
  infractions: number,
  totalAccuracy: number,
  currentShift: ShiftData
): string | null => {
  // 1. Check for Infraction-specific messages first
  if (triggerConsequence) {
    const infractionPool = NEGATIVE_MESSAGES.filter(m => 
      m.minInfractions !== undefined && infractions >= m.minInfractions
    );
    if (infractionPool.length > 0) {
      // Get the highest infraction message that matches current infraction count
      const msg = infractionPool.sort((a, b) => (b.minInfractions || 0) - (a.minInfractions || 0))[0];
      return `${msg.sender}: ${msg.text}`;
    }
  }

  // 2. Normal pool logic
  let pool = NEUTRAL_MESSAGES;
  if (totalAccuracy > 0.8) pool = POSITIVE_MESSAGES;
  else if (totalAccuracy < 0.6) pool = NEGATIVE_MESSAGES;

  const validMessages = pool.filter(m => 
    (!m.minShift || currentShift.id >= m.minShift) && 
    (!m.maxShift || currentShift.id <= m.maxShift) &&
    m.minInfractions === undefined // Exclude specific infraction alerts from normal pool
  );

  if (validMessages.length === 0) return null;
  const msg = validMessages[Math.floor(Math.random() * validMessages.length)];
  return msg.sender ? `${msg.sender}: ${msg.text}` : msg.text;
};

/**
 * Gets subject data with narrative variants applied based on decision history
 */
export const getSubjectData = (
  index: number,
  subjects: SubjectData[],
  decisionHistory: Record<string, 'APPROVE' | 'DENY'>
): SubjectData => {
  const base = subjects[index];
  // Note: narrativeVariants removed from new structure, but keeping function for compatibility
  return base;
};
