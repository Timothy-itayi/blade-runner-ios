import type { RequiredCheck } from '../utils/requiredChecks';

export type DirectiveConditionType =
  | 'WARRANTS'
  | 'REPLICANTS'
  | 'SYNTHETICS'
  | 'ENGINEERS'
  | 'DISTRICT_3_ORIGIN'
  | 'DISTRICT_4_ORIGIN'
  | 'NON_HUMANS'
  | 'ALL';

export type ExceptionType =
  | 'HUMANS'
  | 'VIP'
  | 'MEDICAL'
  | 'DISTRICT_1_ORIGIN'
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
