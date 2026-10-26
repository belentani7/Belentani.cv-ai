import { z } from 'zod';

export const MAX_CV_FILE_BYTES = 1024 * 1024;
const text = z.string().max(20000);
const row = z.object({ id: z.string().min(1).max(100), position: text, company: text, startDate: text, endDate: text, description: text }).strict();
const education = z.object({ id: z.string().min(1).max(100), title: text, institution: text, year: text, description: text }).strict();
const unique = <T extends { id: string }>(rows: T[]) => new Set(rows.map(row => row.id)).size === rows.length;
const schema = z.object({
  template: z.string().max(100), fullName: text, profession: text, email: text,
  phone: text, address: text, summary: text,
  experiences: z.array(row).max(100).refine(unique),
  education: z.array(education).max(100).refine(unique),
  skills: z.array(text).max(200), languages: z.array(text).max(200),
}).strict();
// Browser autosave may contain only part of a CV while the user is editing.
export const cvDraftSchema = schema.partial().extend({
  savedAt: z.string().datetime().optional(),
});
export type PortableCv = z.infer<typeof schema>;
const fileSchema = z.object({ format: z.literal('belentani-cv-studio'), version: z.literal(1), data: schema }).strict();
function checkSize(value: string) {
  if (new TextEncoder().encode(value).byteLength > MAX_CV_FILE_BYTES) throw new Error('El archivo supera 1 MB.');
}
export function parseCvFile(value: string): PortableCv {
  checkSize(value);
  return fileSchema.parse(JSON.parse(value)).data;
}
export function serializeCvFile(data: PortableCv): string {
  const value = JSON.stringify(fileSchema.parse({ format: 'belentani-cv-studio', version: 1, data }), null, 2);
  checkSize(value);
  return value;
}
