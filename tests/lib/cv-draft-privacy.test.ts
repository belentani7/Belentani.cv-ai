import { buildCvAiPayload, hasMeaningfulCvData, type CvDraft } from '../../src/lib/cv-draft-privacy';

const blank: CvDraft = {
  fullName: '', profession: '', email: '', phone: '', address: '', summary: '',
  experiences: [{ position: '', company: '', description: '', startDate: '', endDate: '' }],
  education: [{ title: '', institution: '', year: '', description: '' }],
  skills: [], languages: [],
};

describe('CV privacy and draft persistence', () => {
  it('does not recreate an empty draft after a user resets it', () => {
    expect(hasMeaningfulCvData(blank)).toBe(false);
    expect(hasMeaningfulCvData({ ...blank, fullName: '   ', skills: ['  '] })).toBe(false);
  });

  it.each(['email', 'phone', 'address', 'summary', 'fullName', 'profession'] as const)(
    'recognizes %s-only drafts to preserve actual user data', field => {
      expect(hasMeaningfulCvData({ ...blank, [field]: 'Example' })).toBe(true);
    },
  );

  it('recognizes descriptions and dates even without titles', () => {
    expect(hasMeaningfulCvData({
      ...blank,
      experiences: [{ ...blank.experiences[0], description: 'Actual work details' }],
    })).toBe(true);
    expect(hasMeaningfulCvData({
      ...blank,
      education: [{ ...blank.education[0], year: '2024' }],
    })).toBe(true);
  });

  const personal: CvDraft = {
    ...blank, fullName: 'Confidential Person', email: 'secret@example.test',
    phone: 'Private phone', address: 'Private address', profession: 'Engineer',
    experiences: [
      { position: 'Engineer', company: 'Example Ltd', startDate: '2021', endDate: '2024', description: 'Built software' },
      { position: 'Designer', company: 'Second Ltd', startDate: '2020', endDate: '2021', description: 'Designed tools' },
    ],
    education: [{ title: 'Degree', institution: 'University', year: '2019', description: '' }],
    skills: ['TypeScript'], languages: ['English'],
  };

  it('excludes direct identifiers and local IDs from summary AI payload', () => {
    const payload = buildCvAiPayload('summary', personal, 'es');
    const serialized = JSON.stringify(payload);
    expect(payload).toHaveProperty('profession', 'Engineer');
    expect(payload).toHaveProperty('education');
    expect(serialized).not.toContain('Confidential Person');
    expect(serialized).not.toContain('secret@example.test');
    expect(serialized).not.toContain('Private phone');
    expect(serialized).not.toContain('Private address');
    expect(serialized).not.toContain('"id":');
    expect(serialized).not.toContain('"languages":');
  });

  it('transmits only first experience for experience AI requests', () => {
    const payload = buildCvAiPayload('experience', personal, 'es');
    expect(payload).toEqual({
      field: 'experience', language: 'es', experiences: [personal.experiences[0]],
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain('Second Ltd');
    expect(serialized).not.toContain('secret@example.test');
    expect(serialized).not.toContain('University');
    expect(serialized).not.toContain('TypeScript');
  });
});
