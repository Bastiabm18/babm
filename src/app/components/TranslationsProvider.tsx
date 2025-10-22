'use client';

import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { ReactNode } from 'react';
import { initTranslations } from '@/lib/i18n'; // Importa la función que creamos antes

interface Props {
  children: ReactNode;
  locale: string;
  resources: any; // El tipo any es simple, puedes usar Resource de i1next si lo prefieres
}

export default function TranslationsProvider({ children, locale, resources }: Props) {
  const i18n = createInstance();

  // Inicializa en el cliente con los recursos del servidor
  i18n.init({
    lng: locale,
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}