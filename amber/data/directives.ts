import type { DirectiveRule } from '../types/directive';

export const DIRECTIVES: Record<string, DirectiveRule> = {
  SHIFT_1: {
    id: 'SHIFT_1',
    base: 'WARRANTS',
    exceptions: [],
    hiddenExceptions: [],
    requiredChecks: ['WARRANT'],
    text: ['DENY: WARRANTS'],
  },
  SHIFT_2: {
    id: 'SHIFT_2',
    base: 'ENGINEERS',
    exceptions: ['HUMANS'],
    hiddenExceptions: [],
    requiredChecks: ['INCIDENT'],
    text: ['DENY: ENGINEERS', 'EXCEPT: HUMANS'],
  },
  SHIFT_3: {
    id: 'SHIFT_3',
    base: 'REPLICANTS',
    exceptions: ['VIP'],
    hiddenExceptions: ['DIPLOMAT'],
    requiredChecks: ['TRANSIT', 'INCIDENT'],
    text: ['DENY: REPLICANTS', 'EXCEPT: VIP'],
  },
};
