'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { NavBar } from './nav-bar';
import { Footer } from './footer';
import { HomeSection } from './home-section';
import { LearnAISection } from './learn-ai-section';
import { CVSection } from './cv-section';
import { OfficeSection } from './office-section';
import { ResourcesSection } from './resources-section';
import { RightsSection } from './rights-section';
import { ContactsSection } from './contacts-section';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ManosAbiertasApp() {
  const { activeSection } = useAppStore();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'home' && <HomeSection />}
            {activeSection === 'learn-ai' && <LearnAISection />}
            {activeSection === 'cv' && <CVSection />}
            {activeSection === 'office' && <OfficeSection />}
            {activeSection === 'resources' && <ResourcesSection />}
            {activeSection === 'rights' && <RightsSection />}
            {activeSection === 'contacts' && <ContactsSection />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />

      {/* Back to top */}
      {showTop && (
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          size="icon"
          className="fixed bottom-4 right-4 z-30 rounded-full shadow-lg h-10 w-10 print:hidden"
          aria-label="Volver arriba"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
