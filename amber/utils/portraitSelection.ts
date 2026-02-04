import { FACE_SOURCE_INDEX } from './faceSources';

type PortraitSelectionInput = {
  subjectId?: string | null;
  sex?: string | null;
  subjectType?: string | null;
};

const FEMALE_KEYS = [
  'female-late30s-white',
  'female-white-20s',
  'female-white-late20s',
  'white-female-20s',
  'white-female-23',
  'white-female-24',
  'white-female-25',
  'white-female-28',
  'white-female-mid20s',
  'white-female-teens',
];

const MALE_WHITE_KEYS = ['male-white-40s', 'male-white-late30s', 'white-male-20s', 'white-male-37', 'white-male-45'];

const SPECIAL_SUBJECT_SOURCE_BY_ID: Record<string, string> = {
  // Black teen
  'S2-02': 'black-male-teens',
  // Asian male 30s
  'S1-12': 'asian-late30s-male',
};

export function resolvePortraitSelection({
  subjectId,
  sex,
  subjectType,
}: PortraitSelectionInput): { baseIndex: number; seed: string } {
  const seed = subjectId ?? 'portrait_default';
  if (!subjectId) {
    return { baseIndex: 0, seed };
  }

  const specialKey = SPECIAL_SUBJECT_SOURCE_BY_ID[subjectId];
  if (specialKey && FACE_SOURCE_INDEX[specialKey] !== undefined) {
    return { baseIndex: FACE_SOURCE_INDEX[specialKey], seed };
  }

  const pool = sex === 'F' ? FEMALE_KEYS : MALE_WHITE_KEYS;
  const index = pool.length ? hashSubjectId(subjectId) % pool.length : 0;
  const key = pool[index] ?? pool[0];
  const baseIndex = key && FACE_SOURCE_INDEX[key] !== undefined ? FACE_SOURCE_INDEX[key] : 0;

  return { baseIndex, seed: `${seed}_${subjectType ?? 'base'}` };
}

function hashSubjectId(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
