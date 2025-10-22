// app/layout.tsx
import { Inter } from 'next/font/google';
import { Alfa_Slab_One,Caveat, Bangers,Goldman } from 'next/font/google';
import '../globals.css';
import { ReactNode } from 'react';
import type { Metadata } from 'next';
import { initTranslations } from '@/lib/i18n';
import TranslationsProvider from '../components/TranslationsProvider';
import { AuthProvider } from '@/context/AuthContext';
import LayoutManager from '../components/LayoutManager'; // 1. Importa el nuevo componente

const inter = Inter({ subsets: ['latin'] });
const alfaSlabOne = Alfa_Slab_One({ subsets: ['latin'], weight: ['400'] });
const bangers = Bangers({ subsets: ['latin'], weight: ['400'] });
const caveat = Caveat({ subsets: ['latin'], weight: ['400'] });
const goldman = Goldman({ subsets: ['latin'], weight: ['400'] });

interface RootLayoutProps {
  children: ReactNode;
  params: { lang: string };
}
export const metadata: Metadata = {
  title: "BABM Web Development",
  description: "Developed by BABM",
  icons: {
    icon: "/icon.ico",
  },
};

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { resources } = await initTranslations(params.lang);

  return (
    <html lang={params.lang} className="dark">
      <body className={`${alfaSlabOne.className} ${bangers.className} ${inter.className} ${goldman.className} `}>
        <TranslationsProvider locale={params.lang} resources={resources}>
          <AuthProvider>
            {/* 2. Usa LayoutManager para que maneje la lógica de la UI */}
            <LayoutManager>
              {children}
            </LayoutManager>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}