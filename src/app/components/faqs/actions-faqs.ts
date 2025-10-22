'use server';

import { getAdminInstances } from '@/lib/firebase/firebase-admin';

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
    const { firestore } = getAdminInstances();
    
    // Hacemos una consulta para traer solo los documentos donde 'activo' es true
    const faqsSnapshot = await firestore
      .collection('frec_question')
      .where('activo', '==', true)
      .orderBy('fechaCreacion', 'desc')
      .get();
    
    if (faqsSnapshot.empty) {
      return [];
    }

    // Mapeamos los documentos al formato que nuestro componente necesita
    return faqsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pregunta: data.pregunta,
        respuesta: data.respuesta,
      };
    });
  } catch (error) {
    console.error('Error fetching public FAQs:', error);
    // En caso de error, devolvemos un array vacío para no romper la página.
    return [];
  }
}
