import type { SubjectType, HierarchyTier } from '../data/subjects';
import type { OriginPlanet } from '../data/subjectTraits';

export type SubjectRole =
  | 'ENGINEER'
  | 'MEDICAL'
  | 'SECURITY'
  | 'DIPLOMAT'
  | 'CIVILIAN';

export type ExceptionTag =
  | 'CYBORG_OVERRIDE'
  | 'DIPLOMAT'
  | 'EMERGENCY'
  | 'SEALED'
  | 'VIP_OVERRIDE';

export interface SubjectTruthFlags {
  hasWarrant: boolean;
  hasTransitIssue: boolean;
  hasIncident: boolean;
  hasMedicalEmergency?: boolean;
}

export interface SubjectSeed {
  id: string;
  seed: number;
  name: string;
  sex: 'M' | 'F' | 'X';
  subjectType: SubjectType;
  hierarchyTier: HierarchyTier;
  originPlanet: OriginPlanet;
  role?: SubjectRole;
  reasonForVisit?: string;
  truthFlags: SubjectTruthFlags;
  exceptionTags?: ExceptionTag[];
}
