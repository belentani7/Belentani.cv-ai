'use client';

import { Heart, Globe, Shield, ExternalLink } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { getTranslation } from '@/i18n/translations';
import { LANGUAGE_COUNT } from '@/i18n/languages';
import { RESOURCES } from '@/data/resources';

export function Footer() {
  const { language } = useAppStore();
  const t = getTranslation(language);

  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <Heart className="h-4 w-4 text-white fill-white" />
              </div>
              <div>
                <div className="font-bold gradient-text">Manos Abiertas</div>
                <div className="text-[10px] text-muted-foreground">{t.footer_rights}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.footer_madeWith}. {t.footer_disclaimer}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recursos</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-card border border-border p-2.5 text-center">
                <div className="text-lg font-bold text-primary">{LANGUAGE_COUNT}+</div>
                <div className="text-[10px] text-muted-foreground">Idiomas</div>
              </div>
              <div className="rounded-lg bg-card border border-border p-2.5 text-center">
                <div className="text-lg font-bold text-primary">{RESOURCES.length.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">Enlaces</div>
              </div>
              <div className="rounded-lg bg-card border border-border p-2.5 text-center">
                <div className="text-lg font-bold text-primary">100%</div>
                <div className="text-[10px] text-muted-foreground">Gratis</div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Garantías</div>
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] bg-secondary/60 rounded-full px-2 py-1">
                <Globe className="h-3 w-3" /> Fuentes oficiales
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-secondary/60 rounded-full px-2 py-1">
                <Shield className="h-3 w-3" /> Sin registro
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-secondary/60 rounded-full px-2 py-1">
                <Heart className="h-3 w-3" /> Acceso libre
              </span>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3 w-3" /> Proyecto open-source
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div>© 2025 Manos Abiertas · {t.footer_rights}</div>
          <div className="flex items-center gap-1">
            Hecho con <Heart className="h-3 w-3 text-primary fill-primary" /> para la comunidad inmigrante en España
          </div>
        </div>
      </div>
    </footer>
  );
}
