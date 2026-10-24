/** CV drafts remain on-device. Keep historic education and CV Studio keys distinct. */
export const LEGACY_CV_KEY = 'manos-abiertas-cv';
export const CV_STUDIO_KEY = 'belentani-cv-studio:v1';

type StorageReader = Pick<Storage, 'getItem' | 'setItem'>;
type RecordValue = Record<string, unknown>;

function record(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Used for blank-draft detection; IDs, template settings and timestamps do not count. */
export function hasCvDraftContent(value: unknown): boolean {
  if (!record(value)) return false;
  const fields = ['fullName', 'profession', 'email', 'phone', 'address', 'summary'];
  if (fields.some((field) => typeof value[field] === 'string' && (value[field] as string).trim())) return true;
  for (const key of ['skills', 'languages']) {
    const values = value[key];
    if (Array.isArray(values) && values.some((item: unknown) => typeof item === 'string' && item.trim())) return true;
  }
  const entries: Record<string, string[]> = {
    experiences: ['position', 'company', 'startDate', 'endDate', 'description'],
    education: ['title', 'institution', 'year', 'description'],
  };
  for (const [key, properties] of Object.entries(entries)) {
    const rows = value[key];
    if (Array.isArray(rows) && rows.some((row: unknown) =>
      record(row) && properties.some((field) => typeof row[field] === 'string' && (row[field] as string).trim())
    )) return true;
  }
  return false;
}

function parseDraft(raw: string | null): RecordValue | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return record(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * A one-time, non-destructive copy from the old shared key only if Studio has
 * no draft yet. Never delete or overwrite the historic Manos Abiertas draft.
 */
export function readCvDraft(storage: StorageReader, key: string): RecordValue | null {
  const own = storage.getItem(key);
  if (own !== null) return parseDraft(own);
  if (key !== CV_STUDIO_KEY) return null;

  const original = storage.getItem(LEGACY_CV_KEY);
  const previousDraft = parseDraft(original);
  if (!previousDraft || !hasCvDraftContent(previousDraft)) return null;
  try {
    storage.setItem(CV_STUDIO_KEY, original!);
  } catch {
    // Read the existing draft even if storage is full or writes are blocked.
  }
  return previousDraft;
}

/** Clear a draft without resurrecting the copied legacy CV on the next visit. */
export function resetCvDraft(storage: Pick<Storage, 'setItem' | 'removeItem'>, key: string): void {
  if (key === CV_STUDIO_KEY) {
    // Blank marker means 'Studio was deliberately cleared', not 'never visited'.
    storage.setItem(key, '{}');
  } else {
    storage.removeItem(key);
  }
}
