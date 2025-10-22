'use client'; // Necesario para que Framer Motion funcione en Next.js App Router

import { motion } from 'framer-motion';

const NeonSign = () => {
  // --- Estilos para el efecto Neón ---
  // Usamos textShadow para crear el resplandor.
  // La sintaxis es: [desplazamiento-x] [desplazamiento-y] [desenfoque] [color]
  // Combinamos un resplandor interior blanco y uno exterior amarillo para un efecto más realista.
  const neonEffect = {
    color: '#D8B4FE', // Color del texto base (blanco para que el brillo destaque)
    textShadow: `
      0 0 7px #9127F5,
      0 0 10px #fff,
      0 0 21px #9127F5,
      0 0 42px #8B49C9,
      0 0 82px #D39154,
      0 0 92px #662B9E,
      0 0 102px #762ABD,
      0 0 151px #9127F5
    `,
  };

  return (
    <motion.div
      className=" " // Aumenté el tamaño para que se vea mejor
      style={neonEffect}
      // --- Animación de Parpadeo ---
      // Animamos la opacidad para simular un parpadeo o una conexión inestable.
      animate={{
        opacity: [1, 0.1, 0.95, 0.25, 1, 0.9, 1, 0.8, 1,1,0.9,0.99, 1, 0.9, 1, 0.8, 1,1,0.9,0.99,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Secuencia de opacidades
      }}
      transition={{
        duration: 10,           // Duración total de una secuencia de parpadeo
        repeat: Infinity,      // Repetir la animación para siempre
        repeatType: 'loop',    // Tipo de repetición
        ease: 'easeInOut',     // Suaviza el cambio entre opacidades
      }}
    >
      <a href='/' className="bg-cover font-extrabold text-2xl md:text-3xl tracking-wider font-caveat bg-clip-text">
        Babm.cl
      </a>
    </motion.div>
  );
};

export default NeonSign;