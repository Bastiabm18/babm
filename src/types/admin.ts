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


export interface PostImage {
  url: string;
  path: string;
}

export interface Post {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  contenido?: string; 
  fecha: string; // Se guarda como string ISO desde el frontend
  imagenes: PostImage[];
}

export interface FormState {
  success: boolean;
  message: string;
  post?: Post; // Opcional porque al eliminar no devuelve el post
}