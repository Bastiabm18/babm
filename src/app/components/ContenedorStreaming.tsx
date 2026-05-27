'use client';

import { useEffect, useRef, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client';
import { IoVideocam, IoPeople, IoSend, IoStopCircle } from 'react-icons/io5';
import { Mensaje } from '@/types/admin';

interface ContenedorStreamingProps {
  idTransmision: string;
  accionAsegurarSala: (id: string, titulo: string) => Promise<void>;
  accionActualizarOferta: (id: string, oferta: any) => Promise<void>;
  accionObtenerOferta: (id: string) => Promise<any>;
  accionActualizarRespuesta: (id: string, respuesta: any) => Promise<void>;
  accionEnviarMensaje: (id: string, usuario: string, texto: string) => Promise<{ success: boolean }>;
}

export default function ContenedorStreaming({
  idTransmision,
  accionAsegurarSala,
  accionActualizarOferta,
  accionObtenerOferta,
  accionActualizarRespuesta,
  accionEnviarMensaje
}: ContenedorStreamingProps) {
  const [rol, setRol] = useState<'transmisor' | 'espectador' | null>(null);
  const [enVivo, setEnVivo] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [entradaMensaje, setEntradaMensaje] = useState('');
  const [nombreUsuario] = useState(`Usuario_${Math.floor(Math.random() * 1000)}`);

  const videoLocalRef = useRef<HTMLVideoElement>(null);
  const videoRemotoRef = useRef<HTMLVideoElement>(null);
  const conexionPeer = useRef<RTCPeerConnection | null>(null);
  const flujoLocal = useRef<MediaStream | null>(null);

  const supabase = getSupabaseBrowser();
const configuracionRTC = {
  iceServers: [
    { urls: 'stun:stun.anyfirewall.com:3478' },
    {
      urls: 'turn:turn.anyfirewall.com:3478',
      username: 'anyfirewall', // Credenciales públicas de OpenRelay
      credential: 'anyfirewall'
    }
  ],
};

  // 1. Asegurar la existencia de la sala en Supabase de forma asíncrona al montar
  useEffect(() => {
    accionAsegurarSala(idTransmision, "Transmisión en Vivo - Portafolio");
  }, [idTransmision, accionAsegurarSala]);

  // 2. Controladores en tiempo real (Suscripciones puras)
useEffect(() => {
    const canalChat = supabase
      .channel(`chat-${idTransmision}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensaje_transmision', filter: `transmision_id=eq.${idTransmision}` },
        (payload) => {
          setMensajes((prev) => [...prev, payload.new as Mensaje]);
        }
      )
      .subscribe();

    const canalVideo = supabase
      .channel(`video-${idTransmision}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'transmision_vivo', filter: `id=eq.${idTransmision}` },
        async (payload: any) => {
              console.log(" Cambio detectado en transmision_vivo:", payload.new);
          console.log("Rol actual:", rol);
          console.log("¿Tiene oferta_sdp?", !!payload.new.oferta_sdp);
          console.log("¿Tiene respuesta_sdp?", !!payload.new.respuesta_sdp);
          const pc = conexionPeer.current;

          if (rol === 'espectador' && payload.new.oferta_sdp) {
            if (pc && pc.signalingState !== "stable") {
              return;
            }
            procesarOfertaEntrante(payload.new.oferta_sdp);
          }
          
          if (rol === 'transmisor' && payload.new.respuesta_sdp && pc) {
            if (pc.signalingState === "stable" || pc.remoteDescription !== null) {
              return;
            }
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(payload.new.respuesta_sdp));
            } catch (err) {
              console.error("Error seteando remote description:", err);
            }
          }
        }
      )
      .subscribe();

    return () => {
      canalChat.unsubscribe();
      canalVideo.unsubscribe();
      if (flujoLocal.current) flujoLocal.current.getTracks().forEach(track => track.stop());
    };
  }, [idTransmision, rol, supabase]);
  // --- LÓGICA DEL EMISOR (TRANSMISOR) ---
const iniciarTransmision = async () => {
  setRol('transmisor');
  setEnVivo(true);

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  flujoLocal.current = stream;
  if (videoLocalRef.current) videoLocalRef.current.srcObject = stream;

  const pc = new RTCPeerConnection(configuracionRTC);
  conexionPeer.current = pc;

  // Agregar tracks ANTES de crear oferta
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  pc.ontrack = (event) => {
    console.log(" Transmisor recibió track (esto es normal en peer-to-peer):", event);
  };

  const oferta = await pc.createOffer();
  await pc.setLocalDescription(oferta);
  
  console.log(" Oferta creada:", oferta);
  await accionActualizarOferta(idTransmision, oferta);

  pc.onicecandidate = async (event) => {
    if (event.candidate && pc.localDescription) {
      console.log(" ICE candidate enviado");
      const sdpPlano = JSON.parse(JSON.stringify(pc.localDescription));
      await accionActualizarOferta(idTransmision, sdpPlano);
    }
  };
};

  // --- LÓGICA DEL RECEPTOR (ESPECTADOR) ---
  const unirseTransmision = async () => {
    setRol('espectador');
    setEnVivo(true);

    const ofertaSdp = await accionObtenerOferta(idTransmision);
    if (ofertaSdp) {
      procesarOfertaEntrante(ofertaSdp);
    }
  };

