import type { SubjectType, HierarchyTier } from '../data/subjects';
import type { OriginPlanet } from '../data/subjectTraits';
import type { CommunicationStyle, CredentialBehavior } from '../data/subjectGreetings';
import type { AlertScenario } from './alertScenario';

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
  destinationPlanet?: string;
  greetingText?: string;
  communicationStyle?: CommunicationStyle;
  credentialBehavior?: CredentialBehavior;
  dossier?: {
    occupation?: string;
    address?: string;
  };
  alertScenario?: AlertScenario;
  truthFlags: SubjectTruthFlags;
  exceptionTags?: ExceptionTag[];
}
