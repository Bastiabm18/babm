'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { IoVideocam, IoPeople, IoSend, IoStopCircle, IoExpand,IoCameraReverse } from 'react-icons/io5';
import { Mensaje } from '@/types/admin';

interface Props {
  modo: 'transmisor' | 'espectador'; // 
  idTransmision: string;
  accionAsegurarSala: (id: string, titulo: string) => Promise<void>;
  accionIniciarVivo: (id: string) => Promise<void>;
  accionRegistrarEspectador: (tid: string, vid: string) => Promise<void>;
  accionGuardarOferta: (tid: string, vid: string, oferta: any) => Promise<void>;
  accionGuardarRespuesta: (tid: string, vid: string, res: any) => Promise<void>;
  accionEnviarMensaje: (id: string, usuario: string, texto: string) => Promise<{ success: boolean }>;
}

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

function extraerSdpPlano(desc: RTCSessionDescriptionInit | null) {
  if (!desc) return null;
  return { type: desc.type, sdp: desc.sdp };
}

export default function ContenedorStreaming({
  modo, // RECIBIR LA PROP
  idTransmision,
  accionAsegurarSala,
  accionIniciarVivo,
  accionRegistrarEspectador,
  accionGuardarOferta,
  accionGuardarRespuesta,
  accionEnviarMensaje
}: Props) {
  const [enVivo, setEnVivo] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputTexto, setInputTexto] = useState('');
  const [estado, setEstado] = useState(modo === 'transmisor' ? 'Esperando accion...' : 'Esperando accion...');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const [viewerId] = useState(() => `v_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const [nombreUsuario] = useState(`User_${Math.floor(Math.random() * 1000)}`);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamLocalRef = useRef<MediaStream | null>(null);
  const peersActivosRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pcEspectadorRef = useRef<RTCPeerConnection | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const supabase = getSupabaseBrowser();
  
  // USAR LA PROP COMO ROL FIJO
  const rol = modo;

  useEffect(() => {
    accionAsegurarSala(idTransmision, "Sala Multiusuario");
  }, []);

  // Fix para pantalla negra del transmisor
  useEffect(() => {
    if (rol === 'transmisor' && enVivo && videoRef.current && streamLocalRef.current) {
      console.log('[TRANSMISOR] Asignando camara al elemento de video');
      videoRef.current.srcObject = streamLocalRef.current;
    }
  }, [enVivo, rol]);

  // Suscripcion al chat
  useEffect(() => {
    if (!enVivo) return;
    const canal = supabase
      .channel(`chat-${idTransmision}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensaje_transmision', filter: `transmision_id=eq.${idTransmision}` }, (payload) => {
        setMensajes(prev => [...prev, payload.new as Mensaje]);
      })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [enVivo]);

  // Logica del TRANSMISOR: Escuchar nuevos espectadores
  useEffect(() => {
    if (rol !== 'transmisor' || !enVivo || !streamLocalRef.current) return;
    
    console.log('[TRANSMISOR] Suscrito a nuevos espectadores');

    const canal = supabase
      .channel(`nuevos-viewers-${idTransmision}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'viewer_answers', filter: `transmision_id=eq.${idTransmision}` }, async (payload) => {
        const nuevoViewerId = payload.new.viewer_id;
        
        if (peersActivosRef.current.has(nuevoViewerId)) return;

        console.log('[TRANSMISOR] Nuevo espectador detectado. Creando oferta para:', nuevoViewerId);
        setEstado(`Conectando a nuevo espectador...`);

        try {
          const pc = new RTCPeerConnection(RTC_CONFIG);
          peersActivosRef.current.set(nuevoViewerId, pc);

          streamLocalRef.current!.getTracks().forEach(track => {
            console.log('[TRANSMISOR] Agregando track:', track.kind);
            pc.addTrack(track, streamLocalRef.current!);
          });

          const oferta = await pc.createOffer();
          await pc.setLocalDescription(oferta);
          console.log('[TRANSMISOR] Oferta local creada. Esperando ICE candidates...');

          const ofertaCompleta = await new Promise<RTCSessionDescriptionInit | null>((resolve) => {
            if (pc.iceGatheringState === 'complete') return resolve(pc.localDescription);
            
            const timeout = setTimeout(() => resolve(pc.localDescription), 4000);
            pc.onicecandidate = (e) => {
              if (e.candidate === null) {
                clearTimeout(timeout);
                console.log('[TRANSMISOR] ICE Gathering completo.');
                resolve(pc.localDescription);
              }
            };
          });

          if (ofertaCompleta) {
            const ofertaPlana = extraerSdpPlano(ofertaCompleta);
            await accionGuardarOferta(idTransmision, nuevoViewerId, ofertaPlana);
            console.log('[TRANSMISOR] Oferta guardada en BD para:', nuevoViewerId);
          }

          pc.oniceconnectionstatechange = () => {
            console.log(`[TRANSMISOR] Estado ICE para ${nuevoViewerId}:`, pc.iceConnectionState);
            if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
              setEstado(`En vivo - ${peersActivosRef.current.size} espectador(es)`);
            }
            if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
              peersActivosRef.current.delete(nuevoViewerId);
              pc.close();
              setEstado(`En vivo - ${peersActivosRef.current.size} espectador(es)`);
            }
          };

        } catch (err) {
          console.error('[TRANSMISOR] Error creando conexion:', err);
          peersActivosRef.current.delete(nuevoViewerId);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'viewer_answers', filter: `transmision_id=eq.${idTransmision}` }, async (payload) => {
        const viewerIdRespuesta = payload.new.viewer_id;
        const respuestaSdp = payload.new.respuesta_sdp;
        
        if (!respuestaSdp) return;
        
        const pc = peersActivosRef.current.get(viewerIdRespuesta);
        if (!pc) return;
        
        if (pc.signalingState === 'have-local-offer') {
          console.log('[TRANSMISOR] Respuesta recibida de:', viewerIdRespuesta);
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(respuestaSdp));
            console.log('[TRANSMISOR] Conexion P2P establecida con:', viewerIdRespuesta);
          } catch (err) {
            console.error('[TRANSMISOR] Error aplicando respuesta:', err);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [rol, enVivo]);

  // Logica del ESPECTADOR: Escuchar la oferta que el transmisor nos dedica
  useEffect(() => {
    if (rol !== 'espectador' || !enVivo) return;

    console.log('[ESPECTADOR] Suscrito a mi canal privado de oferta...');
    setEstado('Esperando transmision... ');

    const canal = supabase
      .channel(`mi-oferta-${viewerId}`)
      .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'viewer_answers', 
          filter: `viewer_id=eq.${viewerId}` 
      }, async (payload) => {
        const ofertaSdp = payload.new.oferta_sdp;
        if (!ofertaSdp || pcEspectadorRef.current) return;

        console.log('[ESPECTADOR] Oferta recibida del transmisor!');
        setEstado('Procesando señal...');

        try {
          const pc = new RTCPeerConnection(RTC_CONFIG);
          pcEspectadorRef.current = pc;

          pc.ontrack = (event) => {
            console.log('[ESPECTADOR] Track remoto recibido!', event.streams[0]);
            if (videoRef.current && event.streams[0]) {
              videoRef.current.srcObject = event.streams[0];
              setEstado('Reproduciendo señal...');
            }
          };

          pc.oniceconnectionstatechange = () => {
            console.log('[ESPECTADOR] Estado ICE:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed') setEstado('Fallo la conexion ICE');
          };

          await pc.setRemoteDescription(new RTCSessionDescription(ofertaSdp));
          const respuesta = await pc.createAnswer();
          await pc.setLocalDescription(respuesta);
          
          console.log('[ESPECTADOR] Respuesta local creada. Esperando ICE...');

          const respuestaCompleta = await new Promise<RTCSessionDescriptionInit | null>((resolve) => {
            if (pc.iceGatheringState === 'complete') return resolve(pc.localDescription);
            const timeout = setTimeout(() => resolve(pc.localDescription), 4000);
            pc.onicecandidate = (e) => {
              if (e.candidate === null) {
                clearTimeout(timeout);
                console.log('[ESPECTADOR] ICE Gathering completo.');
                resolve(pc.localDescription);
              }
            };
          });

          if (respuestaCompleta) {
            const respuestaPlana = extraerSdpPlano(respuestaCompleta);
            await accionGuardarRespuesta(idTransmision, viewerId, respuestaPlana);
            console.log('[ESPECTADOR] Respuesta enviada al transmisor.');
            setEstado('Conexion establecida. Esperando video...');
          }

        } catch (err) {
          console.error('[ESPECTADOR] Error procesando oferta:', err);
          setEstado('Error procesando senal.');
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [rol, enVivo, viewerId]);

  const iniciarTransmision = async () => {
    try {
      setEstado('Solicitando camara...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {facingMode: facingMode}, 
        audio: true 
        });
      streamLocalRef.current = stream;
      
      // No asignamos el srcObject aqui, lo hace el useEffect
      console.log('[TRANSMISOR] Camara obtenida. Iniciando sala...');
      await accionIniciarVivo(idTransmision);

      setEnVivo(true);
      setEstado('En vivo - Esperando espectadores...');
    } catch (err: any) {
      console.error('[TRANSMISOR] Error:', err);
      setEstado(`Error: ${err.message}`);
    }
  };

  const unirseComoEspectador = async () => {
    try {
      setEstado('Registrandome en el servidor...');
      setEnVivo(true);
      
      await accionRegistrarEspectador(idTransmision, viewerId);
      console.log('[ESPECTADOR] Registro enviado. Mi ID es:', viewerId);
    } catch (err: any) {
      console.error('[ESPECTADOR] Error:', err);
      setEstado(`Error: ${err.message}`);
      setEnVivo(false);
    }
  };

  const detener = () => {
    console.log('Deteniendo transmision...');
    if (streamLocalRef.current) {
      streamLocalRef.current.getTracks().forEach(t => t.stop());
      streamLocalRef.current = null;
    }
    
    peersActivosRef.current.forEach(pc => pc.close());
    peersActivosRef.current.clear();

    if (pcEspectadorRef.current) {
      pcEspectadorRef.current.close();
      pcEspectadorRef.current = null;
    }

    if (videoRef.current) videoRef.current.srcObject = null;
    
    setEnVivo(false);
    setEstado(modo === 'transmisor' ? 'Esperando accion...' : 'Esperando accion...');
  };
    const cambiarCamara = async () => {
    if (rol !== 'transmisor' || !streamLocalRef.current) return;

    const nuevoModo = facingMode === 'user' ? 'environment' : 'user';
    setEstado('Cambiando camara...');

    try {
      // 1. Pedir el nuevo stream
      const nuevoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: nuevoModo },
        audio: true
      });

      // 2. Actualizar el video local
      streamLocalRef.current = nuevoStream;
      if (videoRef.current) {
        videoRef.current.srcObject = nuevoStream;
      }

      const nuevoVideoTrack = nuevoStream.getVideoTracks()[0];

      // 3. Reemplazar el track en TODOS los espectadores conectados sin cortarles la conexión
      peersActivosRef.current.forEach((pc, id) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(nuevoVideoTrack);
          console.log(`[TRANSMISOR] Camara reemplazada para espectador: ${id}`);
        }
      });

      // 4. Detener el stream viejo para liberar la cámara anterior
      streamLocalRef.current.getAudioTracks().forEach(t => t.stop()); // paramos el audio viejo
      // Nota: no detenemos el video viejo aqui porque ya lo reemplazamos, 
      // pero para ser limpios buscamos el track viejo y lo paramos.
      
      setFacingMode(nuevoModo);
      setEstado(`En vivo - ${peersActivosRef.current.size} espectador(es)`);
    } catch (err: any) {
      console.error('[TRANSMISOR] Error al cambiar camara:', err);
      setEstado(`Error al cambiar camara: ${err.message}`);
    }
  };

   const togglePantallaCompleta = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error al entrar a pantalla completa:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const enviarMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTexto.trim()) return;
    await accionEnviarMensaje(idTransmision, nombreUsuario, inputTexto);
    setInputTexto('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto rounded-3xl border border-neutral-300 dark:border-neutral-800 bg-background-light dark:bg-background-dark font-goldman transition-colors">
      
      <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl overflow-hidden relative bg-neutral-900 border border-neutral-700">
        
        <div className="p-4 bg-black/60 backdrop-blur-md absolute top-0 left-0 right-0 z-10 flex justify-between items-center border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${enVivo ? 'bg-red-600 animate-pulse' : 'bg-neutral-500'}`} />
            <h2 className="font-bold text-white tracking-wide uppercase text-sm">
              {enVivo ? 'SENAL EN VIVO' : 'STREAMING '}
            </h2>
          </div>
          {enVivo && (
            <span className="text-xs text-neutral-400 font-mono text-right max-w-xs truncate">{estado}</span>
          )}
        </div>
      <div ref={videoContainerRef} className="flex-1 flex items-center justify-center min-h-[450px] bg-black">
          {!enVivo ? (
            <div className="text-center p-8 flex flex-col gap-6 max-w-md z-10">
              <p className="text-neutral-400 text-sm">
                {modo === 'transmisor' ? 'Presiona para iniciar tu camara y transmitir.' : 'Presiona para conectarte a la senal en vivo.'}
              </p>
              <div className="flex gap-4 justify-center">
                {/* UNICO CAMBIO VISUAL: Condicionar los botones a la prop 'modo' */}
                {modo === 'transmisor' && (
                  <button onClick={iniciarTransmision} className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-sm cursor-pointer bg-red-600 hover:bg-red-700 text-white transition-colors">
                    <IoVideocam /> Transmitir
                  </button>
                )}
                {modo === 'espectador' && (
                  <button onClick={unirseComoEspectador} className="flex items-center gap-2 px-6 py-3 font-bold rounded-xl text-sm cursor-pointer bg-neutral-700 hover:bg-neutral-600 text-white transition-colors">
                    <IoPeople /> Ver Señal
                  </button>
                )}
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={rol === 'transmisor'}
              className="w-full h-full object-contain bg-black"
            />
          )}
        </div>

     {/* Botón flotante para girar cámara (solo transmisor y en vivo) */}
        {enVivo && rol === 'transmisor' && (
          <button 
            onClick={cambiarCamara} 
            className="absolute bottom-20 right-4 z-20 p-3 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-full shadow-lg transition-colors cursor-pointer backdrop-blur-sm"
            title="Girar cámara"
          >
            <IoCameraReverse size={20} />
          </button>
        )}

    {/* Botón flotante pantalla completa (solo espectador y en vivo) */}
        {enVivo && rol === 'espectador' && (
          <button 
            onClick={togglePantallaCompleta} 
            className="absolute bottom-20 right-4 z-20 p-3 bg-neutral-800/80 hover:bg-neutral-700 text-white rounded-full shadow-lg transition-colors cursor-pointer backdrop-blur-sm"
            title="Pantalla completa"
          >
            <IoExpand size={20} />
          </button>
        )}

        {enVivo && (
          <div className="p-4 border-t border-neutral-800 flex justify-between items-center bg-black/40">
            <p className="text-xs text-neutral-500 uppercase font-bold">{rol}</p>
            <button onClick={detener} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-500 rounded-lg hover:bg-red-600/30 transition-colors cursor-pointer text-sm font-bold">
              <IoStopCircle size={18} /> Detener
            </button>
          </div>
        )}
      </div>

<div className="flex flex-col h-[550px] rounded-2xl overflow-hidden bg-white/50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800">
  <div className="p-4 border-b border-neutral-300 dark:border-neutral-800 font-bold text-sm tracking-wide text-neutral-700 dark:text-neutral-300 uppercase">
    Chat
  </div>

  <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm relative"
       style={{
         backgroundImage: `url('/babm_new_bg.png')`,
         backgroundSize: '100px',
         backgroundRepeat: 'no-repeat',
         backgroundPosition: 'center',
         
       }}>
    
    {/* Overlay para que los mensajes sean legibles */}
    <div className="absolute inset-0 bg-white/50 dark:bg-neutral-900/70 pointer-events-none"></div>
    
    <div className="relative z-10">
      {mensajes.length === 0 ? (
        <p className="text-neutral-400 text-center italic mt-10 text-xs">Sin mensajes...</p>
      ) : (
        mensajes.map((msg) => (
          <div key={msg.id} className="p-2.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-800/90 border border-neutral-300 dark:border-neutral-700 backdrop-blur-sm">
            <span className="font-bold text-red-500 dark:text-orange-400 text-xs block mb-0.5">{msg.nombre_usuario}</span>
            <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed break-words text-xs">{msg.mensaje}</p>
          </div>
        ))
      )}
    </div>
  </div>

  <form onSubmit={enviarMsg} className="p-3 border-t border-neutral-300 dark:border-neutral-800 flex gap-2 bg-white/80 dark:bg-black/40">
    <input
      type="text"
      placeholder="Mensaje..."
      value={inputTexto}
      onChange={(e) => setInputTexto(e.target.value)}
      className="flex-1 rounded-xl px-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-red-500 text-neutral-900 dark:text-neutral-50"
    />
    <button type="submit" className="p-2.5 text-white rounded-xl transition-colors cursor-pointer bg-red-600 hover:bg-red-700">
      <IoSend size={14} />
    </button>
  </form>
</div>

    </div>
  );
}