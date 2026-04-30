'use server';

// 1. Usamos tu patrón de Supabase
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';

// Tipado para el contenido multilingüe
type MultilangContent = {
  en: string;
  es: string;
  de: string;
  zh: string;
};

// Tipado para la data pública de una FAQ
export interface PublicFaq {
  id: string;
  pregunta: MultilangContent;
  respuesta: MultilangContent;
}

/**
 * Obtiene todas las preguntas frecuentes que están marcadas como 'activas'.
 * @returns Una promesa que resuelve a un array de FAQs públicas.
 */
export async function getPublicFaqs(): Promise<PublicFaq[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    // 2. Hacemos la consulta a Supabase
    // .select() solo le pedimos los campos que necesita el público (optimización)
    // .eq() es el equivalente al where('activo', '==', true) de Firebase
    const { data, error } = await supabase
      .from('pregunta_frecuente')
      .select('id, pregunta, respuesta')
      .eq('activo', true)
      .order('fechaCreacion', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }

    // 3. Mapeamos la respuesta. 
    // Supabase ya devuelve pregunta y respuesta como objetos JS, así que no hay que transformar nada.
    return data.map(faq => ({
      id: faq.id,
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
    }));
    
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    // En caso de error, devolvemos un array vacío para no romper la página.
    return [];
  }
}