/** Client-side CV draft contract. Personal data is never sent by this module. */
export type CvDraft = {
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experiences: readonly {
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: readonly {
    title: string;
    institution: string;
    year: string;
    description: string;
  }[];
  skills: readonly string[];
  languages: readonly string[];
};

/** Empty placeholders do not count as content: a privacy reset must stay deleted. */
export function hasMeaningfulCvData(data: CvDraft): boolean {
  const fields = [
    data.fullName, data.profession, data.email, data.phone, data.address, data.summary,
    ...data.experiences.flatMap(e => [e.position, e.company, e.startDate, e.endDate, e.description]),
    ...data.education.flatMap(e => [e.title, e.institution, e.year, e.description]),
    ...data.skills, ...data.languages,
  ];
  return fields.some(value => value.trim().length > 0);
}

/**
 * AI assistance is per-click opt-in in the UI. Minimize outgoing data here:
 * do not transmit name, contact details, addresses, local IDs or unneeded rows.
 */
export function buildCvAiPayload(
  field: 'summary' | 'experience', data: CvDraft, language: string,
) {
  const selectedExperience = data.experiences
    .filter(e => e.position.trim() || e.company.trim())
    .map(e => ({
      position: e.position, company: e.company, description: e.description,
      startDate: e.startDate, endDate: e.endDate,
    }));
  if (field === 'experience') {
    return { field, language, experiences: selectedExperience.slice(0, 1) };
  }
  return {
    field, language, profession: data.profession,
    experiences: selectedExperience.slice(0, 10),
    education: data.education
      .filter(e => e.title.trim() || e.institution.trim())
      .slice(0, 5)
      .map(e => ({
        title: e.title, institution: e.institution, year: e.year,
        description: e.description,
      })),
    skills: data.skills.slice(0, 30),
  };
}
