'use server';

import { revalidatePath } from 'next/cache';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Tipado para el contenido multilingüe
type MultilangContent = {
  en: string;
  es: string;
  de: string;
  zh: string;
};

// 1. Define el tipado para una Pregunta Frecuente (FAQ) con estructura multilingüe
export interface Faq {
  id: string;
  pregunta: MultilangContent;
  respuesta: MultilangContent;
  fechaCreacion: string;
  activo: boolean;
}

// Interfaz para el estado del formulario que se devolverá
export interface FaqFormState {
  success: boolean;
  message: string;
  faq?: Faq;
}

// --- FUNCIÓN PARA OBTENER TODAS LAS PREGUNTAS FRECUENTES ---
export async function getFaqs(): Promise<Faq[]> {
  try {
    const { firestore } = getAdminInstances();
    const faqsSnapshot = await firestore.collection('frec_question').orderBy('fechaCreacion', 'desc').get();
    
    if (faqsSnapshot.empty) {
      return [];
    }

    return faqsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        pregunta: data.pregunta,
        respuesta: data.respuesta,
        fechaCreacion: new Date(data.fechaCreacion.seconds * 1000).toISOString(),
        activo: data.activo,
      };
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw new Error('No se pudieron obtener las preguntas frecuentes.');
  }
}

// --- FUNCIÓN PARA CREAR O ACTUALIZAR UNA PREGUNTA FRECUENTE ---
export async function createOrUpdateFaq(formData: FormData): Promise<FaqFormState> {
  const { firestore } = getAdminInstances();
  const faqId = formData.get('faqId') as string | null;

  // Construye los objetos multilingües desde el FormData
  const rawData = {
    pregunta: {
      en: formData.get('pregunta_en') as string,
      es: formData.get('pregunta_es') as string,
      de: formData.get('pregunta_de') as string,
      zh: formData.get('pregunta_zh') as string,
    },
    respuesta: {
      en: formData.get('respuesta_en') as string,
      es: formData.get('respuesta_es') as string,
      de: formData.get('respuesta_de') as string,
      zh: formData.get('respuesta_zh') as string,
    },
    activo: formData.get('activo') === 'on',
  };

  try {
    let savedFaqId = faqId;

    if (faqId) {
      const faqRef = firestore.collection('frec_question').doc(faqId);
      await faqRef.update(rawData);
    } else {
      const newFaqRef = await firestore.collection('frec_question').add({
        ...rawData,
        fechaCreacion: FieldValue.serverTimestamp(),
      });
      savedFaqId = newFaqRef.id;
    }

    const finalDoc = await firestore.collection('frec_question').doc(savedFaqId!).get();
    const finalData = finalDoc.data()!;
    const savedFaq: Faq = {
      id: finalDoc.id,
      pregunta: finalData.pregunta,
      respuesta: finalData.respuesta,
      fechaCreacion: new Date(finalData.fechaCreacion.seconds * 1000).toISOString(),
      activo: finalData.activo,
    };

    revalidatePath('/dashboard/faq');
    return { success: true, message: 'Pregunta guardada con éxito.', faq: savedFaq };
  } catch (error) {
    console.error('Error saving FAQ:', error);
    return { success: false, message: 'Error al guardar la pregunta.' };
  }
}

// --- FUNCIÓN PARA ELIMINAR UNA PREGUNTA FRECUENTE ---
export async function deleteFaq(faqId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { firestore } = getAdminInstances();
    await firestore.collection('frec_question').doc(faqId).delete();

    revalidatePath('/dashboard/faq');
    return { success: true, message: 'Pregunta eliminada.' };
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return { success: false, message: 'No se pudo eliminar la pregunta.' };
  }
}
