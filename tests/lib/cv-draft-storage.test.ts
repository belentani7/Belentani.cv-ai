import { CV_STUDIO_KEY, LEGACY_CV_KEY, hasCvDraftContent, readCvDraft, resetCvDraft } from '../../src/lib/cv-draft-storage';

function storage() {
  const entries = new Map<string, string>();
  return {
    entries,
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
  };
}

describe('CV Studio draft isolation and safe migration', () => {
  it('does not mistake a blank editor, timestamps or default row IDs for a CV', () => {
    expect(hasCvDraftContent({
      template: 'modern', savedAt: '2026-10-23T00:00:00Z',
      experiences: [{ id: '1', position: '', company: '', description: '', startDate: '', endDate: '' }],
      education: [{ id: '1', title: '', institution: '', year: '', description: '' }],
      skills: [], languages: [],
    })).toBe(false);
  });

  it.each([
    { fullName: '  Ada  ' },
    { phone: '12345' },
    { experiences: [{ id: '1', description: 'Mejoré un proceso' }] },
    { education: [{ id: '1', institution: 'Universidad' }] },
    { languages: ['pt-BR'] },
  ])('treats partial but meaningful content as real user work', (draft) => {
    expect(hasCvDraftContent(draft)).toBe(true);
  });

  it('imports a real old CV only once and preserves its exact original bytes', () => {
    const s = storage();
    const original = '{"fullName":"Ana","skills":["UX"],"extraHistoricField":"preserve me"}';
    s.setItem(LEGACY_CV_KEY, original);

    const imported = readCvDraft(s, CV_STUDIO_KEY);
    expect(imported?.fullName).toBe('Ana');
    expect(s.getItem(CV_STUDIO_KEY)).toBe(original);
    expect(s.getItem(LEGACY_CV_KEY)).toBe(original);
    expect(readCvDraft(s, CV_STUDIO_KEY)?.fullName).toBe('Ana');
  });

  it('prefers an existing Studio CV and never overwrites it with historic data', () => {
    const s = storage();
    s.setItem(LEGACY_CV_KEY, '{"fullName":"Historic"}');
    s.setItem(CV_STUDIO_KEY, '{"fullName":"Current"}');
    expect(readCvDraft(s, CV_STUDIO_KEY)?.fullName).toBe('Current');
    expect(s.getItem(LEGACY_CV_KEY)).toContain('Historic');
  });

  it('ignores blank and corrupt legacy records without copying them', () => {
    const s = storage();
    s.setItem(LEGACY_CV_KEY, '{"template":"modern","experiences":[{"id":"1"}]}');
    expect(readCvDraft(s, CV_STUDIO_KEY)).toBeNull();
    expect(s.getItem(CV_STUDIO_KEY)).toBeNull();
    s.setItem(LEGACY_CV_KEY, '{not json');
    expect(readCvDraft(s, CV_STUDIO_KEY)).toBeNull();
    expect(s.getItem(LEGACY_CV_KEY)).toBe('{not json');
  });

  it('does not silently overwrite a corrupt Studio draft', () => {
    const s = storage();
    s.setItem(CV_STUDIO_KEY, '{corrupt');
    s.setItem(LEGACY_CV_KEY, '{"fullName":"Historic"}');
    expect(readCvDraft(s, CV_STUDIO_KEY)).toBeNull();
    expect(s.getItem(CV_STUDIO_KEY)).toBe('{corrupt');
  });

  it('does not restore historic data after an intentional Studio reset', () => {
    const s = storage();
    s.setItem(LEGACY_CV_KEY, '{"fullName":"Historic"}');
    s.setItem(CV_STUDIO_KEY, '{"fullName":"Current"}');
    resetCvDraft(s, CV_STUDIO_KEY);
    expect(s.getItem(CV_STUDIO_KEY)).toBe('{}');
    expect(hasCvDraftContent(readCvDraft(s, CV_STUDIO_KEY))).toBe(false);
    expect(s.getItem(LEGACY_CV_KEY)).toBe('{"fullName":"Historic"}');
  });

  it('clears the historical draft without affecting Studio', () => {
    const s = storage();
    s.setItem(LEGACY_CV_KEY, '{"fullName":"Historic"}');
    s.setItem(CV_STUDIO_KEY, '{"fullName":"Current"}');
    resetCvDraft(s, LEGACY_CV_KEY);
    expect(s.getItem(LEGACY_CV_KEY)).toBeNull();
    expect(readCvDraft(s, CV_STUDIO_KEY)?.fullName).toBe('Current');
  });

  it('does not silently claim reset succeeded when browser storage rejects writes', () => {
    const s = storage();
    const blocked = { ...s, setItem: (_key: string, _value: string): void => { throw new Error('quota'); } };
    expect(() => resetCvDraft(blocked, CV_STUDIO_KEY)).toThrow('quota');
  });

  it('recovers prior data in read-only/private storage when a migration write fails', () => {
    const s = storage();
    s.setItem(LEGACY_CV_KEY, '{"fullName":"Archived"}');
    const inaccessibleStorage = { ...s, setItem: (_key: string, _value: string): void => { throw new Error('quota'); } };
    expect(readCvDraft(inaccessibleStorage, CV_STUDIO_KEY)?.fullName).toBe('Archived');
    expect(s.getItem(LEGACY_CV_KEY)).toContain('Archived');
  });
});
