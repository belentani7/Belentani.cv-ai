import { cvDraftSchema } from '@/lib/cv-file';

export const CV_STORAGE_KEY = 'belentani-cv-studio:cv:v1';
export const LEGACY_CV_STORAGE_KEY = 'manos-abiertas-cv';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function browserStorage(): StorageLike | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // In restricted/private browser contexts even accessing localStorage may throw.
    return null;
  }
}

export function readCvDraft<T = Record<string, unknown>>(storage: StorageLike | null = browserStorage()): T | null {
  if (!storage) return null;

  try {
    const stored = storage.getItem(CV_STORAGE_KEY) ?? storage.getItem(LEGACY_CV_STORAGE_KEY);
    if (!stored) return null;
    const result = cvDraftSchema.safeParse(JSON.parse(stored));
    return result.success ? result.data as T : null;
  } catch {
    return null;
  }
}

export function saveCvDraft(
  data: Record<string, unknown>,
  storage: StorageLike | null = browserStorage(),
  savedAt = new Date(),
): Date | null {
  if (!storage) return null;

  try {
    storage.setItem(CV_STORAGE_KEY, JSON.stringify({ ...data, savedAt: savedAt.toISOString() }));
    return savedAt;
  } catch {
    return null;
  }
}

export function clearCvDraft(storage: StorageLike | null = browserStorage()): void {
  try {
    // A tombstone prevents an old Manos Abiertas draft from reappearing after deletion.
    // It contains no personal data and can be replaced by the next save.
    storage?.setItem(CV_STORAGE_KEY, 'null');
  } catch {
    // Storage may be unavailable or restricted by the browser.
  }
}
