import type { Metadata } from 'next';
import { ManosAbiertasApp } from '@/components/manos-abiertas/manos-abiertas-app';

export const metadata: Metadata = {
  title: 'Manos Abiertas · Educación, IA y currículum',
  description: 'Accede a los recursos educativos y al espacio de apoyo de Manos Abiertas.',
  robots: { index: false, follow: true },
};

export default function ManosAbiertasPage() {
  return <ManosAbiertasApp />;
}
