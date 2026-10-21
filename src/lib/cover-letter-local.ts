/** Deterministic, offline-first cover-letter drafts. No personal data leaves the browser. */
export type LetterTone = 'formal' | 'friendly' | 'direct';
export type LetterInput = {
  fullName?: string;
  profession: string;
  companyName?: string;
  jobTitle?: string;
  experience?: string;
  skills?: readonly string[];
  tone: LetterTone;
};

export type LetterLanguage = 'es' | 'en' | 'pt-BR' | 'ca' | 'fr';

export function localLetterLanguage(language: string): LetterLanguage {
  if (language === 'en' || language === 'pt-BR' || language === 'ca' || language === 'fr') return language;
  return 'es';
}

function clean(value?: string): string {
  return (value || '').replace(/\s+/g, ' ').trim().slice(0, 2000);
}

function sentence(value: string): string {
  if (!value) return '';
  return /[.!?。]$/.test(value) ? value : value + '.';
}

type Translations = {
  addressee: (company: string) => string;
  openings: Record<LetterTone, (profession: string, role: string) => string>;
  experience: (value: string) => string;
  skills: (value: string) => string;
  invitation: string;
  closing: Record<LetterTone, string>;
};

const texts: Record<LetterLanguage, Translations> = {
  es: {
    addressee: c => c ? 'Al equipo de selección de ' + c + ':' : 'Al equipo de selección:',
    openings: {
      formal: (p, r) => 'Me dirijo a ustedes para presentar mi candidatura al puesto de ' + r + '. Mi perfil profesional es ' + p + '.',
      friendly: (p, r) => 'Me gustaría conversar sobre la oportunidad de ' + r + '. Trabajo en el ámbito de ' + p + '.',
      direct: (p, r) => 'Presento mi candidatura para ' + r + '. Perfil: ' + p + '.',
    },
    experience: v => 'Experiencia que puedo aportar: ' + sentence(v),
    skills: v => 'Competencias que deseo destacar: ' + sentence(v),
    invitation: 'Quedo a su disposición para ampliar estos datos y explicar cómo podría contribuir al puesto.',
    closing: { formal: 'Atentamente,', friendly: 'Un cordial saludo,', direct: 'Saludos,' },
  },
  en: {
    addressee: c => c ? 'To the recruitment team at ' + c + ':' : 'To the recruitment team:',
    openings: {
      formal: (p, r) => 'I am writing to apply for the role of ' + r + '. My professional field is ' + p + '.',
      friendly: (p, r) => 'I would welcome a conversation about the ' + r + ' opportunity. I work in ' + p + '.',
      direct: (p, r) => 'I am applying for ' + r + '. Professional background: ' + p + '.',
    },
    experience: v => 'Relevant experience I can describe: ' + sentence(v),
    skills: v => 'Skills I would like to highlight: ' + sentence(v),
    invitation: 'I would be glad to discuss the information above and how I could contribute to the role.',
    closing: { formal: 'Sincerely,', friendly: 'Kind regards,', direct: 'Regards,' },
  },
  'pt-BR': {
    addressee: c => c ? 'À equipe de recrutamento da ' + c + ':' : 'À equipe de recrutamento:',
    openings: {
      formal: (p, r) => 'Escrevo para me candidatar à vaga de ' + r + '. Minha área profissional é ' + p + '.',
      friendly: (p, r) => 'Gostaria de conversar sobre a oportunidade de ' + r + '. Atuo na área de ' + p + '.',
      direct: (p, r) => 'Apresento minha candidatura para ' + r + '. Perfil profissional: ' + p + '.',
    },
    experience: v => 'Experiência relevante que posso apresentar: ' + sentence(v),
    skills: v => 'Competências que desejo destacar: ' + sentence(v),
    invitation: 'Fico à disposição para detalhar as informações e conversar sobre como posso contribuir.',
    closing: { formal: 'Atenciosamente,', friendly: 'Um cordial abraço,', direct: 'Saudações,' },
  },
  ca: {
    addressee: c => c ? 'A l’equip de selecció de ' + c + ':' : 'A l’equip de selecció:',
    openings: {
      formal: (p, r) => 'Us escric per presentar la meva candidatura al lloc de ' + r + '. El meu àmbit professional és ' + p + '.',
      friendly: (p, r) => 'M’agradaria parlar de l’oportunitat de ' + r + '. Treballo en l’àmbit de ' + p + '.',
      direct: (p, r) => 'Presento la meva candidatura a ' + r + '. Perfil: ' + p + '.',
    },
    experience: v => 'Experiència que puc aportar: ' + sentence(v),
    skills: v => 'Competències que vull destacar: ' + sentence(v),
    invitation: 'Resto a la vostra disposició per ampliar aquesta informació i explicar com podria contribuir.',
    closing: { formal: 'Atentament,', friendly: 'Una salutació cordial,', direct: 'Salutacions,' },
  },
  fr: {
    addressee: c => c ? 'À l’équipe de recrutement de ' + c + ' :' : 'À l’équipe de recrutement :',
    openings: {
      formal: (p, r) => 'Je vous présente ma candidature au poste de ' + r + '. Mon domaine professionnel est ' + p + '.',
      friendly: (p, r) => 'Je souhaiterais échanger au sujet du poste de ' + r + '. Je travaille dans le domaine de ' + p + '.',
      direct: (p, r) => 'Je candidate au poste de ' + r + '. Profil : ' + p + '.',
    },
    experience: v => 'Expérience que je peux présenter : ' + sentence(v),
    skills: v => 'Compétences que je souhaite mettre en avant : ' + sentence(v),
    invitation: 'Je reste disponible pour préciser ces informations et expliquer ma contribution possible au poste.',
    closing: { formal: 'Cordialement,', friendly: 'Bien à vous,', direct: 'Salutations,' },
  },
};

export function buildLocalLetter(input: LetterInput, language = 'es'): { text: string; languageUsed: LetterLanguage } {
  const profession = clean(input.profession);
  if (!profession) throw new Error('A profession is required');
  const role = clean(input.jobTitle) || profession;
  const company = clean(input.companyName);
  const experience = clean(input.experience);
  const skills = (input.skills || []).map(clean).filter(Boolean).slice(0, 20).join(', ');
  const name = clean(input.fullName);
  const tone: LetterTone = ['formal', 'friendly', 'direct'].includes(input.tone) ? input.tone : 'formal';
  const languageUsed = localLetterLanguage(language);
  const copy = texts[languageUsed];

  const paragraphs = [
    copy.addressee(company),
    copy.openings[tone](profession, role),
    experience ? copy.experience(experience) : '',
    skills ? copy.skills(skills) : '',
    copy.invitation,
    copy.closing[tone] + (name ? '\n' + name : ''),
  ].filter(Boolean);

  return { text: paragraphs.join('\n\n'), languageUsed };
}
