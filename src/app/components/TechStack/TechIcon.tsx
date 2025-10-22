// /components/TechStack/TechIcon.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Sparks = () => (
  <>
    {Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-secondary-dark"
        style={{ boxShadow: "0 0 8px 1px #D8B4FE" }}
        initial={{ y: 0, x: 0, scale: 0.5 }}
        animate={{
          y: [0, -Math.random() * 40 - 20, 50],
          x: (Math.random() - 0.5) * 80,
          scale: Math.random() * 1,
          opacity: [1, 0.8, 0],
        }}
        transition={{
          duration: Math.random() * 0.5 + 0.7,
          ease: ["easeOut", "easeIn"],
        }}
      />
    ))}
  </>
);

interface TechIconProps {
  name: string;
  IconComponent: React.ElementType;
  color: string;
}

const TechIcon: React.FC<TechIconProps> = ({ name, IconComponent, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex flex-col items-center gap-2 p-4 rounded-lg transition-colors duration-300 hover:bg-white/10"
    >
      <div className="relative">
        <IconComponent className={`w-12 h-12 transition-colors duration-300 ${isHovered ? color : 'text-gray-600 dark:text-gray-300'}`} />
        <AnimatePresence>
          {isHovered && <Sparks />}
        </AnimatePresence>
      </div>
      <p className="font-semibold text-sm text-center text-gray-600 dark:text-gray-400">{name}</p>
    </motion.div>
  );
};

export default TechIcon;
