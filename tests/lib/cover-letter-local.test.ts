import { buildLocalLetter, localLetterLanguage, type LetterTone } from '../../src/lib/cover-letter-local';

describe('offline cover letter — honest privacy-preserving output', () => {
  const fields = {
    fullName: 'Ana Test',
    profession: 'Diseñadora',
    companyName: 'Taller Ejemplo',
    jobTitle: 'Diseñadora de producto',
    experience: 'Preparé prototipos para pruebas con usuarios',
    skills: ['Investigación UX', 'Accesibilidad'],
    tone: 'formal' as LetterTone,
  };

  it('generates a usable Spanish draft without calling any API', () => {
    const { text, languageUsed } = buildLocalLetter(fields, 'es');
    expect(languageUsed).toBe('es');
    expect(text).toContain('Taller Ejemplo');
    expect(text).toContain(fields.experience);
    expect(text).toContain('Investigación UX, Accesibilidad');
    expect(text).toContain('Ana Test');
    expect(text).toContain('Atentamente');
    expect(text).not.toContain('https://');
  });

  it.each(['es', 'en', 'pt-BR', 'ca', 'fr'])('supports a local %s draft with the provided facts', (lang) => {
    const value = buildLocalLetter(fields, lang);
    expect(value.languageUsed).toBe(lang);
    expect(value.text).toContain('Taller Ejemplo');
    expect(value.text).toContain('Diseñadora');
    expect(value.text).toContain(fields.experience);
    expect(value.text).toContain('Ana Test');
  });

  it('does not invent jobs, metrics, achievements or private identifiers when absent', () => {
    const draft = buildLocalLetter({ profession: 'Auxiliar', tone: 'direct', skills: [] }).text;
    expect(draft).toContain('Auxiliar');
    expect(draft).not.toMatch(/\b\d+[.,]?\d*\b|años de experiencia|logros medibles/i);
    expect(draft).not.toMatch(/DNI|pasaporte|María García|Taller Ejemplo/);
  });

  it('trims user facts and rejects missing profession', () => {
    expect(buildLocalLetter({ profession: '  Técnico  ', tone: 'friendly' }).text).toContain('Técnico');
    expect(() => buildLocalLetter({ profession: '  ', tone: 'formal' })).toThrow('A profession is required');
    expect(localLetterLanguage('ar')).toBe('es');
  });
});
