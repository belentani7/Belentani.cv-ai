import type { CvDraft } from "@/lib/cv-draft-privacy";

export interface AtsReadabilityCheck {
  id:
    | "contact-complete"
    | "dni-privacy"
    | "summary-length"
    | "experience-evidence"
    | "skills-populated"
    | "dates-present";
  label: string;
  passed: boolean;
  advice: string;
}

export interface CvOfferAnalysis {
  offerProvided: boolean;
  totalOfferKeywords: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchPercentage: number;
  atsChecks: AtsReadabilityCheck[];
  passedChecksCount: number;
}

const STOPWORDS = new Set([
  // Español
  "para", "con", "por", "como", "una", "uno", "unos", "unas", "del", "las", "los", "que",
  "mas", "pero", "sus", "este", "esta", "estos", "estas", "ese", "esa", "entre", "desde",
  "hasta", "sobre", "tras", "durante", "mediante", "segun", "sin", "hacia", "donde", "cuando",
  "quien", "cual", "todo", "toda", "todos", "todas", "otro", "otra", "otros", "otras", "mismo",
  "misma", "muy", "bien", "tambien", "ademas", "asi", "solo", "cada", "tanto", "como", "ser",
  "estar", "tener", "hacer", "poder", "deber", "haber", "nuestro", "nuestra", "nuestros",
  "nuestras", "empresa", "empresas", "buscamos", "busca", "oferta", "ofertas", "puesto",
  "vacante", "empleo", "trabajo", "trabajar", "incorporacion", "inmediata", "jornada",
  "completa", "parcial", "contrato", "indefinido", "temporal", "salario", "sueldo", "bruto",
  "anual", "mensual", "requisitos", "requisito", "funciones", "funcion", "tareas", "valorara",
  "valorable", "imprescindible", "minima", "minimo", "anos", "ano", "experiencia", "persona",
  "personas", "perfil", "candidato", "candidata", "candidatura", "equipo", "sector", "zona",
  "nivel", "alto", "media", "medio", "buen", "buena", "capacidad", "ganas", "formacion",
  "ofrecemos", "ofrece", "responsabilidades", "horario", "turnos", "turno", "lunes", "viernes",
  // Inglés / Internacional
  "the", "and", "for", "with", "that", "this", "from", "your", "have", "will", "are", "you",
  "our", "who", "what", "where", "when", "why", "how", "all", "any", "can", "able", "must",
  "should", "would", "could", "role", "position", "company", "team", "work", "working",
  "experience", "years", "year", "requirements", "required", "responsibilities", "skills",
  "looking", "join", "full", "time", "part", "salary", "benefits", "plus", "preferred",
  "strong", "good", "excellent", "ability", "knowledge", "using", "across", "within", "into",
  // Catalán / Portugués comunes
  "amb", "per", "dels", "les", "una", "empresa", "feina", "requisits", "funcions",
  "para", "com", "uma", "vaga", "trabalho", "requisitos",
]);

const COMPOUND_TERMS = [
  "atencion al cliente",
  "primeros auxilios",
  "gestion de equipos",
  "trabajo en equipo",
  "resolucion de problemas",
  "control de stock",
  "control de calidad",
  "administracion de medicacion",
  "movilidad reducida",
  "ayuda a domicilio",
  "atencion sociosanitaria",
  "microsoft excel",
  "microsoft word",
  "power bi",
  "google workspace",
  "google sheets",
  "redes sociales",
  "marketing digital",
  "comercio electronico",
  "recursos humanos",
  "prevencion de riesgos",
  "carnet de conducir",
  "manipulador de alimentos",
  "soporte tecnico",
  "base de datos",
  "bases de datos",
  "aprendizaje automatico",
  "inteligencia artificial",
  "project management",
  "customer service",
  "data analysis",
  "machine learning",
  "ci/cd",
  "node.js",
  "next.js",
];

const DNI_NIE_PATTERN = /\b(?:\d{8}[A-HJ-NP-TV-Z]|[XYZ]\d{7}[A-HJ-NP-TV-Z])\b/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeForMatch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extrae términos profesionales relevantes de una oferta de empleo de forma determinista,
 * descartando palabras vacías y muletillas habituales de portales de empleo.
 */
export function extractOfferKeywords(offerText: string, maxKeywords = 18): string[] {
  const normalized = normalizeForMatch(offerText);
  if (!normalized) return [];

  const found: Map<string, number> = new Map();

  for (const phrase of COMPOUND_TERMS) {
    if (normalized.includes(phrase)) {
      found.set(phrase, (found.get(phrase) ?? 0) + 3);
    }
  }

  const tokens = normalized.split(" ");
  for (const rawToken of tokens) {
    const token = rawToken.replace(/^[./-]+|[./-]+$/g, "");
    if (token.length < 3) continue;
    if (/^\d+$/.test(token)) continue;
    if (STOPWORDS.has(token)) continue;
    // Evita duplicar palabras sueltas si ya forman parte de un término compuesto detectado
    const coveredByCompound = [...found.keys()].some(
      (k) => k.includes(" ") && k.split(" ").includes(token),
    );
    if (coveredByCompound) continue;
    found.set(token, (found.get(token) ?? 0) + 1);
  }

  return [...found.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxKeywords)
    .map(([term]) => term);
}

