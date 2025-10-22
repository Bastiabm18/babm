// components/ServiceCard.tsx
import { motion } from 'framer-motion';

interface ServiceCardProps {
  serviceName: string;
  servicePrice: number;
  isSelected: boolean;
  onSelect: () => void;
}

const cardVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05, y: -5, transition: { type: 'spring', stiffness: 400, damping: 15 } },
  tap: { scale: 0.98 }
};

const ServiceCard: React.FC<ServiceCardProps> = ({ serviceName, servicePrice, isSelected, onSelect }) => {
  // Clases base para la tarjeta
  const baseClasses = "cursor-pointer p-4 border-2 rounded-lg text-center transition-all duration-200";

  // Clases condicionales basadas en si la tarjeta está seleccionada o no
  const conditionalClasses = isSelected
    // ESTADO SELECCIONADO: Como lo pediste
    ? 'bg-gray-600 dark:bg-gray-400 border-transparent shadow-lg' 
    // ESTADO NORMAL: Sin cambios
    : 'bg-slate-50/50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500'; 

  return (
    <motion.div
      onClick={onSelect}
      className={`${baseClasses} ${conditionalClasses}`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={{ scale: isSelected ? 1.02 : 1 }}
    >
      {/* El color del texto ahora se invierte para ser legible sobre los nuevos fondos */}
      <h3 className={`font-semibold text-lg transition-colors ${isSelected 
        ? 'text-white dark:text-gray-900' 
        : 'text-slate-600 dark:text-slate-300'
      }`}>
        {serviceName}
      </h3>
      
      {/* El color del precio también se invierte */}
      <p className={`font-bold mt-2 text-lg transition-colors ${isSelected 
        ? 'text-gray-300 dark:text-gray-700' 
        : 'text-slate-500 dark:text-slate-400'
      }`}>
        {servicePrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
      </p>
    </motion.div>
  );
};

export default ServiceCard;