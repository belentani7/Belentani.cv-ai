/**
 * Comprobaciones humanas antes de enviar una candidatura.
 * La lista no afirma compatibilidad ATS ni analiza ficheros personales.
 */
export const cvReviewChecks = [
  {
    id: "contacto",
    group: "Identidad",
    title: "Datos de contacto correctos",
    detail: "Verifica teléfono, correo profesional y ciudad. No incluyas DNI, dirección exacta ni otros datos innecesarios.",
  },
  {
    id: "puesto",
    group: "Adaptación",
    title: "Puesto y propuesta de valor claros",
    detail: "El titular explica qué aportas al puesto al que te presentas, sin atribuirte experiencia que no tienes.",
  },
  {
    id: "resultados",
    group: "Contenido",
    title: "Experiencia explicada con hechos",
    detail: "Describe responsabilidades y resultados verificables. Usa cifras únicamente cuando puedas justificarlas.",
  },
  {
    id: "fechas",
    group: "Contenido",
    title: "Fechas y trayectoria coherentes",
    detail: "Revisa puestos, periodos, formación y posibles solapamientos. Explica las transiciones cuando sea útil.",
  },
  {
    id: "competencias",
    group: "Adaptación",
    title: "Competencias vinculadas a la oferta",
    detail: "Utiliza términos relevantes de la vacante de forma natural y solo cuando describan habilidades reales.",
  },
  {
    id: "lectura",
    group: "Presentación",
    title: "Se lee bien en pantalla y papel",
    detail: "Comprueba tamaño de letra, contraste, orden de lectura y que el contenido esencial no dependa de iconos.",
  },
  {
    id: "estructura",
    group: "Presentación",
    title: "Encabezados y secciones reconocibles",
    detail: "Usa encabezados claros: experiencia, formación, competencias e idiomas. Evita tablas complejas si dificultan la lectura.",
  },
  {
    id: "ortografia",
    group: "Calidad",
    title: "Revisión lingüística final",
    detail: "Lee el documento en voz alta. Comprueba acentos, concordancia, nombres propios, cargos y enlaces.",
  },
  {
    id: "enlaces",
    group: "Calidad",
    title: "Enlaces comprobados",
    detail: "Abre los enlaces al portafolio o perfil profesional y confirma que no llevan a errores ni contenido privado.",
  },
  {
    id: "privacidad",
    group: "Privacidad",
    title: "Información personal mínima",
    detail: "Elimina datos sensibles y referencias de terceros que no sean necesarias para esta candidatura.",
  },
  {
    id: "archivo",
    group: "Entrega",
    title: "Archivo exportado y abierto",
    detail: "Abre la copia final en otro lector, comprueba páginas cortadas y usa un nombre de archivo profesional y descriptivo.",
  },
  {
    id: "destinatario",
    group: "Entrega",
    title: "Oferta y destinatario confirmados",
    detail: "Verifica empresa, puesto, idioma, formato solicitado, adjunto correcto y canal de envío.",
  },
] as const;

export type CvReviewId = (typeof cvReviewChecks)[number]["id"];

export const cvReviewGroups = [
  "Identidad",
  "Adaptación",
  "Contenido",
  "Presentación",
  "Calidad",
  "Privacidad",
  "Entrega",
] as const;

export function cvReviewProgress(completed: readonly string[]): number {
  const ids = new Set(cvReviewChecks.map((check) => check.id));
  return new Set(completed.filter((id) => ids.has(id as CvReviewId))).size;
}
