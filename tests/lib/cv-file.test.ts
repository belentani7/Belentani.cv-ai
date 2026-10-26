import { parseCvFile, serializeCvFile, MAX_CV_FILE_BYTES, type PortableCv } from '@/lib/cv-file';

const draft: PortableCv = {
  template: 'modern-clean', fullName: 'Ana Silva', profession: 'Developer',
  email: 'ana@example.test', phone: '', address: '', summary: 'Accessible interfaces',
  experiences: [{ id: '1', position: 'Dev', company: 'Example', startDate: 'Ene 2022', endDate: 'Actual', description: 'Built tools' }],
  education: [{ id: '1', title: 'Engineering', institution: 'Example', year: '', description: '' }],
  skills: ['TypeScript'], languages: ['Português (nativo)'],
};

describe('portable CV files', () => {
  it('round-trips every editable field including incomplete rows and human dates', () => {
    expect(parseCvFile(serializeCvFile(draft))).toEqual(draft);
  });

  it('preserves Unicode and treats HTML as plain document text', () => {
    const cv = { ...draft, fullName: '李 <script>alert(1)</script>', summary: 'أهلاً 👋' };
    expect(parseCvFile(serializeCvFile(cv))).toEqual(cv);
  });

  it.each(['not json', 'null', '{}', '{"format":"another-app","version":1,"data":{}}'])('rejects invalid file %s', (text) => {
    expect(() => parseCvFile(text)).toThrow();
  });

  it('rejects future versions rather than corrupting a draft', () => {
    const file = JSON.parse(serializeCvFile(draft));
    file.version = 2;
    expect(() => parseCvFile(JSON.stringify(file))).toThrow();
  });

  it('rejects an entire file with invalid nested data', () => {
    const file = JSON.parse(serializeCvFile(draft));
    file.data.experiences[0].description = { script: 'unexpected' };
    expect(() => parseCvFile(JSON.stringify(file))).toThrow();
  });

  it('rejects extra fields rather than importing arbitrary properties', () => {
    const file = JSON.parse(serializeCvFile(draft));
    file.data.apiKey = 'not-a-credential';
    expect(() => parseCvFile(JSON.stringify(file))).toThrow();
  });

  it('rejects duplicate row IDs which would break editor updates', () => {
    const file = JSON.parse(serializeCvFile(draft));
    file.data.experiences.push(file.data.experiences[0]);
    expect(() => parseCvFile(JSON.stringify(file))).toThrow();
  });

  it('bounds UTF-8 bytes, not only JavaScript string length', () => {
    expect(() => parseCvFile('é'.repeat(MAX_CV_FILE_BYTES / 2 + 1))).toThrow();
  });

  it('rejects excessive arrays on import and export without silently truncating', () => {
    const data = { ...draft, skills: Array(201).fill('skill') };
    expect(() => serializeCvFile(data)).toThrow();
    expect(() => parseCvFile(JSON.stringify({ format: 'belentani-cv-studio', version: 1, data }))).toThrow();
  });
});