function buildCvCorpus(cv: CvDraft): string {
  return normalizeForMatch(
    [
      cv.profession,
      cv.summary,
      ...cv.skills,
      ...cv.languages,
      ...cv.experiences.flatMap((exp) => [exp.position, exp.company, exp.description]),
      ...cv.education.flatMap((ed) => [ed.title, ed.institution, ed.description]),
    ].join(" "),
  );
}

/**
 * Analiza localmente el borrador de CV frente al texto de una vacante y ejecuta
 * comprobaciones honestas de estructura/legibilidad ATS sin enviar datos a terceros
 * ni inventar experiencia.
 */
export function analyzeCvForOffer(cv: CvDraft, offerText: string): CvOfferAnalysis {
  const keywords = extractOfferKeywords(offerText);
  const corpus = buildCvCorpus(cv);
  const corpusTokens = new Set(corpus.split(" ").filter(Boolean));

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of keywords) {
    const isMatch = keyword.includes(" ")
      ? corpus.includes(keyword)
      : corpusTokens.has(keyword) || corpus.includes(keyword);
    if (isMatch) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const matchPercentage =
    keywords.length > 0 ? Math.round((matchedKeywords.length / keywords.length) * 100) : 0;

  const rawTextForPrivacy = [
    cv.fullName,
    cv.address,
    cv.summary,
    ...cv.experiences.map((e) => e.description),
  ].join(" ");

  const activeExperiences = cv.experiences.filter(
    (e) => e.position.trim().length > 0 || e.company.trim().length > 0,
  );

  const hasValidContact =
    EMAIL_PATTERN.test(cv.email.trim()) &&
    cv.phone.trim().length >= 7 &&
    cv.address.trim().length >= 2;

  const hasNoDni = !DNI_NIE_PATTERN.test(rawTextForPrivacy);

  const summaryLen = cv.summary.trim().length;
  const summaryOptimal = summaryLen >= 100 && summaryLen <= 500;

  const hasDetailedExperience = activeExperiences.some(
    (e) =>
      e.position.trim().length >= 2 &&
      e.company.trim().length >= 2 &&
      e.description.trim().length >= 40,
  );

  const hasDatesOnExperiences =
    activeExperiences.length > 0 &&
    activeExperiences.every(
      (e) => e.startDate.trim().length >= 3 && e.endDate.trim().length >= 2,
    );

  const atsChecks: AtsReadabilityCheck[] = [
    {
      id: "contact-complete",
      label: "Contacto verificable (correo, teléfono y ciudad)",
      passed: hasValidContact,
      advice: hasValidContact
        ? "Datos de contacto completos y reconocibles."
        : "Añade correo válido, teléfono y ciudad o provincia.",
    },
    {
      id: "dni-privacy",
      label: "Minimización de datos sensibles (sin DNI/NIE)",
      passed: hasNoDni,
      advice: hasNoDni
        ? "No se detectan números de documento innecesarios."
        : "Evita incluir DNI o NIE en el CV salvo que la convocatoria pública lo exija.",
    },
    {
      id: "summary-length",
      label: "Perfil profesional claro (100–500 caracteres)",
      passed: summaryOptimal,
      advice: summaryOptimal
        ? `Longitud adecuada (${summaryLen} caracteres).`
        : "Redacta un resumen de 2 a 4 frases (100–500 caracteres) alineado con el puesto.",
    },
    {
      id: "experience-evidence",
      label: "Experiencia descrita con responsabilidades reales",
      passed: hasDetailedExperience,
      advice: hasDetailedExperience
        ? "Puesto, organización y tareas descritas con detalle legible."
        : "Detalla al menos una experiencia con cargo, entidad y viñetas de tareas reales.",
    },
    {
      id: "dates-present",
      label: "Cronología explícita en cada experiencia",
      passed: hasDatesOnExperiences,
      advice: hasDatesOnExperiences
        ? "Todas las experiencias activas incluyen periodo de inicio y fin."
        : "Indica fechas claras (por ejemplo, «Ene 2022 - Actual») en cada puesto.",
    },
    {
      id: "skills-populated",
      label: "Sección de competencias poblada (mínimo 4)",
      passed: cv.skills.length >= 4,
      advice:
        cv.skills.length >= 4
          ? `${cv.skills.length} competencias estructuradas para lectura rápida.`
          : "Añade al menos 4 habilidades reales vinculadas a tu oficio.",
    },
  ];

  const passedChecksCount = atsChecks.filter((c) => c.passed).length;

  return {
    offerProvided: keywords.length > 0,
    totalOfferKeywords: keywords.length,
    matchedKeywords,
    missingKeywords,
    matchPercentage,
    atsChecks,
    passedChecksCount,
  };
}
