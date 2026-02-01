import type { SubjectData } from '../data/subjects';
import type { SubjectSeed } from '../types/subjectSeed';
import type { DirectiveRule, DirectiveConditionType, ExceptionType } from '../types/directive';
import { createSubjectFromTraits } from './subjectFactory';
import { createSubjectEvidence } from './evidenceProvider';

const isHuman = (subjectType: SubjectData['subjectType']): boolean => subjectType === 'HUMAN';

const isCyborg = (subjectType: SubjectData['subjectType']): boolean =>
  subjectType === 'HUMAN_CYBORG' || subjectType === 'ROBOT_CYBORG';

const matchesCondition = (seed: SubjectSeed, condition: DirectiveConditionType): boolean => {
  switch (condition) {
    case 'WARRANTS':
      return !!seed.truthFlags.hasWarrant;
    case 'REPLICANTS':
      return seed.subjectType === 'REPLICANT';
    case 'SYNTHETICS':
      return seed.subjectType === 'REPLICANT' || seed.subjectType === 'ROBOT_CYBORG';
    case 'ENGINEERS':
      return seed.role === 'ENGINEER';
    case 'TITAN_ORIGIN':
      return seed.originPlanet === 'TITAN';
    case 'IO_ORIGIN':
      return (seed.originPlanet as string) === 'IO';
    case 'NON_HUMANS':
      return !isHuman(seed.subjectType);
    case 'ALL':
      return true;
    default:
      return false;
  }
};

const matchesException = (seed: SubjectSeed, exception: ExceptionType): boolean => {
  switch (exception) {
    case 'HUMANS':
      return isHuman(seed.subjectType);
    case 'VIP':
      return seed.hierarchyTier === 'VIP' || seed.exceptionTags?.includes('VIP_OVERRIDE') === true;
    case 'MEDICAL':
      return seed.role === 'MEDICAL' || seed.truthFlags.hasMedicalEmergency === true;
    case 'EARTH_ORIGIN':
      return (seed.originPlanet as string) === 'EARTH';
    case 'CYBORG':
      return isCyborg(seed.subjectType) || seed.exceptionTags?.includes('CYBORG_OVERRIDE') === true;
    case 'DIPLOMAT':
      return seed.role === 'DIPLOMAT' || seed.exceptionTags?.includes('DIPLOMAT') === true;
    case 'EMERGENCY':
      return seed.exceptionTags?.includes('EMERGENCY') === true || seed.truthFlags.hasMedicalEmergency === true;
    default:
      return false;
  }
};

export const evaluateDirective = (
  seed: SubjectSeed,
  directive: DirectiveRule
): {
  intendedOutcome: 'APPROVE' | 'DENY';
  matchedExceptions: ExceptionType[];
} => {
  const baseMatch = matchesCondition(seed, directive.base);
  const declared = directive.exceptions.filter((ex) => matchesException(seed, ex));
  const hidden = (directive.hiddenExceptions || []).filter((ex) => matchesException(seed, ex));
  const hasException = declared.length > 0 || hidden.length > 0;

  if (baseMatch && !hasException) {
    return { intendedOutcome: 'DENY', matchedExceptions: [] };
  }

  return { intendedOutcome: 'APPROVE', matchedExceptions: [...declared, ...hidden] };
};

export const buildSubjectFromSeed = (
  seed: SubjectSeed,
  directive: DirectiveRule
): SubjectData => {
  const traits = {
    subjectType: seed.subjectType,
    hierarchyTier: seed.hierarchyTier,
    originPlanet: seed.originPlanet,
  };

  const subject = createSubjectFromTraits(traits, seed.sex, {
    manualOverrides: {
      name: seed.name,
      id: seed.id,
      originPlanet: seed.originPlanet,
      reasonForVisit: seed.reasonForVisit,
    },
    useProceduralPortrait: true,
    seed: seed.seed,
  });

  const evidence = createSubjectEvidence(seed);
  const directiveEval = evaluateDirective(seed, directive);

  subject.warrants = evidence.warrants;
  subject.incidents = evidence.incidents;
  subject.databaseQuery = evidence.databaseQuery;
  subject.verificationRecord = evidence.verificationRecord;
  subject.evidenceOutputs = evidence.outputs;

  subject.intendedOutcome = directiveEval.intendedOutcome;
  subject.requiredChecks = directive.requiredChecks;
  subject.truthFlags = seed.truthFlags;
  subject.exceptionTags = seed.exceptionTags || [];
  subject.seed = seed.seed;

  return subject;
};
