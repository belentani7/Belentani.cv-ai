import { clearCvDraft, CV_STORAGE_KEY, LEGACY_CV_STORAGE_KEY, readCvDraft, saveCvDraft } from '@/lib/cv-storage';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe('CV Studio draft storage', () => {
  it('writes and clears only the Belentani namespace', () => {
    const storage = createStorage({ [LEGACY_CV_STORAGE_KEY]: '{"fullName":"Legacy"}' });

    saveCvDraft({ fullName: 'Ana' }, storage, new Date('2026-10-24T12:00:00.000Z'));
    clearCvDraft(storage);

    expect(storage.getItem(CV_STORAGE_KEY)).toBe('null');
    expect(readCvDraft(storage)).toBeNull();
    expect(storage.getItem(LEGACY_CV_STORAGE_KEY)).toBe('{"fullName":"Legacy"}');
  });

  it('reads legacy drafts without writing back to the legacy key', () => {
    const storage = createStorage({ [LEGACY_CV_STORAGE_KEY]: '{"fullName":"Legacy"}' });

    expect(readCvDraft(storage)).toEqual({ fullName: 'Legacy' });
    saveCvDraft({ fullName: 'Belentani' }, storage);

    expect(storage.getItem(CV_STORAGE_KEY)).toContain('Belentani');
    expect(storage.getItem(LEGACY_CV_STORAGE_KEY)).toBe('{"fullName":"Legacy"}');
  });
});
