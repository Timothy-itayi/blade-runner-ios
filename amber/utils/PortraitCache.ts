import * as FileSystem from 'expo-file-system/legacy';
import {
  PORTRAIT_CACHE_BUDGETS,
  PORTRAIT_GENERATOR_VERSION,
  PORTRAIT_HEADSET_VERSION,
} from './PortraitConfig';

const CACHE_DIR = `${FileSystem.cacheDirectory}portraits/`;
const INDEX_PATH = `${CACHE_DIR}index.json`;

type CacheEntry = {
  key: string;
  uri: string;
  size: number;
  sizeKey: number;
  createdAt: number;
  lastAccess: number;
  version: string;
  headSetVersion: string;
  subjectId: string;
};

type CacheIndex = {
  entries: Record<string, CacheEntry>;
};

const emptyIndex = (): CacheIndex => ({ entries: {} });
const safeId = (id: string) => encodeURIComponent(id);

const getKeyParts = ({
  subjectId,
  size,
  version = PORTRAIT_GENERATOR_VERSION,
  headSetVersion = PORTRAIT_HEADSET_VERSION,
}: {
  subjectId: string;
  size: number;
  version?: string;
  headSetVersion?: string;
}) => `${safeId(subjectId)}_${version}_${headSetVersion}_${size}`;

const getBudgetForSize = (size: number) =>
  PORTRAIT_CACHE_BUDGETS[size] ?? PORTRAIT_CACHE_BUDGETS[256];

let cacheIndex: CacheIndex | null = null;
let initPromise: Promise<void> | null = null;

const queueListeners = new Set<() => void>();
let activeRenderKey: string | null = null;
const renderQueue: string[] = [];

const notifyQueue = () => {
  queueListeners.forEach((listener) => listener());
};

const loadIndex = async () => {
  try {
    const info = await FileSystem.getInfoAsync(INDEX_PATH);
    if (!info.exists) {
      cacheIndex = emptyIndex();
      return;
    }
    const raw = await FileSystem.readAsStringAsync(INDEX_PATH);
    const parsed = JSON.parse(raw);
    cacheIndex = parsed && typeof parsed === 'object' ? parsed : emptyIndex();
  } catch {
    cacheIndex = emptyIndex();
  }
};

const saveIndex = async () => {
  if (!cacheIndex) return;
  await FileSystem.writeAsStringAsync(INDEX_PATH, JSON.stringify(cacheIndex));
};

const touchEntry = async (key: string) => {
  if (!cacheIndex) return;
  const entry = cacheIndex.entries[key];
  if (!entry) return;
  entry.lastAccess = Date.now();
  await saveIndex();
};

const pruneCache = async () => {
  if (!cacheIndex) return;

  const entries = Object.values(cacheIndex.entries);
  for (const entry of entries) {
    const info = await FileSystem.getInfoAsync(entry.uri);
    if (!info.exists) {
      delete cacheIndex.entries[entry.key];
    } else if (!entry.size && info.size) {
      entry.size = info.size;
    }
  }

  const bySize: Record<number, CacheEntry[]> = {};
  for (const entry of Object.values(cacheIndex.entries)) {
    if (!bySize[entry.sizeKey]) bySize[entry.sizeKey] = [];
    bySize[entry.sizeKey].push(entry);
  }

  for (const [sizeKey, list] of Object.entries(bySize)) {
    const size = Number(sizeKey);
    const budget = getBudgetForSize(size);
    let total = list.reduce((sum, entry) => sum + (entry.size || 0), 0);

    if (total <= budget) continue;

    list.sort((a, b) => a.lastAccess - b.lastAccess);
    for (const entry of list) {
      if (total <= budget) break;
      try {
        await FileSystem.deleteAsync(entry.uri, { idempotent: true });
      } catch {
        // Skip delete failures; keep moving to avoid lockup.
      }
      total -= entry.size || 0;
      delete cacheIndex.entries[entry.key];
    }
  }

  await saveIndex();
};

export type PortraitCacheKey = {
  subjectId: string;
  size: number;
  version?: string;
  headSetVersion?: string;
};

export const PortraitCache = {
  async init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }
      await loadIndex();
      await pruneCache();
    })();
    return initPromise;
  },

  getKey({ subjectId, size, version, headSetVersion }: PortraitCacheKey) {
    return getKeyParts({ subjectId, size, version, headSetVersion });
  },

  getUri({ subjectId, size, version, headSetVersion }: PortraitCacheKey) {
    const key = getKeyParts({ subjectId, size, version, headSetVersion });
    return `${CACHE_DIR}${key}.png`;
  },

  async exists({ subjectId, size, version, headSetVersion }: PortraitCacheKey) {
    await this.init();
    const key = getKeyParts({ subjectId, size, version, headSetVersion });
    const uri = `${CACHE_DIR}${key}.png`;
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      if (cacheIndex) delete cacheIndex.entries[key];
      return false;
    }

    if (cacheIndex) {
      cacheIndex.entries[key] = {
        key,
        uri,
        size: info.size || cacheIndex.entries[key]?.size || 0,
        sizeKey: size,
        createdAt: cacheIndex.entries[key]?.createdAt || Date.now(),
        lastAccess: Date.now(),
        version: version || PORTRAIT_GENERATOR_VERSION,
        headSetVersion: headSetVersion || PORTRAIT_HEADSET_VERSION,
        subjectId,
      };
      await saveIndex();
    }

    return true;
  },

  async save({ subjectId, size, version, headSetVersion }: PortraitCacheKey, base64: string) {
    await this.init();
    const key = getKeyParts({ subjectId, size, version, headSetVersion });
    const uri = `${CACHE_DIR}${key}.png`;
    const data = base64.replace(/^data:image\/\w+;base64,/, '');
    await FileSystem.writeAsStringAsync(uri, data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const info = await FileSystem.getInfoAsync(uri);
    if (cacheIndex) {
      cacheIndex.entries[key] = {
        key,
        uri,
        size: info.size || 0,
        sizeKey: size,
        createdAt: cacheIndex.entries[key]?.createdAt || Date.now(),
        lastAccess: Date.now(),
        version: version || PORTRAIT_GENERATOR_VERSION,
        headSetVersion: headSetVersion || PORTRAIT_HEADSET_VERSION,
        subjectId,
      };
      await saveIndex();
    }

    await pruneCache();
    return uri;
  },

  async touch({ subjectId, size, version, headSetVersion }: PortraitCacheKey) {
    await this.init();
    const key = getKeyParts({ subjectId, size, version, headSetVersion });
    await touchEntry(key);
  },

  async clear() {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (dirInfo.exists) {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      cacheIndex = emptyIndex();
      initPromise = null;
    }
  },

  requestRenderSlot(key: string) {
    if (activeRenderKey === key) return true;
    if (!activeRenderKey) {
      activeRenderKey = key;
      notifyQueue();
      return true;
    }
    if (!renderQueue.includes(key)) {
      renderQueue.push(key);
      notifyQueue();
    }
    return false;
  },

  releaseRenderSlot(key: string) {
    let changed = false;
    if (activeRenderKey === key) {
      activeRenderKey = renderQueue.shift() || null;
      changed = true;
    } else {
      const index = renderQueue.indexOf(key);
      if (index >= 0) {
        renderQueue.splice(index, 1);
        changed = true;
      }
    }
    if (changed) notifyQueue();
  },

  isRenderSlotActive(key: string) {
    return activeRenderKey === key;
  },

  subscribeQueue(listener: () => void) {
    queueListeners.add(listener);
    return () => {
      queueListeners.delete(listener);
    };
  },
};
