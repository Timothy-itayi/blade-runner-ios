import type { RequiredCheck } from '../utils/requiredChecks';

export type DirectiveConditionType =
  | 'WARRANTS'
  | 'REPLICANTS'
  | 'SYNTHETICS'
  | 'ENGINEERS'
  | 'TITAN_ORIGIN'
  | 'IO_ORIGIN'
  | 'NON_HUMANS'
  | 'ALL';

export type ExceptionType =
  | 'HUMANS'
  | 'VIP'
  | 'MEDICAL'
  | 'EARTH_ORIGIN'
  | 'CYBORG'
  | 'DIPLOMAT'
  | 'EMERGENCY';

export interface DirectiveRule {
  id: string;
  base: DirectiveConditionType;
  exceptions: ExceptionType[];
  hiddenExceptions?: ExceptionType[];
  requiredChecks: RequiredCheck[];
  text: string[];
}
