'use client';

import dynamic from 'next/dynamic';
import { useAppStore } from '@/stores/app-store';
import { NavBar } from './nav-bar';
import { Footer } from './footer';
import { HomeSection } from './home-section';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

function SectionLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="container mx-auto max-w-5xl px-4 py-16 text-center text-sm text-muted-foreground"
    >
      Cargando sección…
    </div>
  );
}

const LearnAISection = dynamic(
  () => import('./learn-ai-section').then((m) => m.LearnAISection),
  { loading: SectionLoading },
);
const CVSection = dynamic(
  () => import('./cv-section').then((m) => m.CVSection),
  { loading: SectionLoading },
);
const OfficeSection = dynamic(
  () => import('./office-section').then((m) => m.OfficeSection),
  { loading: SectionLoading },
);
const ResourcesSection = dynamic(
  () => import('./resources-section').then((m) => m.ResourcesSection),
  { loading: SectionLoading },
);
const RightsSection = dynamic(
  () => import('./rights-section').then((m) => m.RightsSection),
  { loading: SectionLoading },
);
const ContactsSection = dynamic(
  () => import('./contacts-section').then((m) => m.ContactsSection),
  { loading: SectionLoading },
);
const ToolsSection = dynamic(
  () => import('./tools-section').then((m) => m.ToolsSection),
  { loading: SectionLoading },
);
const EventsSection = dynamic(
  () => import('./events-section').then((m) => m.EventsSection),
  { loading: SectionLoading },
);
const CoursesLibrarySection = dynamic(
  () => import('./courses-library-section').then((m) => m.CoursesLibrarySection),
  { loading: SectionLoading },
);
const AIAssistant = dynamic(
  () => import('./ai-assistant').then((m) => m.AIAssistant),
  { ssr: false },
);
const OnboardingWizard = dynamic(
  () => import('./onboarding-wizard').then((m) => m.OnboardingWizard),
  { ssr: false },
);

export function ManosAbiertasApp() {
  const { activeSection, readingMode } = useAppStore();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reading-mode', readingMode);
    }
  }, [readingMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>
      <NavBar />
      <main id="main-content" className="flex-1">
        <div key={activeSection} className="animate-in fade-in duration-150">
          {activeSection === 'home' && <HomeSection />}
          {activeSection === 'learn-ai' && <LearnAISection />}
          {activeSection === 'cv' && <CVSection />}
          {activeSection === 'office' && <OfficeSection />}
          {activeSection === 'resources' && <ResourcesSection />}
          {activeSection === 'rights' && <RightsSection />}
          {activeSection === 'tools' && <ToolsSection />}
          {activeSection === 'events' && <EventsSection />}
          {activeSection === 'courses' && <CoursesLibrarySection />}
          {activeSection === 'contacts' && <ContactsSection />}
        </div>
      </main>
      <Footer />

      {showTop && (
        <div className="fixed bottom-20 right-4 z-30 print:hidden">
          <Button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            size="icon"
            variant="outline"
            className="rounded-full shadow-lg h-11 w-11 bg-card/90 backdrop-blur"
            aria-label="Volver arriba"
          >
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      <AIAssistant />
      <OnboardingWizard />
    </div>
  );
}
