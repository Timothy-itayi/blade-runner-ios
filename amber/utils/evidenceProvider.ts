import type { SubjectSeed } from '../types/subjectSeed';
import type { SubjectEvidence, EvidenceKind, TravelEntry } from '../types/evidence';
import type { VerificationRecord } from '../data/subjects';
import { SeededRandom } from './seededRandom';
import {
  INCIDENT_DISCREPANCIES,
  TRANSIT_ROUTES,
  VERIFICATION_CONTRADICTIONS,
  VERIFICATION_QUESTIONS,
  VERIFICATION_SOURCES,
  VERIFICATION_SUMMARIES,
  WARRANT_DETAILS,
} from '../data/templates/evidenceTemplates';

const formatDate = (rng: SeededRandom): string => {
  const year = 3184;
  const month = String(rng.int(1, 12)).padStart(2, '0');
  const day = String(rng.int(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const buildTravelHistory = (rng: SeededRandom, hasTransitIssue: boolean): TravelEntry[] => {
  const count = rng.int(1, 4);
  const entries: TravelEntry[] = [];
  for (let i = 0; i < count; i += 1) {
    const route = rng.pick(TRANSIT_ROUTES);
    const flagged = hasTransitIssue && rng.bool(0.5);
    entries.push({
      from: route.from,
      to: route.to,
      date: formatDate(rng),
      flagged,
      flagNote: flagged ? 'ROUTE FLAGGED' : undefined,
    });
  }
  if (hasTransitIssue && !entries.some((e) => e.flagged)) {
    entries[0] = { ...entries[0], flagged: true, flagNote: 'ROUTE FLAGGED' };
  }
  return entries;
};

const buildVerificationRecord = (
  rng: SeededRandom,
  type: VerificationRecord['type']
): VerificationRecord => {
  return {
    type,
    date: formatDate(rng),
    referenceId: `VR-${rng.int(1000, 9999)}-${type.slice(0, 3)}`,
    source: rng.pick(VERIFICATION_SOURCES),
    summary: rng.pick(VERIFICATION_SUMMARIES),
    contradiction: rng.pick(VERIFICATION_CONTRADICTIONS),
    question: rng.pick(VERIFICATION_QUESTIONS),
  };
};

const pickMany = <T,>(rng: SeededRandom, items: T[], count: number): T[] => {
  const pool = [...items];
  const picks: T[] = [];
  const limit = Math.min(count, pool.length);
  for (let i = 0; i < limit; i += 1) {
    const idx = rng.int(0, pool.length - 1);
    picks.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picks;
};

const buildOutputs = (seed: SubjectSeed, evidence: SubjectEvidence): Record<EvidenceKind, string[]> => {
  const hasWarrant = evidence.warrants !== 'NONE';
  const warrantLines = [
    'AMBER DB / WARRANT INDEX',
    `SUBJECT: ${seed.id}`,
    `RESULT: ${hasWarrant ? 'ACTIVE WARRANT' : 'CLEAR'}`,
    `DETAIL: ${hasWarrant ? evidence.warrants : 'NONE'}`,
    `INCIDENT COUNT: ${evidence.incidents}`,
    'EXTRACT COMPLETE',
  ];

  const travel = evidence.databaseQuery.travelHistory;
  const flagged = travel.filter((entry) => entry.flagged).length;
  const transitLines = [
    'AMBER DB / TRANSIT LOG',
    `SUBJECT: ${seed.id}`,
    `RECORDS: ${travel.length}`,
    flagged > 0 ? `ALERT: ${flagged} FLAGGED` : 'ALERT: CLEAR',
    ...travel.slice(0, 3).map((entry) => `${entry.date}: ${entry.from} -> ${entry.to}${entry.flagged ? ' [FLAGGED]' : ''}`),
    travel.length > 3 ? `... ${travel.length - 3} MORE` : '... END OF LOG',
    'EXTRACT COMPLETE',
  ];

  const discrepancies = evidence.databaseQuery.discrepancies;
  const incidentLines = [
    'AMBER DB / INCIDENT RECORD',
    `SUBJECT: ${seed.id}`,
    `ON FILE: ${evidence.incidents}`,
    ...discrepancies.slice(0, 3).map((entry, index) => `ENTRY ${index + 1}: ${entry}`),
    discrepancies.length > 3 ? `... ${discrepancies.length - 3} MORE` : '... END OF RECORD',
    'EXTRACT COMPLETE',
  ];

  return {
    WARRANT: warrantLines,
    TRANSIT: transitLines,
    INCIDENT: incidentLines,
  };
};

export const createSubjectEvidence = (seed: SubjectSeed): SubjectEvidence => {
  const rng = new SeededRandom(seed.seed);
  const warrants = seed.truthFlags.hasWarrant ? rng.pick(WARRANT_DETAILS) : 'NONE';
  const incidents = seed.truthFlags.hasIncident ? rng.int(1, 3) : 0;
  const travelHistory = buildTravelHistory(rng, seed.truthFlags.hasTransitIssue);
  const discrepancies = seed.truthFlags.hasIncident
    ? pickMany(rng, INCIDENT_DISCREPANCIES, rng.int(1, 3))
    : [];

  const evidence: SubjectEvidence = {
    warrants,
    incidents,
    databaseQuery: {
      travelHistory,
      lastSeenLocation: rng.pick(['AMBER DEPOT', 'EARTH ORBIT', 'TITAN TERMINAL', 'MARS YARD']),
      lastSeenDate: formatDate(rng),
      discrepancies,
    },
    verificationRecord: seed.truthFlags.hasIncident
      ? buildVerificationRecord(rng, seed.truthFlags.hasTransitIssue ? 'TRANSIT' : 'INCIDENT')
      : seed.truthFlags.hasWarrant
        ? buildVerificationRecord(rng, 'WARRANT')
        : undefined,
    outputs: {} as Record<EvidenceKind, string[]>,
  };

  evidence.outputs = buildOutputs(seed, evidence);
  return evidence;
};
