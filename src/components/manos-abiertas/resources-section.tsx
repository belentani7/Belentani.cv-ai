'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Filter, Database, Tag, MapPin, Star, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RESOURCES, RESOURCE_CATEGORIES, REGIONS, searchResources, type Resource, type ResourceCategory, type ResourceRegion } from '@/data/resources';
import { useAppStore } from '@/stores/app-store';
import { getTranslation } from '@/i18n/translations';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 24;

export function ResourcesSection() {
  const { language } = useAppStore();
  const t = getTranslation(language);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ResourceCategory | 'all'>('all');
  const [region, setRegion] = useState<ResourceRegion | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    return searchResources(query, { category, region });
  }, [query, category, region]);

  const visibleResults = results.slice(0, visibleCount);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    RESOURCES.forEach((r) => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return counts;
  }, []);

  function toggleFavorite(id: string) {
    const next = new Set(favorites);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setFavorites(next);
  }

  function resetFilters() {
    setQuery('');
    setCategory('all');
    setRegion('all');
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="text-center mb-6">
        <Badge variant="secondary" className="mb-2 gap-1.5">
          <Database className="h-3 w-3" />
          {RESOURCES.length.toLocaleString()} {t.resources_total}
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{t.resources_title}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{t.resources_subtitle}</p>
      </div>

      {/* Search & filters */}
      <Card className="mb-5 border-border/60 sticky top-16 z-30 glass">
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder={t.search_placeholder}
                className="pl-9 h-10"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Select value={category} onValueChange={(v) => { setCategory(v as ResourceCategory | 'all'); setVisibleCount(PAGE_SIZE); }}>
              <SelectTrigger className="w-full sm:w-48 h-10">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder={t.resources_filterCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {RESOURCE_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label} ({categoryCounts[c.value] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={(v) => { setRegion(v as ResourceRegion | 'all'); setVisibleCount(PAGE_SIZE); }}>
              <SelectTrigger className="w-full sm:w-44 h-10">
                <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder={t.resources_filterRegion} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda España</SelectItem>
                {REGIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {results.length.toLocaleString()} resultado{results.length !== 1 ? 's' : ''}
              {(category !== 'all' || region !== 'all' || query) && (
                <button onClick={resetFilters} className="ml-2 text-primary hover:underline">Limpiar filtros</button>
              )}
            </span>
            {favorites.size > 0 && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {favorites.size} favorito{favorites.size !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results grid */}
      {visibleResults.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Database className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t.noResults}</p>
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-3">Ver todos los recursos</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleResults.map((resource, i) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isFavorite={favorites.has(resource.id)}
                onToggleFavorite={() => toggleFavorite(resource.id)}
                index={i}
              />
            ))}
          </div>

          {visibleCount < results.length && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
                variant="outline"
                className="gap-2"
              >
                Cargar más ({results.length - visibleCount} restantes)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ResourceCard({ resource, isFavorite, onToggleFavorite, index }: { resource: Resource; isFavorite: boolean; onToggleFavorite: () => void; index: number }) {
  const cat = RESOURCE_CATEGORIES.find((c) => c.value === resource.category);
  const reg = REGIONS.find((r) => r.value === resource.region);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.4) }}
    >
      <Card className="card-hover border-border/60 hover:border-primary/40 h-full overflow-hidden group">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{cat?.icon}</span>
              <Badge variant="outline" className="text-[10px] py-0">{cat?.label}</Badge>
            </div>
            <button
              onClick={onToggleFavorite}
              className={cn('text-muted-foreground hover:text-amber-400 transition-colors', isFavorite && 'text-amber-400')}
              aria-label="Favorito"
            >
              <Star className={cn('h-4 w-4', isFavorite && 'fill-amber-400')} />
            </button>
          </div>

          <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2">{resource.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{resource.description}</p>

          <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px]">
            {reg && (
              <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {reg.label}
              </span>
            )}
            {resource.free && (
              <Badge variant="secondary" className="text-[9px] py-0 h-4">Gratis</Badge>
            )}
          </div>

          <div className="text-[10px] text-muted-foreground mb-2 truncate flex items-center gap-1">
            <Tag className="h-2.5 w-2.5" />
            {resource.source}
          </div>

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto inline-flex items-center justify-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors py-1.5 px-2 rounded-md bg-primary/5 hover:bg-primary/10"
          >
            <ExternalLink className="h-3 w-3" />
            Abrir recurso
          </a>
        </CardContent>
      </Card>
    </motion.div>
  );
}
