import { ShiftData } from '../constants/shifts';
import { GatheredInformation } from '../types/information';

export type RequiredCheck = 'DATABASE' | 'WARRANT' | 'TRANSIT' | 'INCIDENT';

const RULE_CHECK_MAP: Record<string, RequiredCheck[]> = {
  CHECK_WARRANTS: ['WARRANT'],
  CHECK_CREDENTIALS: ['INCIDENT'],
  CHECK_TRANSIT: ['TRANSIT'],
  CHECK_INCIDENTS: ['INCIDENT'],
};

const uniqueChecks = (checks: RequiredCheck[]) => Array.from(new Set(checks));

export const getRequiredChecks = (shift: ShiftData): RequiredCheck[] => {
  if (shift.directiveModel?.requiredChecks?.length) {
    return uniqueChecks(shift.directiveModel.requiredChecks);
  }
  const rules = shift.activeRules || [];
  const checks = rules.flatMap((rule) => RULE_CHECK_MAP[rule] ?? []);

  if (checks.length > 0) {
    return uniqueChecks(checks);
  }

  if (shift.unlockedChecks?.includes('DATABASE')) {
    return ['DATABASE'];
  }

  return [];
};

export const isCheckComplete = (info: GatheredInformation, check: RequiredCheck): boolean => {
  switch (check) {
    case 'WARRANT':
      return !!info.warrantCheck;
    case 'TRANSIT':
      return !!info.transitLog;
    case 'INCIDENT':
      return !!info.incidentHistory;
    case 'DATABASE':
      return !!(info.warrantCheck || info.transitLog || info.incidentHistory);
    default:
      return false;
  }
};

export const getMissingRequiredChecks = (
  info: GatheredInformation,
  requiredChecks: RequiredCheck[]
): RequiredCheck[] => {
  return requiredChecks.filter((check) => !isCheckComplete(info, check));
};

export const formatRequiredChecks = (requiredChecks: RequiredCheck[]): string => {
  if (!requiredChecks.length) return 'NONE';
  return requiredChecks.join(', ');
};
