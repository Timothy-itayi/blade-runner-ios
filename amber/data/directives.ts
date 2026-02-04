import type { DirectiveRule } from '../types/directive';

export const DIRECTIVES: Record<string, DirectiveRule> = {
  // =============================================================================
  // SHIFT 1: Introduction - Simple warrant check
  // Deny anyone with an active warrant.
  // =============================================================================
  SHIFT_1: {
    id: 'SHIFT_1',
    base: 'WARRANTS',
    exceptions: [],
    hiddenExceptions: [],
    requiredChecks: ['WARRANT'],
    text: ['DENY: WARRANTS'],
  },

  // =============================================================================
  // SHIFT 2: Occupation-based - Engineers denied except medical staff
  // Engineers need additional scrutiny. Medical personnel are exempt.
  // =============================================================================
  SHIFT_2: {
    id: 'SHIFT_2',
    base: 'ENGINEERS',
    exceptions: ['MEDICAL'],
    hiddenExceptions: [],
    requiredChecks: ['WARRANT', 'TRANSIT'],
    text: ['DENY: ENGINEERS', 'EXCEPT: MEDICAL'],
  },

  // =============================================================================
  // SHIFT 3: Transit-flagged denial (lighter than full lockdown)
  // Deny subjects with flagged transit history.
  // =============================================================================
  SHIFT_3: {
    id: 'SHIFT_3',
    base: 'TRANSIT_FLAGGED',
    exceptions: [],
    hiddenExceptions: [],
    requiredChecks: ['TRANSIT'],
    text: ['DENY: TRANSIT FLAGS'],
  },
};
