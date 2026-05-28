'use client';
import { useTranslation } from 'react-i18next';

import { 
  asegurarSala, 
  iniciarEstadoVivo, 
  registrarEspectador, 
  guardarOfertaParaEspectador, 
  guardarRespuestaEspectador, 
  enviarMensaje
} from '../../../components/actions/actions';
import ContenedorStreaming from '../../../components/ContenedorStreaming';



export default function LiveContent() {
  const idSalaPruebas = "11111111-1111-1111-1111-111111111111";
  const { t } = useTranslation();
  return (
    <div className="min-w-[80vw] max-w-[90vw] overflow-x-hidden h-full items-center justify-center  bg-background-light dark:bg-background-dark">

      <section className='flex items-center justify-center'>
<ContenedorStreaming
  modo="transmisor"
  idTransmision={idSalaPruebas} 
  accionAsegurarSala={asegurarSala}
  accionIniciarVivo={iniciarEstadoVivo}
  accionRegistrarEspectador={registrarEspectador}
  accionGuardarOferta={guardarOfertaParaEspectador}
  accionGuardarRespuesta={guardarRespuestaEspectador}
  accionEnviarMensaje={enviarMensaje}
/>
        </section>
    </div>
  );
}