const procesarOfertaEntrante = async (oferta: any) => {
  // Evitar múltiples conexiones
  if (conexionPeer.current && conexionPeer.current.signalingState === "stable") {
    return;
  }

  // Cerrar conexión anterior si existe
  if (conexionPeer.current) {
    conexionPeer.current.close();
  }

  const pc = new RTCPeerConnection(configuracionRTC);
  conexionPeer.current = pc;

  // IMPORTANTE: Configurar ontrack ANTES de setRemoteDescription
  pc.ontrack = (event) => {
    console.log(" Track recibido:", event.streams[0]);
    if (videoRemotoRef.current && event.streams[0]) {
      videoRemotoRef.current.srcObject = event.streams[0];
    }
  };

  // También manejar el caso de que no lleguen streams
  pc.ontrack  = (event) => {
    console.log(" Stream añadido (legacy):", event.stream);
    if (videoRemotoRef.current) {
      videoRemotoRef.current.srcObject = event.stream;
    }
  };

  try {
    await pc.setRemoteDescription(new RTCSessionDescription(oferta));
    const respuesta = await pc.createAnswer();
    await pc.setLocalDescription(respuesta);
    await accionActualizarRespuesta(idTransmision, respuesta);

    pc.onicecandidate = async (event) => {
      if (event.candidate && pc.localDescription && pc.signalingState !== "closed") {
        const sdpPlano = JSON.parse(JSON.stringify(pc.localDescription));
        await accionActualizarRespuesta(idTransmision, sdpPlano);
      }
    };
  } catch (error) {
    console.error("Error procesando oferta:", error);
  }
};
  const manejarEnvioMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entradaMensaje.trim()) return;

    await accionEnviarMensaje(idTransmision, nombreUsuario, entradaMensaje);
    setEntradaMensaje('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto rounded-3xl border border-neutral-300 dark:border-neutral-800 bg-background-light dark:bg-background-dark font-goldman transition-colors">
      
      {/* SECCIÓN DEL VIDEO */}
      <div className="lg:col-span-3 flex flex-col justify-between rounded-2xl overflow-hidden relative bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800">
        
        {/* Encabezado del Video */}
        <div className="p-4 bg-white/40 dark:bg-black/40 backdrop-blur-md absolute top-0 left-0 right-0 z-10 flex justify-between items-center border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className={`h-3 w-3 rounded-full ${enVivo ? 'bg-red-500 animate-pulse' : 'bg-neutral-400'}`} />
            <h2 className="font-bold text-neutral-900 dark:text-neutral-50 tracking-wide uppercase">Señal en Vivo</h2>
          </div>
        </div>

        {/* Pantalla del Reproductor */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          {!enVivo ? (
            <div className="text-center p-8 flex flex-col gap-4 max-w-sm">
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                Selecciona una opción para arrancar el entorno WebRTC de tu portafolio.
              </p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={iniciarTransmision}
                  className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm cursor-pointer bg-primary-light text-white dark:bg-primary-dark"
                >
                  <IoVideocam /> Transmitir
                </button>
                <button 
                  onClick={unirseTransmision}
                  className="flex items-center gap-2 px-5 py-3 font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm cursor-pointer bg-neutral-700 hover:bg-neutral-600 text-white"
                >
                  <IoPeople /> Ver Señal
                </button>
              </div>
            </div>
          ) : (
            <video
              ref={rol === 'transmisor' ? videoLocalRef : videoRemotoRef}
              autoPlay
              playsInline
              muted={rol === 'transmisor'}
              className="w-full h-full object-cover max-h-[550px]"
            />
          )}
        </div>

        {/* Barra inferior de controles */}
        {enVivo && (
          <div className="p-4 border-t border-neutral-300 dark:border-neutral-800 flex justify-between items-center bg-white/20 dark:bg-black/20">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Modo activo: <span className="text-primary-light dark:text-orange-400 font-bold uppercase">{rol}</span>
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="p-2 bg-neutral-300 dark:bg-neutral-800 text-red-500 rounded-lg hover:scale-105 transition-transform cursor-pointer"
            >
              <IoStopCircle size={22} />
            </button>
          </div>
        )}
      </div>

      {/* SECCIÓN DEL CHAT */}
      <div className="flex flex-col h-[550px] rounded-2xl overflow-hidden bg-white/50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800">
        <div className="p-4 border-b border-neutral-300 dark:border-neutral-800 font-bold text-sm tracking-wide text-neutral-700 dark:text-neutral-300 uppercase">
          Chat de la comunidad
        </div>

        {/* Caja de mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
          {mensajes.length === 0 ? (
            <p className="text-neutral-400 dark:text-neutral-500 text-center italic mt-10">Sin mensajes en este momento...</p>
          ) : (
            mensajes.map((msg) => (
              <div key={msg.id} className="p-2.5 rounded-xl bg-neutral-200/50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800">
                <span className="font-bold text-primary-light dark:text-orange-400 text-xs block mb-0.5">{msg.nombre_usuario}</span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed break-words">{msg.mensaje}</p>
              </div>
            ))
          )}
        </div>

        {/* Formulario de envío */}
        <form onSubmit={manejarEnvioMensaje} className="p-3 border-t border-neutral-300 dark:border-neutral-800 flex gap-2 bg-white/80 dark:bg-black/40">
          <input
            type="text"
            placeholder="Escribe algo..."
            value={entradaMensaje}
            onChange={(e) => setEntradaMensaje(e.target.value)}
            className="flex-1 rounded-xl px-3 text-xs bg-neutral-100 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 focus:outline-none focus:border-primary-light text-neutral-900 dark:text-neutral-50"
          />
          <button 
            type="submit"
            className="p-2.5 text-white rounded-xl transition-all active:scale-95 cursor-pointer bg-primary-light dark:bg-primary-dark"
          >
            <IoSend size={14} />
          </button>
        </form>
      </div>

    </div>
  );
}