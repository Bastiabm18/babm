export type MultilangContent = {
  en: string;
  es: string;
  de: string;
  zh: string;
};

export interface Faq {
  id: string;
  pregunta: MultilangContent;
  respuesta: MultilangContent;
  fechaCreacion: string;
  activo: boolean;
}

export interface FaqFormState {
  success: boolean;
  message: string;
  faq?: Faq;
}
