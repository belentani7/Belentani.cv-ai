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

describe('stored draft validation', () => {
  it.each([
    'null', '[]', '"text"', '42', 'true', '{',
    '{"fullName":{}}',
    '{"experiences":"broken"}',
    '{"experiences":[null]}',
    '{"skills":[42]}',
    '{"languages":[{}]}',
    '{"savedAt":"not a date"}',
  ])('ignores malformed saved drafts without throwing: %s', (value) => {
    const storage = createStorage({ [CV_STORAGE_KEY]: value });
    expect(readCvDraft(storage)).toBeNull();
    expect(storage.getItem(CV_STORAGE_KEY)).toBe(value);
  });

  it('never overwrites a good draft with data that cannot be restored', () => {
    const storage = createStorage();
    const date = new Date('2026-10-29T08:00:00.000Z');
    expect(saveCvDraft({ fullName: 'Ana', skills: [] }, storage, date)).toEqual(date);
    const original = storage.getItem(CV_STORAGE_KEY);

    expect(saveCvDraft({ fullName: 42 }, storage, date)).toBeNull();
    expect(saveCvDraft({ experiences: [{ id: 'same', position: '', company: '', startDate: '', endDate: '', description: '' },
      { id: 'same', position: '', company: '', startDate: '', endDate: '', description: '' }] }, storage, date)).toBeNull();
    expect(storage.getItem(CV_STORAGE_KEY)).toBe(original);
    expect(readCvDraft(storage)).toEqual({ fullName: 'Ana', skills: [], savedAt: date.toISOString() });
  });

  it('enforces the portable CV size budget before local persistence', () => {
    const storage = createStorage({ [CV_STORAGE_KEY]: '{"fullName":"Existing"}' });
    // Each individual skill is valid but the combined record exceeds 1 MiB.
    const skills = Array.from({ length: 200 }, (_, i) => String(i) + 'x'.repeat(6000));
    expect(saveCvDraft({ skills }, storage)).toBeNull();
    expect(storage.getItem(CV_STORAGE_KEY)).toBe('{"fullName":"Existing"}');
    expect(readCvDraft(storage)).toEqual({ fullName: 'Existing' });
  });

  it('validates legacy drafts before returning them to the editor', () => {
    const storage = createStorage({ [LEGACY_CV_STORAGE_KEY]: '{"education":[null]}' });
    expect(readCvDraft(storage)).toBeNull();
  });

  it('preserves valid incomplete drafts and empty collections', () => {
    const draft = { fullName: '李 Ana', experiences: [], education: [], skills: [], languages: [] };
    const storage = createStorage({ [CV_STORAGE_KEY]: JSON.stringify(draft) });
    expect(readCvDraft(storage)).toEqual(draft);
  });

  it('does not revive a legacy draft when the current draft is invalid', () => {
    const storage = createStorage({
      [CV_STORAGE_KEY]: '{"skills":[null]}',
      [LEGACY_CV_STORAGE_KEY]: '{"fullName":"Legacy"}',
    });
    expect(readCvDraft(storage)).toBeNull();
  });

  it('rejects duplicate row identities that would corrupt editor updates', () => {
    const row = { id: '1', position: '', company: '', startDate: '', endDate: '', description: '' };
    const storage = createStorage({ [CV_STORAGE_KEY]: JSON.stringify({ experiences: [row, row] }) });
    expect(readCvDraft(storage)).toBeNull();
  });
});
