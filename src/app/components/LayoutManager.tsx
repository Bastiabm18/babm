// app/components/LayoutManager.tsx
'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import InteractiveSideMenu from './InteractiveSideMenu';

interface LayoutManagerProps {
  children: ReactNode;
}

export default function LayoutManager({ children }: LayoutManagerProps) {
  const pathname = usePathname();

  // Esta es la lógica que se ejecutará en CADA cambio de ruta
  const showMainLayout = !pathname.includes('/dashboard');

  return (
    <>
      {/* Renderizado condicional basado en la ruta actual */}
      {showMainLayout && <Header />}
      {showMainLayout && <InteractiveSideMenu />}
      
      <main>{children}</main>
      
      {showMainLayout && <Footer />}
    </>
  );
}