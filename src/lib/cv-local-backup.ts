import { z } from 'zod';

/**
 * Local-only, versioned backup of a CV draft.
 * Backups contain personal information: never upload or log this payload.
 */
export const MAX_CV_BACKUP_BYTES = 512 * 1024;

const experienceSchema = z.object({
  id: z.string().max(128),
  position: z.string().max(500),
  company: z.string().max(500),
  startDate: z.string().max(100),
  endDate: z.string().max(100),
  description: z.string().max(50_000),
}).strict();

const educationSchema = z.object({
  id: z.string().max(128),
  title: z.string().max(500),
  institution: z.string().max(500),
  year: z.string().max(100),
  description: z.string().max(50_000),
}).strict();

const cvDocumentSchema = z.object({
  template: z.string().min(1).max(100),
  fullName: z.string().max(500),
  profession: z.string().max(500),
  email: z.string().max(500),
  phone: z.string().max(500),
  address: z.string().max(500),
  summary: z.string().max(50_000),
  experiences: z.array(experienceSchema).max(100),
  education: z.array(educationSchema).max(100),
  skills: z.array(z.string().max(1000)).max(200),
  languages: z.array(z.string().max(1000)).max(200),
}).strict();

const cvBackupSchema = z.object({
  kind: z.literal('belentani-cv-studio'),
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  document: cvDocumentSchema,
}).strict();

export type CvDocument = z.infer<typeof cvDocumentSchema>;

function byteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

/** Creates a portable JSON document without sending CV data anywhere. */
export function createCvBackup(document: CvDocument, now = new Date()): string {
  const serialized = JSON.stringify(
    cvBackupSchema.parse({
      kind: 'belentani-cv-studio',
      version: 1,
      exportedAt: now.toISOString(),
      document,
    }),
    null,
    2,
  );
  if (byteLength(serialized) > MAX_CV_BACKUP_BYTES) {
    throw new Error('Tu CV supera el tamaño máximo permitido para una copia local.');
  }
  return serialized;
}

/** Rejects oversized, corrupted, incompatible or extra-field backups before importing. */
export function parseCvBackup(contents: string): CvDocument {
  if (byteLength(contents) > MAX_CV_BACKUP_BYTES) {
    throw new Error('La copia supera el tamaño máximo permitido.');
  }
  try {
    const parsed: unknown = JSON.parse(contents);
    return cvBackupSchema.parse(parsed).document;
  } catch {
    throw new Error('La copia no es válida o pertenece a una versión incompatible.');
  }
}
