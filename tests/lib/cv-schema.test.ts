import { validateCVPayload } from '../../lib/validators/cvSchema';

describe('CV payload validation (Zod 4)', () => {
  const validCV = {
    name: 'Ana Silva',
    profession: 'Developer',
    experience: 'Built accessible web applications.',
    skills: ['TypeScript'],
  };

  it('accepts only the expected CV fields', () => {
    const result = validateCVPayload(validCV);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(validCV);
  });

  it('rejects unknown fields instead of silently passing them to the handler', () => {
    const result = validateCVPayload({ ...validCV, admin: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.status).toBe(400);
      expect(result.issues?.length).toBeGreaterThan(0);
    }
  });

  it('rejects emails as personal data without echoing them in errors', () => {
    const result = validateCVPayload({
      ...validCV,
      experience: 'Contact ana@example.test about this CV.',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toBe('PII detected in payload');
      expect(JSON.stringify(result)).not.toContain('ana@example.test');
    }
  });
});
