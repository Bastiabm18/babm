'use server';

import { revalidatePath } from 'next/cache';
// 1. Importamos el cliente de Supabase en vez de Firebase
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { Faq, FaqFormState } from '@/types/admin';

// 2. El tipado se mantiene exactamente igual porque Postgres devuelve el JSONB como un objeto de JS

// --- OBTENER TODAS LAS FAQS ---
export async function getFaqs(): Promise<Faq[]> {
  try {
    const supabase = getSupabaseBrowser();
    
    // Hacemos el select a la tabla de Supabase y ordenamos por fecha descendente
    const { data, error } = await supabase
      .from('pregunta_frecuente')
      .select('*')
      .order('fechaCreacion', { ascending: false });

    if (error) throw error;
    
    // Mapeamos la respuesta para que coincida con nuestra interfaz
    return data.map(faq => ({
      id: faq.id,
      pregunta: faq.pregunta,
      respuesta: faq.respuesta,
      fechaCreacion: faq.fechaCreacion, // Supabase devuelve el timestamp como string ISO
      activo: faq.activo,
    })) as Faq[];
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    throw new Error('No se pudieron obtener las preguntas frecuentes.');
  }
}

// --- CREAR O ACTUALIZAR UNA FAQ ---
export async function createOrUpdateFaq(formData: FormData): Promise<FaqFormState> {
  const supabase = getSupabaseBrowser();
  const faqId = formData.get('faqId') as string | null;

  // 3. Construimos el objeto igual que antes, los FormData no cambian
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
    let result;

    if (faqId) {
      // 4. Si tiene ID, actualizamos en Supabase
      result = await supabase
        .from('pregunta_frecuente')
        .update(rawData)
        .eq('id', faqId)
        .select()
        .single();
    } else {
      // 5. Si no tiene ID, insertamos en Supabase (la fecha la pone Postgres automáticamente)
      result = await supabase
        .from('pregunta_frecuente')
        .insert([rawData])
        .select()
        .single();
    }

    if (result.error) throw result.error;

    const savedFaq: Faq = {
      id: result.data.id,
      pregunta: result.data.pregunta,
      respuesta: result.data.respuesta,
      fechaCreacion: result.data.fechaCreacion,
      activo: result.data.activo,
    };

    revalidatePath('/dashboard/faq');
    return { success: true, message: 'Pregunta guardada con éxito.', faq: savedFaq };
  } catch (error: any) {
    console.error('Error saving FAQ:', error);
    return { success: false, message: error.message || 'Error al guardar la pregunta.' };
  }
}

// --- ELIMINAR UNA FAQ ---
export async function deleteFaq(faqId: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = getSupabaseBrowser();
    
    // 6. Eliminamos por el ID en Supabase
    const { error } = await supabase
      .from('pregunta_frecuente')
      .delete()
      .eq('id', faqId);

    if (error) throw error;

    revalidatePath('/dashboard/faq');
    return { success: true, message: 'Pregunta eliminada.' };
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return { success: false, message: error.message || 'No se pudo eliminar la pregunta.' };
  }
}