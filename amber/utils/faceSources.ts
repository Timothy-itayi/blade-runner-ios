export type FaceSourceArchetype = 'human' | 'cyborg' | 'uncanny';

export type FaceSource = {
  key: string;
  label: string;
  archetype: FaceSourceArchetype;
  asset: number;
};

// NOTE: Asset list is fixed; update hooks in FaceLandmarkTfliteTest if you change this.
export const FACE_PIPELINE_SOURCES: FaceSource[] = [
  {
    key: 'female-late30s-white',
    label: 'female-late30s-white',
    archetype: 'human',
    asset: require('../assets/ai-portraits/female-late30s-white.png'),
  },
  {
    key: 'female-white-20s',
    label: 'female-white-20s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/female-white-20s.png'),
  },
  {
    key: 'female-white-late20s',
    label: 'female-white-late20s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/female-white-late20s.png'),
  },
  {
    key: 'white-female-20s',
    label: 'white-female-20s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-20s.png'),
  },
  {
    key: 'white-female-23',
    label: 'white-female-23',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-23.png'),
  },
  {
    key: 'white-female-24',
    label: 'white-female-24',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-24.png'),
  },
  {
    key: 'white-female-25',
    label: 'white-female-25',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-25.png'),
  },
  {
    key: 'white-female-28',
    label: 'white-female-28',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-28.png'),
  },
  {
    key: 'white-female-mid20s',
    label: 'white-female-mid20s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-mid20s.png'),
  },
  {
    key: 'white-female-teens',
    label: 'white-female-teens',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-female-teens.png'),
  },
  {
    key: 'male-white-40s',
    label: 'male-white-40s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/male-white-40s.png'),
  },
  {
    key: 'male-white-late30s',
    label: 'male-white-late30s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/male-white-late30s.png'),
  },
  {
    key: 'white-male-20s',
    label: 'white-male-20s',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-male-20s.png'),
  },
  {
    key: 'white-male-37',
    label: 'white-male-37',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-male-37.png'),
  },
  {
    key: 'white-male-45',
    label: 'white-male-45',
    archetype: 'human',
    asset: require('../assets/ai-portraits/white-male-45.png'),
  },
  {
    key: 'asian-late30s-male',
    label: 'asian-late30s-male',
    archetype: 'human',
    asset: require('../assets/ai-portraits/asian-late30s-male.png'),
  },
  {
    key: 'black-male-teens',
    label: 'black-male-teens',
    archetype: 'human',
    asset: require('../assets/ai-portraits/black-male-teens.png'),
  },
];

export const FACE_PIPELINE_SOURCE_COUNT = FACE_PIPELINE_SOURCES.length;

export const FACE_SOURCE_INDEX = FACE_PIPELINE_SOURCES.reduce<Record<string, number>>((acc, source, index) => {
  acc[source.key] = index;
  return acc;
}, {});
