'use server';

import { getSupabaseAdmin } from '@/lib/supabase/supabase-admin';

export async function asegurarSala(id: string, titulo: string) {
  const client = getSupabaseAdmin();
  const { data } = await client.from('transmision_vivo').select('id').eq('id', id).single();
  if (!data) {
    await client.from('transmision_vivo').insert([{ id, titulo, estado: 'desconectado' }]);
  }
}

export async function iniciarEstadoVivo(id: string) {
  const client = getSupabaseAdmin();
  await client.from('transmision_vivo').update({ estado: 'en_vivo' }).eq('id', id);
  await client.from('viewer_answers').delete().eq('transmision_id', id);
}

export async function registrarEspectador(transmisionId: string, viewerId: string) {
  const client = getSupabaseAdmin();
  console.log(`[SERVER] Registrando solicitud de espectador: ${viewerId}`);
  const { error } = await client
    .from('viewer_answers')
    .insert([{ transmision_id: transmisionId, viewer_id: viewerId, oferta_sdp: null, respuesta_sdp: null }]);
  if (error) console.error('[SERVER] Error registrando espectador:', error);
}

export async function guardarOfertaParaEspectador(transmisionId: string, viewerId: string, oferta: any) {
  const client = getSupabaseAdmin();
  console.log(`[SERVER] Guardando oferta para espectador: ${viewerId}`);
  const { error } = await client
    .from('viewer_answers')
    .update({ oferta_sdp: oferta })
    .eq('transmision_id', transmisionId)
    .eq('viewer_id', viewerId);
  if (error) console.error('[SERVER] Error guardando oferta:', error);
}

export async function guardarRespuestaEspectador(transmisionId: string, viewerId: string, respuesta: any) {
  const client = getSupabaseAdmin();
  console.log(`[SERVER] Guardando respuesta de espectador: ${viewerId}`);
  const { error } = await client
    .from('viewer_answers')
    .update({ respuesta_sdp: respuesta })
    .eq('transmision_id', transmisionId)
    .eq('viewer_id', viewerId);
  if (error) console.error('[SERVER] Error guardando respuesta:', error);
}

export async function enviarMensaje(transmisionId: string, usuario: string, texto: string) {
  const client = getSupabaseAdmin();
  const { error } = await client
    .from('mensaje_transmision')
    .insert([{ transmision_id: transmisionId, nombre_usuario: usuario, mensaje: texto }]);
  return { success: !error };
}