'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Printer,
  Eye,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Languages,
  Palette,
  Loader2,
  Check,
  Lightbulb,
  Save,
  RotateCcw,
  Mail,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { CV_TEMPLATES, CV_GUIDES, ACTION_VERBS, SKILL_SUGGESTIONS } from '@/data/cv-templates';
import { TemplatePreview } from './template-preview';
import { useAppStore } from '@/stores/app-store';
import { getTranslation } from '@/i18n/translations';
import { cn } from '@/lib/utils';
import { clearCvDraft, readCvDraft, saveCvDraft } from '@/lib/cv-storage';
import { parseCvFile, serializeCvFile, MAX_CV_FILE_BYTES } from '@/lib/cv-file';
import { buildCvAiPayload, getCvSaveStatus, hasMeaningfulCvData } from '@/lib/cv-draft-privacy';

const CoverLetterBuilder = dynamic(
  () => import('./cover-letter-builder').then((m) => m.CoverLetterBuilder),
  {
    loading: () => (
      <div role="status" aria-live="polite" className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando constructor de cartas de presentación…
      </div>
    ),
  },
);

const CvOfferAdapter = dynamic(
  () => import('./cv-offer-adapter').then((m) => m.CvOfferAdapter),
  {
    loading: () => (
      <div role="status" aria-live="polite" className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Cargando inspector de adaptación por oferta y lectura ATS…
      </div>
    ),
  },
);

export interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  title: string;
  institution: string;
  year: string;
  description: string;
}

interface StoredCvDraft {
  template?: string;
  fullName?: string;
  profession?: string;
  email?: string;
  phone?: string;
  address?: string;
  summary?: string;
  experiences?: Experience[];
  education?: Education[];
  skills?: string[];
  languages?: string[];
  savedAt?: string;
}

export interface CVSectionProps {
  headingAs?: 'h1' | 'h2';
}

