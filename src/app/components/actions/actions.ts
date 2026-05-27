'use server';

import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { revalidatePath } from 'next/cache';

// --- ASEGURAR QUE LA SALA EXISTA AL CARGAR ---
export async function obtenerOCrearTransmision(transmisionId: string, titulo: string): Promise<void> {
  try {
    const supabase = getSupabaseBrowser();
    
    const { data } = await supabase
      .from('transmision_vivo')
      .select('id')
      .eq('id', transmisionId)
      .single();

    if (!data) {
      const { error } = await supabase
        .from('transmision_vivo')
        .insert([{ id: transmisionId, titulo, estado: 'desconectado' }]);
        
      if (error) throw error;
    }
  } catch (error) {
    console.error('Error al asegurar la sala de transmisión:', error);
    throw new Error('No se pudo inicializar la sala en el servidor.');
  }
}

// --- ACTUALIZAR LA OFERTA SDP (STREAMER) ---
export async function actualizarOfertaSDP(transmisionId: string, oferta: any): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('transmision_vivo')
    .update({ oferta_sdp: oferta, estado: 'en_vivo' })
    .eq('id', transmisionId);

  if (error) {
    console.error('Error al guardar oferta SDP:', error);
    throw error;
  }
}

// --- OBTENER OFERTA SDP ACTUAL (ESPECTADOR) ---
export async function obtenerOfertaSDP(transmisionId: string): Promise<any> {
  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('transmision_vivo')
    .select('oferta_sdp')
    .eq('id', transmisionId)
    .single();

  if (error) {
    console.error('Error al obtener oferta SDP:', error);
    throw error;
  }
  return data?.oferta_sdp;
}

// --- ACTUALIZAR LA RESPUESTA SDP (ESPECTADOR) ---
export async function actualizarRespuestaSDP(transmisionId: string, respuesta: any): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { error } = await supabase
    .from('transmision_vivo')
    .update({ respuesta_sdp: respuesta })
    .eq('id', transmisionId);

  if (error) {
    console.error('Error al guardar respuesta SDP:', error);
    throw error;
  }
}

// --- ENVIAR MENSAJE AL CHAT ---
export async function enviarMensajeChat(transmisionId: string, usuario: string, texto: string): Promise<{ success: boolean }> {
  const supabase = getSupabaseBrowser();
  try {
    const { error } = await supabase
      .from('mensaje_transmision')
      .insert([{ transmision_id: transmisionId, nombre_usuario: usuario, mensaje: texto }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error en Server Action enviarMensajeChat:', error);
    return { success: false };
  }
}