export function CVSection({ headingAs = 'h1' }: CVSectionProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const { language } = useAppStore();
  const t = getTranslation(language);
  const [template, setTemplate] = useState(CV_TEMPLATES[0]);
  const [fullName, setFullName] = useState('');
  const [profession, setProfession] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState('');
  const [experiences, setExperiences] = useState<Experience[]>([
    { id: '1', position: '', company: '', startDate: '', endDate: '', description: '' },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { id: '1', title: '', institution: '', year: '', description: '' },
  ]);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [langInput, setLangInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [aiLoading, setAiLoading] = useState<'summary' | 'experience' | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeTool, setActiveTool] = useState<'cv' | 'ats' | 'letter'>('cv');

  const HeadingTag = headingAs;

  // Autosave to localStorage (debounced via effect)
  useEffect(() => {
    const data = {
      template: template.id,
      fullName,
      profession,
      email,
      phone,
      address,
      summary,
      experiences,
      education,
      skills,
      languages,
    };
    const id = setTimeout(() => {
      if (!hasMeaningfulCvData(data)) {
        clearCvDraft();
        setSavedAt(null);
        return;
      }
      const saved = saveCvDraft(data);
      // A failed write must not display a stale "saved" timestamp.
      setSavedAt(saved);
    }, 800);
    return () => clearTimeout(id);
  }, [template, fullName, profession, email, phone, address, summary, experiences, education, skills, languages]);

  // Load saved CV on mount
  useEffect(() => {
    const data = readCvDraft<StoredCvDraft>();
    if (data) {
      if (data.template) {
        const tpl = CV_TEMPLATES.find((item) => item.id === data.template);
        if (tpl) setTemplate(tpl);
      }
      if (data.fullName) setFullName(data.fullName);
      if (data.profession) setProfession(data.profession);
      if (data.email) setEmail(data.email);
      if (data.phone) setPhone(data.phone);
      if (data.address) setAddress(data.address);
      if (data.summary) setSummary(data.summary);
      if (data.experiences) setExperiences(data.experiences);
      if (data.education) setEducation(data.education);
      if (data.skills?.length) setSkills(data.skills);
      if (data.languages?.length) setLanguages(data.languages);
      if (typeof data.savedAt === 'string') setSavedAt(new Date(data.savedAt));
    }
  }, []);

  const currentDraft = {
    fullName,
    profession,
    email,
    phone,
    address,
    summary,
    experiences,
    education,
    skills,
    languages,
  };
  const hasContent = hasMeaningfulCvData(currentDraft);
  const saveStatus = getCvSaveStatus(savedAt, hasContent);

  function addExperience() {
    setExperiences([
      ...experiences,
      { id: Date.now().toString(), position: '', company: '', startDate: '', endDate: '', description: '' },
    ]);
  }
  function removeExperience(id: string) {
    setExperiences(experiences.filter((e) => e.id !== id));
  }
  function addEducation() {
    setEducation([
      ...education,
      { id: Date.now().toString(), title: '', institution: '', year: '', description: '' },
    ]);
  }
  function removeEducation(id: string) {
    setEducation(education.filter((e) => e.id !== id));
  }
  function addSkill() {
    const clean = skillInput.trim();
    if (clean && !skills.includes(clean)) {
      setSkills([...skills, clean]);
      setSkillInput('');
    }
  }
  function addLanguage() {
    const clean = langInput.trim();
    if (clean && !languages.includes(clean)) {
      setLanguages([...languages, clean]);
      setLangInput('');
    }
  }

  async function generateWithAI(field: 'summary' | 'experience') {
    const targetExperience = experiences.find((e) => e.position.trim() || e.company.trim());
    if (field === 'experience' && !targetExperience) {
      toast.error('Añade un puesto o empresa antes de mejorar la experiencia.');
      return;
    }
    const consent =
      field === 'summary'
        ? 'Se enviarán profesión, experiencias, formación y habilidades a un proveedor de IA externo. Los campos de nombre y contacto se excluyen, pero el texto libre puede contener datos personales: revísalo antes. ¿Autorizas este envío?'
        : 'Se enviará la primera experiencia con puesto o empresa a un proveedor de IA externo. Revisa que su texto no contenga datos personales que no quieras compartir. ¿Autorizas este envío?';
    if (!window.confirm(consent)) return;
    const aiPayload = buildCvAiPayload(field, currentDraft, language);
    setAiLoading(field);
    try {
      const resp = await fetch('/api/cv/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      });
      if (resp.status === 503) {
        toast.error('La generación con IA no está disponible ahora. Puedes seguir editando y guardar tu CV en PDF.');
        return;
      }
      if (!resp.ok) throw new Error('Error en la generación');
      const data = await resp.json();
      if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('Empty AI response');
      if (field === 'summary') {
        setSummary(data.text);
        toast.success('Resumen generado con IA');
      } else {
        setExperiences((prev) =>
          prev.map((e) => (e.id === targetExperience?.id ? { ...e, description: data.text } : e)),
        );
        toast.success('Descripción mejorada con IA');
      }
    } catch {
      toast.error('No se pudo generar. Inténtalo de nuevo.');
    } finally {
      setAiLoading(null);
    }
  }

  function exportEditable() {
    try {
      const content = serializeCvFile({
        template: template.id,
        fullName,
        profession,
        email,
        phone,
        address,
        summary,
        experiences,
        education,
        skills,
        languages,
      });
      const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'belentani-cv.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('No se pudo exportar el CV editable. Revisa el tamaño de los campos.');
    }
  }

  async function importEditable(file: File) {
    setImporting(true);
    try {
      if (file.size > MAX_CV_FILE_BYTES) throw new Error('size');
      const data = parseCvFile(await file.text());
      const selected = CV_TEMPLATES.find((item) => item.id === data.template);
      if (!selected) throw new Error('template');
      if (
        !window.confirm(
          '¿Abrir este CV y sustituir el borrador actual? Descarga antes una copia si quieres conservarlo.',
        )
      )
        return;
      setTemplate(selected);
      setFullName(data.fullName);
      setProfession(data.profession);
      setEmail(data.email);
      setPhone(data.phone);
      setAddress(data.address);
      setSummary(data.summary);
      setExperiences(data.experiences);
      setEducation(data.education);
      setSkills(data.skills);
      setLanguages(data.languages);
      setSavedAt(null);
      toast.success('CV editable recuperado');
    } catch {
      toast.error('Archivo de CV no válido o superior a 1 MB. Tu borrador se conserva.');
    } finally {
      setImporting(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function handlePrint() {
    setShowPreview(true);
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 print:py-0 print:px-0">
      <div className="text-center mb-6 print:hidden">
        <Badge variant="secondary" className="mb-2 gap-1.5">
          <Sparkles className="h-3 w-3" aria-hidden="true" /> Estudio local + IA opcional
        </Badge>
        <HeadingTag className="text-3xl md:text-4xl font-bold mb-2">{t.cv_title}</HeadingTag>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{t.cv_subtitle}</p>

        {/* Tool toggle: CV vs Offer/ATS Adapter vs Cover Letter */}
        <div role="tablist" aria-label="Herramientas del estudio" className="inline-flex flex-wrap justify-center p-1 bg-muted rounded-xl mt-4 gap-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'cv'}
            onClick={() => setActiveTool('cv')}
            className={cn(
              'min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
              activeTool === 'cv' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Currículum
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'ats'}
            onClick={() => setActiveTool('ats')}
            className={cn(
              'min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
              activeTool === 'ats' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Target className="h-3.5 w-3.5" aria-hidden="true" />
            Adaptar a oferta · ATS
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTool === 'letter'}
            onClick={() => setActiveTool('letter')}
            className={cn(
              'min-h-11 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5',
              activeTool === 'letter' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Carta de presentación
          </button>
        </div>
      </div>

      {/* Cover Letter Builder */}
      {activeTool === 'letter' && (
        <div className="max-w-3xl mx-auto">
          <CoverLetterBuilder />
        </div>
      )}

      {/* Job Offer Adaptation & ATS Inspector */}
      {activeTool === 'ats' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <CvOfferAdapter
            draft={currentDraft}
            onAddRealSkill={(skill) => {
              if (!skills.includes(skill)) {
                setSkills([...skills, skill]);
                toast.success(`Competencia añadida: ${skill}`);
              }
            }}
          />
          <div className="hidden lg:block">
            <CVPreview
              template={template}
              fullName={fullName}
              profession={profession}
              email={email}
              phone={phone}
              address={address}
              summary={summary}
              experiences={experiences.filter((e) => e.position || e.company)}
              education={education.filter((e) => e.title || e.institution)}
              skills={skills}
              languages={languages}
              hasContent={hasContent}
            />
          </div>
        </div>
      )}

      {/* CV Builder */}
      {activeTool === 'cv' && (
        <div className="grid lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-0">
          {/* EDITOR */}
          <div className="space-y-4 print:hidden">
            <Tabs defaultValue="personal">
              <TabsList className="grid grid-cols-5 w-full h-auto">
                <TabsTrigger value="personal" className="min-h-11 flex-col gap-0.5 py-2 text-xs">
                  <User className="h-4 w-4" aria-hidden="true" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="experience" className="min-h-11 flex-col gap-0.5 py-2 text-xs">
                  <Briefcase className="h-4 w-4" aria-hidden="true" />
                  Exp.
                </TabsTrigger>
                <TabsTrigger value="education" className="min-h-11 flex-col gap-0.5 py-2 text-xs">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  Edu.
                </TabsTrigger>
                <TabsTrigger value="skills" className="min-h-11 flex-col gap-0.5 py-2 text-xs">
                  <Award className="h-4 w-4" aria-hidden="true" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="design" className="min-h-11 flex-col gap-0.5 py-2 text-xs">
                  <Palette className="h-4 w-4" aria-hidden="true" />
                  Diseño
                </TabsTrigger>
              </TabsList>

              {/* PERSONAL */}
              <TabsContent value="personal" className="space-y-3">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name" className="text-xs">
                          {t.cv_fullName}
                        </Label>
                        <Input
                          id="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="María González"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prof" className="text-xs">
                          {t.cv_profession}
                        </Label>
                        <Input
                          id="prof"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          placeholder="Cuidadora de personas mayores"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-xs">
                          {t.cv_email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="maria@email.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs">
                          {t.cv_phone}
                        </Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+34 600 000 000"
                          className="mt-1"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor="addr" className="text-xs">
                          {t.cv_address}
                        </Label>
                        <Input
                          id="addr"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Madrid, España"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label htmlFor="summary" className="text-xs">
                          {t.cv_summary}
                        </Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => generateWithAI('summary')}
                          disabled={aiLoading === 'summary' || !profession}
                          className="min-h-9 gap-1 text-xs"
                        >
                          {aiLoading === 'summary' ? (
                            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                          ) : (
                            <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                          )}
                          {t.cv_generate}
                        </Button>
                      </div>
                      <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Profesional con experiencia demostrable en atención y coordinación..."
                        className="min-h-[100px] text-sm"
                      />
                      <div className="flex items-center justify-between text-[11px] mt-1">
                        {!profession ? (
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Lightbulb className="h-3 w-3" aria-hidden="true" />
                            Escribe tu profesión para activar la asistencia IA
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            Asistencia IA lista · pulsa «Generar»
                          </span>
                        )}
                        <span
                          className={cn(
                            'tabular-nums',
                            summary.length > 400 ? 'text-amber-300' : 'text-muted-foreground',
                          )}
                        >
                          {summary.length}/500
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* EXPERIENCE */}
              <TabsContent value="experience" className="space-y-3">
                {experiences.map((exp, i) => (
                  <Card key={exp.id}>
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Experiencia {i + 1}
                        </span>
                        {experiences.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar experiencia ${i + 1}`}
                            onClick={() => removeExperience(exp.id)}
                            className="h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Input
                          aria-label={`Puesto en experiencia ${i + 1}`}
                          value={exp.position}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((x) => (x.id === exp.id ? { ...x, position: e.target.value } : x)),
                            )
                          }
                          placeholder="Puesto"
                          className="text-sm h-9"
                        />
                        <Input
                          aria-label={`Empresa en experiencia ${i + 1}`}
                          value={exp.company}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((x) => (x.id === exp.id ? { ...x, company: e.target.value } : x)),
                            )
                          }
                          placeholder="Empresa"
                          className="text-sm h-9"
                        />
                        <Input
                          aria-label={`Fecha de inicio en experiencia ${i + 1}`}
                          value={exp.startDate}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((x) => (x.id === exp.id ? { ...x, startDate: e.target.value } : x)),
                            )
                          }
                          placeholder="Desde (ej: Ene 2022)"
                          className="text-sm h-9"
                        />
                        <Input
                          aria-label={`Fecha de fin en experiencia ${i + 1}`}
                          value={exp.endDate}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((x) => (x.id === exp.id ? { ...x, endDate: e.target.value } : x)),
                            )
                          }
                          placeholder="Hasta (o Actual)"
                          className="text-sm h-9"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor={`exp-desc-${exp.id}`} className="text-xs text-muted-foreground">
                            Descripción
                          </Label>
                          {i === 0 && exp.position && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => generateWithAI('experience')}
                              disabled={aiLoading === 'experience'}
                              className="min-h-9 gap-1 text-xs"
                            >
                              {aiLoading === 'experience' ? (
                                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                              ) : (
                                <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                              )}
                              Mejorar con IA
                            </Button>
                          )}
                        </div>
                        <Textarea
                          id={`exp-desc-${exp.id}`}
                          value={exp.description}
                          onChange={(e) =>
                            setExperiences((prev) =>
                              prev.map((x) => (x.id === exp.id ? { ...x, description: e.target.value } : x)),
                            )
                          }
                          placeholder={"• Tareas realizadas\n• Logros verificables"}
                          className="text-sm min-h-[80px]"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addExperience} className="w-full min-h-11 gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t.cv_addExperience}
                </Button>
              </TabsContent>

              {/* EDUCATION */}
              <TabsContent value="education" className="space-y-3">
                {education.map((ed, i) => (
                  <Card key={ed.id}>
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Educación {i + 1}
                        </span>
                        {education.length > 1 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Eliminar formación ${i + 1}`}
                            onClick={() => removeEducation(ed.id)}
                            className="h-9 w-9"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                      <Input
                        aria-label={`Título académico ${i + 1}`}
                        value={ed.title}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((x) => (x.id === ed.id ? { ...x, title: e.target.value } : x)),
                          )
                        }
                        placeholder="Título (ej: Bachillerato)"
                        className="text-sm h-9"
                      />
                      <Input
                        aria-label={`Institución académica ${i + 1}`}
                        value={ed.institution}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((x) => (x.id === ed.id ? { ...x, institution: e.target.value } : x)),
                          )
                        }
                        placeholder="Institución"
                        className="text-sm h-9"
                      />
                      <Input
                        aria-label={`Año de formación ${i + 1}`}
                        value={ed.year}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((x) => (x.id === ed.id ? { ...x, year: e.target.value } : x)),
                          )
                        }
                        placeholder="Año (ej: 2020)"
                        className="text-sm h-9"
                      />
                      <Textarea
                        aria-label={`Notas de formación ${i + 1}`}
                        value={ed.description}
                        onChange={(e) =>
                          setEducation((prev) =>
                            prev.map((x) => (x.id === ed.id ? { ...x, description: e.target.value } : x)),
                          )
                        }
                        placeholder="Notas, menciones..."
                        className="text-sm min-h-[60px]"
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button type="button" variant="outline" onClick={addEducation} className="w-full min-h-11 gap-1.5">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t.cv_addEducation}
                </Button>
              </TabsContent>

              {/* SKILLS */}
              <TabsContent value="skills" className="space-y-3">
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label htmlFor="cv-skill-input" className="text-xs">
                        {t.cv_skills}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="cv-skill-input"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Ej: Atención al cliente"
                          className="h-9"
                        />
                        <Button type="button" size="icon" onClick={addSkill} aria-label="Añadir habilidad">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {skills.map((s) => (
                            <Badge key={s} variant="secondary" className="gap-1 pr-1">
                              {s}
                              <button
                                type="button"
                                aria-label={`Quitar habilidad ${s}`}
                                onClick={() => setSkills(skills.filter((x) => x !== s))}
                                className="hover:text-destructive p-0.5"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skill suggestions */}
                    <div>
                      <span className="text-xs text-muted-foreground">Sugerencias:</span>
                      <ScrollArea className="h-40 mt-1.5">
                        <div className="space-y-2 pr-2">
                          {SKILL_SUGGESTIONS.slice(0, 5).map((cat) => (
                            <div key={cat.category}>
                              <div className="text-[11px] font-medium text-muted-foreground mb-1">
                                {cat.category}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {cat.skills.slice(0, 6).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => !skills.includes(s) && setSkills([...skills, s])}
                                    className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    + {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <Label htmlFor="cv-lang-input" className="text-xs">
                        {t.cv_languages}
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="cv-lang-input"
                          value={langInput}
                          onChange={(e) => setLangInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                          placeholder="Ej: Español (nativo)"
                          className="h-9"
                        />
                        <Button type="button" size="icon" onClick={addLanguage} aria-label="Añadir idioma">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      {languages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {languages.map((l) => (
                            <Badge key={l} variant="secondary" className="gap-1 pr-1">
                              <Languages className="h-3 w-3" aria-hidden="true" />
                              {l}
                              <button
                                type="button"
                                aria-label={`Quitar idioma ${l}`}
                                onClick={() => setLanguages(languages.filter((x) => x !== l))}
                                className="hover:text-destructive p-0.5"
                              >
                                <Trash2 className="h-3 w-3" aria-hidden="true" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* DESIGN */}
              <TabsContent value="design" className="space-y-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium">{t.cv_template}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setFullName('María González Pérez');
                          setProfession('Cuidadora de personas mayores');
                          setEmail('maria.gonzalez@email.com');
                          setPhone('+34 612 345 678');
                          setAddress('Madrid, España');
                          setSummary(
                            'Cuidadora con 5 años de experiencia en atención a personas mayores. Especializada en demencia, movilidad reducida y acompañamiento médico. Empática, responsable y con formación en primeros auxilios.',
                          );
                          setExperiences([
                            {
                              id: '1',
                              position: 'Cuidadora de personas mayores',
                              company: 'Familia particular',
                              startDate: 'Ene 2022',
                              endDate: 'Actual',
                              description:
                                '• Atención integral a persona mayor con movilidad reducida\n• Administración de medicación y control de constantes\n• Acompañamiento a citas médicas y actividades\n• Preparación de comidas adaptadas a pauta nutricional',
                            },
                            {
                              id: '2',
                              position: 'Auxiliar de ayuda a domicilio',
                              company: 'Cruz Roja Española',
                              startDate: 'Sep 2020',
                              endDate: 'Dic 2021',
                              description:
                                '• Atención domiciliaria a 15 familias\n• Apoyo en tareas cotidianas y acompañamiento\n• Coordinación con equipos de trabajo social',
                            },
                          ]);
                          setEducation([
                            {
                              id: '1',
                              title: 'Certificado de Profesionalidad - Atención Sociosanitaria',
                              institution: 'IFTI Madrid',
                              year: '2020',
                              description: 'Formación profesional acreditada',
                            },
                            {
                              id: '2',
                              title: 'Curso de Primeros Auxilios',
                              institution: 'Cruz Roja',
                              year: '2019',
                              description: '',
                            },
                          ]);
                          setSkills([
                            'Cuidados de personas mayores',
                            'Administración de medicación',
                            'Primeros auxilios',
                            'Movilidad reducida',
                            'Atención al cliente',
                            'Resolución de problemas',
                          ]);
                          setLanguages(['Español (nativo)', 'Inglés (básico)', 'Rumano (nativo)']);
                          toast.success('Datos de ejemplo cargados');
                        }}
                        className="min-h-9 gap-1 text-xs"
                      >
                        <Sparkles className="h-3 w-3 text-primary" aria-hidden="true" />
                        Ver ejemplo
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CV_TEMPLATES.map((tpl) => (
                        <TemplatePreview
                          key={tpl.id}
                          template={tpl}
                          selected={template.id === tpl.id}
                          onSelect={() => setTemplate(tpl)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-400" aria-hidden="true" />
                      Guías y consejos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {CV_GUIDES.slice(0, 5).map((g) => (
                      <details key={g.id} className="group">
                        <summary className="text-xs font-medium cursor-pointer flex items-center gap-1 hover:text-primary py-1">
                          <Plus className="h-3 w-3 group-open:hidden" aria-hidden="true" />
                          <Check className="h-3 w-3 hidden group-open:inline" aria-hidden="true" />
                          {g.title}
                        </summary>
                        <div className="text-xs text-muted-foreground mt-1 pl-4">
                          {g.content.slice(0, 150)}...
                        </div>
                      </details>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="text-xs font-medium mb-2">Verbos de acción para tu CV</div>
                    <ScrollArea className="h-32">
                      <div className="flex flex-wrap gap-1">
                        {ACTION_VERBS.slice(0, 3)
                          .flatMap((c) => c.verbs.slice(0, 6))
                          .map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => {
                                const desc = experiences[0]?.description || '';
                                setExperiences((prev) =>
                                  prev.map((e, i) =>
                                    i === 0 ? { ...e, description: desc + (desc ? ' ' : '') + v } : e,
                                  ),
                                );
                                toast.success(`Añadido: ${v}`);
                              }}
                              className="text-[11px] px-2.5 py-1 rounded-full bg-secondary hover:bg-primary/15 hover:text-primary transition-colors"
                            >
                              {v}
                            </button>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={exportEditable}
                  disabled={!hasContent || importing}
                  className="min-h-11"
                >
                  Guardar CV editable
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInput.current?.click()}
                  disabled={importing || aiLoading !== null}
                  className="min-h-11"
                >
                  {importing ? 'Abriendo…' : 'Abrir CV editable'}
                </Button>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  aria-label="Abrir archivo de CV editable"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void importEditable(file);
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                El archivo contiene tus datos personales. Guárdalo en un lugar seguro. Se procesa en tu navegador.
              </p>
            </div>

            {/* Action bar */}
            <div className="sticky bottom-4 space-y-2">
              {saveStatus && (
                <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground bg-card/90 backdrop-blur px-3 py-2 rounded-lg border border-border">
                  <Save className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                  {saveStatus}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('¿Borrar todos los datos del CV? Esta acción no se puede deshacer.')) {
                        if (!clearCvDraft()) {
                          toast.error(
                            'No se pudo borrar el borrador guardado. Revisa los permisos de almacenamiento del navegador.',
                          );
                          return;
                        }
                        setFullName('');
                        setProfession('');
                        setEmail('');
                        setPhone('');
                        setAddress('');
                        setSummary('');
                        setExperiences([
                          { id: '1', position: '', company: '', startDate: '', endDate: '', description: '' },
                        ]);
                        setEducation([{ id: '1', title: '', institution: '', year: '', description: '' }]);
                        setSkills([]);
                        setLanguages([]);
                        setSkillInput('');
                        setLangInput('');
                        setSavedAt(null);
                        toast.success('CV reiniciado');
                      }
                    }}
                    disabled={aiLoading !== null || importing}
                    className="ml-2 text-destructive hover:underline inline-flex items-center gap-0.5 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    Reiniciar
                  </button>
                </div>
              )}
              <div className="flex gap-2 bg-card/90 backdrop-blur p-2 rounded-xl border border-border shadow-lg">
                <Button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="flex-1 min-h-11 gap-1.5"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  {showPreview ? 'Ocultar' : t.cv_preview}
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  variant="outline"
                  disabled={!hasContent}
                  className="flex-1 min-h-11 gap-1.5"
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                  {t.print}
                </Button>
                <Button
                  type="button"
                  onClick={handlePrint}
                  disabled={!hasContent}
                  className="flex-1 min-h-11 gap-1.5"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t.download}
                </Button>
              </div>
            </div>
          </div>

          {/* PREVIEW */}
          <div className={cn(showPreview ? 'block' : 'hidden lg:block', 'print:block')}>
            <CVPreview
              template={template}
              fullName={fullName}
              profession={profession}
              email={email}
              phone={phone}
              address={address}
              summary={summary}
              experiences={experiences.filter((e) => e.position || e.company)}
              education={education.filter((e) => e.title || e.institution)}
              skills={skills}
              languages={languages}
              hasContent={hasContent}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export interface CVPreviewProps {
  template: (typeof CV_TEMPLATES)[number];
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  languages: string[];
  hasContent: boolean;
}

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'CV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CVPreview({
  template,
  fullName,
  profession,
  email,
  phone,
  address,
  summary,
  experiences,
  education,
  skills,
  languages,
  hasContent,
}: CVPreviewProps) {
  const displayName = fullName || 'Tu Nombre';
  const displayProfession = profession || 'Tu Profesión';
  const isPlaceholderName = !fullName;
  const isPlaceholderProf = !profession;

  const emptyPlaceholder = !hasContent ? (
    <div className="text-center py-14 text-slate-500">
      <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" aria-hidden="true" />
      <p className="text-sm font-medium text-slate-700 mb-1">Tu CV aparecerá aquí</p>
      <p className="text-xs text-slate-500 max-w-xs mx-auto">
        Completa el formulario del editor o carga el ejemplo en la pestaña «Diseño» para previsualizar cada plantilla.
      </p>
    </div>
  ) : null;

  // 1. SIDEBAR LAYOUTS: modern-clean & sidebar-photo
  if (template.id === 'modern-clean' || template.id === 'sidebar-photo') {
    const isMonogram = template.id === 'sidebar-photo';
    const sidebarBg = isMonogram ? 'bg-[#0f766e]' : 'bg-[#065f46]';
    const accentText = isMonogram ? 'text-[#0f766e]' : 'text-[#065f46]';
    const accentBorder = isMonogram ? 'border-[#0f766e]' : 'border-[#065f46]';

    return (
      <article
        aria-label={`Vista previa del CV — plantilla ${template.name}`}
        data-cv-template={template.id}
        className="bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none min-h-[620px] grid sm:grid-cols-[210px_1fr]"
      >
        <aside className={cn(sidebarBg, 'text-white p-6 space-y-5')}>
          {isMonogram && (
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/60 bg-white/15 text-xl font-bold tracking-wider">
              {getInitials(fullName)}
            </div>
          )}
          <div className={cn(isMonogram && 'text-center')}>
            <h2 className="text-xl font-bold leading-tight">{displayName}</h2>
            <p className="mt-1 text-xs text-white/85">{displayProfession}</p>
          </div>
          {(email || phone || address) && (
            <div className="border-t border-white/20 pt-4 space-y-1.5 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-white/80">Contacto</h3>
              {email && <p className="break-all">{email}</p>}
              {phone && <p>{phone}</p>}
              {address && <p>{address}</p>}
            </div>
          )}
          {skills.length > 0 && (
            <div className="border-t border-white/20 pt-4 space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-white/80">Habilidades</h3>
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s} className="rounded bg-white/15 px-2 py-0.5 text-[11px]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {languages.length > 0 && (
            <div className="border-t border-white/20 pt-4 space-y-1">
              <h3 className="font-bold uppercase tracking-wider text-[10px] text-white/80">Idiomas</h3>
              {languages.map((l) => (
                <p key={l} className="text-xs">
                  • {l}
                </p>
              ))}
            </div>
          )}
        </aside>

        <div className="p-7 space-y-5">
          {summary && (
            <section>
              <h3 className={cn('text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2', accentText, accentBorder)}>
                Perfil Profesional
              </h3>
              <p className="text-sm leading-relaxed text-slate-800">{summary}</p>
            </section>
          )}
          {experiences.length > 0 && (
            <section>
              <h3 className={cn('text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2.5', accentText, accentBorder)}>
                Experiencia
              </h3>
              <div className="space-y-3">
                {experiences.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-semibold text-sm">{exp.position || 'Puesto'}</h4>
                      <span className="text-xs text-slate-600 shrink-0">
                        {exp.startDate} - {exp.endDate || 'Actual'}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-1">{exp.company}</div>
                    <p className="text-sm text-slate-700 whitespace-pre-line">{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {education.length > 0 && (
            <section>
              <h3 className={cn('text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2', accentText, accentBorder)}>
                Educación
              </h3>
              <div className="space-y-2">
                {education.map((ed) => (
                  <div key={ed.id}>
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="font-semibold text-sm">{ed.title || 'Título'}</h4>
                      <span className="text-xs text-slate-600">{ed.year}</span>
                    </div>
                    <div className="text-xs text-slate-600">{ed.institution}</div>
                    {ed.description && <p className="text-xs text-slate-700 mt-0.5">{ed.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {emptyPlaceholder}
        </div>
      </article>
    );
  }

  // 2. TWO-COLUMN TECH LAYOUT: two-column-tech
  if (template.id === 'two-column-tech') {
    return (
      <article
        aria-label={`Vista previa del CV — plantilla ${template.name}`}
        data-cv-template={template.id}
        className="bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none min-h-[620px]"
      >
        <div className="h-2 bg-[#9a3412]" />
        <div className="p-7">
          <header className="border-b border-slate-200 pb-4 mb-5">
            <h2 className={cn('text-2xl font-bold tracking-tight', isPlaceholderName && 'text-slate-400')}>
              {displayName}
            </h2>
            <p className={cn('text-sm font-mono font-semibold text-[#9a3412] mt-0.5', isPlaceholderProf && 'text-slate-400')}>
              {displayProfession}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs font-mono text-slate-600">
              {email && <span>{email}</span>}
              {phone && <span>{phone}</span>}
              {address && <span>{address}</span>}
            </div>
          </header>

          {hasContent ? (
            <div className="grid sm:grid-cols-[1.35fr_0.65fr] gap-6">
              <div className="space-y-4">
                {summary && (
                  <section>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a3412] mb-1.5">
                      {'// Perfil'}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-800">{summary}</p>
                  </section>
                )}
                {experiences.length > 0 && (
                  <section>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a3412] mb-2">
                      {'// Experiencia'}
                    </h3>
                    <div className="space-y-3">
                      {experiences.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className="font-semibold text-sm">{exp.position || 'Puesto'}</h4>
                            <span className="text-[11px] font-mono text-slate-600">
                              {exp.startDate} - {exp.endDate || 'Actual'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mb-1">{exp.company}</div>
                          <p className="text-sm text-slate-700 whitespace-pre-line">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              <div className="space-y-4 sm:border-l sm:border-slate-200 sm:pl-5">
                {skills.length > 0 && (
                  <section>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a3412] mb-2">
                      {'// Competencias'}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="rounded bg-orange-50 border border-orange-200 px-2 py-0.5 text-[11px] font-medium text-[#7c2d12]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {education.length > 0 && (
                  <section>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a3412] mb-2">
                      {'// Formación'}
                    </h3>
                    <div className="space-y-2">
                      {education.map((ed) => (
                        <div key={ed.id}>
                          <h4 className="font-semibold text-xs">{ed.title || 'Título'}</h4>
                          <p className="text-[11px] text-slate-600">
                            {ed.institution} {ed.year ? `· ${ed.year}` : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {languages.length > 0 && (
                  <section>
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9a3412] mb-1.5">
                      {'// Idiomas'}
                    </h3>
                    <div className="space-y-1">
                      {languages.map((l) => (
                        <p key={l} className="text-xs text-slate-700">
                          • {l}
                        </p>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          ) : (
            emptyPlaceholder
          )}
        </div>
      </article>
    );
  }

  // 3. SINGLE-COLUMN DISTINCT EDITORIAL VARIANTS:
  // minimal-elegant | creative-vibrant | professional-execute | classic-europass
  const isMinimal = template.id === 'minimal-elegant';
  const isCreative = template.id === 'creative-vibrant';
  const isExecutive = template.id === 'professional-execute';

  return (
    <article
      aria-label={`Vista previa del CV — plantilla ${template.name}`}
      data-cv-template={template.id}
      className="bg-white text-slate-900 shadow-xl rounded-lg overflow-hidden print:shadow-none print:rounded-none min-h-[620px]"
    >
      {isExecutive && <div className="h-2.5 bg-[#3730a3]" />}

      {isCreative ? (
        <header className="bg-[#9d174d] text-white px-8 py-6">
          <h2 className="text-3xl font-extrabold tracking-tight">{displayName}</h2>
          <p className="text-sm text-pink-100 mt-1 font-medium">{displayProfession}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-white/90">
            {email && <span>✉ {email}</span>}
            {phone && <span>☎ {phone}</span>}
            {address && <span>📍 {address}</span>}
          </div>
        </header>
      ) : null}

      <div
        className="p-8"
        style={{ fontFamily: isMinimal || isCreative ? 'var(--font-geist-sans), sans-serif' : 'Georgia, serif' }}
      >
        {!isCreative && (
          <header
            className={cn(
              'pb-4 mb-5',
              isMinimal
                ? 'text-center border-b border-slate-200'
                : isExecutive
                  ? 'border-b-2 border-[#3730a3] bg-indigo-50/60 -mx-8 -mt-8 px-8 pt-6 pb-5 mb-6'
                  : 'border-b-2 border-[#1e40af]',
            )}
          >
            <h2
              className={cn(
                isMinimal
                  ? 'text-2xl font-light uppercase tracking-[0.16em]'
                  : isExecutive
                    ? 'text-2xl font-bold uppercase tracking-wide text-[#312e81]'
                    : 'text-3xl font-bold tracking-tight text-[#1e3a8a]',
                isPlaceholderName && 'text-slate-400',
              )}
            >
              {displayName}
            </h2>
            <p
              className={cn(
                'mt-1',
                isMinimal
                  ? 'text-xs uppercase tracking-[0.22em] text-slate-600'
                  : 'text-base text-slate-700',
                isPlaceholderProf && 'text-slate-400',
              )}
            >
              {displayProfession}
            </p>
            <div
              className={cn(
                'flex flex-wrap gap-3 mt-2 text-xs text-slate-600',
                isMinimal && 'justify-center',
              )}
            >
              {email && <span>✉ {email}</span>}
              {phone && <span>☎ {phone}</span>}
              {address && <span>📍 {address}</span>}
            </div>
          </header>
        )}

        {summary && (
          <section className="mb-4">
            <h3
              className={cn(
                'text-xs font-bold uppercase tracking-wider mb-1.5',
                isMinimal
                  ? 'text-center tracking-[0.2em] text-slate-600'
                  : isCreative
                    ? 'inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[#9d174d]'
                    : isExecutive
                      ? 'rounded bg-indigo-50 px-2.5 py-1 text-[#312e81]'
                      : 'text-[#1e3a8a]',
              )}
            >
              Perfil Profesional
            </h3>
            <p className="text-sm leading-relaxed text-slate-800">{summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="mb-4">
            <h3
              className={cn(
                'text-xs font-bold uppercase tracking-wider mb-2',
                isMinimal
                  ? 'text-center tracking-[0.2em] text-slate-600'
                  : isCreative
                    ? 'inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[#9d174d]'
                    : isExecutive
                      ? 'rounded bg-indigo-50 px-2.5 py-1 text-[#312e81]'
                      : 'text-[#1e3a8a]',
              )}
            >
              Experiencia
            </h3>
            <div className="space-y-3">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="font-semibold text-sm">{exp.position || 'Puesto'}</h4>
                    <span className="text-xs text-slate-600">
                      {exp.startDate} - {exp.endDate || 'Actual'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 italic mb-1">{exp.company}</div>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-4">
            <h3
              className={cn(
                'text-xs font-bold uppercase tracking-wider mb-2',
                isMinimal
                  ? 'text-center tracking-[0.2em] text-slate-600'
                  : isCreative
                    ? 'inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[#9d174d]'
                    : isExecutive
                      ? 'rounded bg-indigo-50 px-2.5 py-1 text-[#312e81]'
                      : 'text-[#1e3a8a]',
              )}
            >
              Educación
            </h3>
            <div className="space-y-2">
              {education.map((ed) => (
                <div key={ed.id}>
                  <div className="flex justify-between items-baseline gap-2">
                    <h4 className="font-semibold text-sm">{ed.title || 'Título'}</h4>
                    <span className="text-xs text-slate-600">{ed.year}</span>
                  </div>
                  <div className="text-xs text-slate-600 italic">{ed.institution}</div>
                  {ed.description && <p className="text-xs text-slate-700 mt-0.5">{ed.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section className="mb-4">
            <h3
              className={cn(
                'text-xs font-bold uppercase tracking-wider mb-2',
                isMinimal
                  ? 'text-center tracking-[0.2em] text-slate-600'
                  : isCreative
                    ? 'inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[#9d174d]'
                    : isExecutive
                      ? 'rounded bg-indigo-50 px-2.5 py-1 text-[#312e81]'
                      : 'text-[#1e3a8a]',
              )}
            >
              Habilidades
            </h3>
            <div className={cn('flex flex-wrap gap-1.5', isMinimal && 'justify-center')}>
              {skills.map((s) => (
                <span
                  key={s}
                  className={cn(
                    'text-xs px-2.5 py-0.5 rounded',
                    isCreative
                      ? 'bg-[#9d174d] text-white font-medium'
                      : 'border border-slate-300 bg-slate-50 text-slate-800',
                  )}
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section>
            <h3
              className={cn(
                'text-xs font-bold uppercase tracking-wider mb-2',
                isMinimal
                  ? 'text-center tracking-[0.2em] text-slate-600'
                  : isCreative
                    ? 'inline-block rounded-full bg-pink-100 px-3 py-0.5 text-[#9d174d]'
                    : isExecutive
                      ? 'rounded bg-indigo-50 px-2.5 py-1 text-[#312e81]'
                      : 'text-[#1e3a8a]',
              )}
            >
              Idiomas
            </h3>
            <div className={cn('flex flex-wrap gap-2', isMinimal && 'justify-center')}>
              {languages.map((l) => (
                <span key={l} className="text-xs text-slate-800">
                  • {l}
                </span>
              ))}
            </div>
          </section>
        )}

        {emptyPlaceholder}
      </div>
    </article>
  );
}
