// /components/TechStack/TechStack.tsx

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { technologies } from './tech-data';
import TechIcon from './TechIcon';
import { FaDog, FaArrowRight } from 'react-icons/fa';

// --- INICIO: Componente para las chispas ---
const Sparks = () => {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-secondary-dark"
          style={{
            boxShadow: "0 0 10px 2px #D8B4FE",
          }}
          initial={{ 
            y: 0,
            x: 0,
            scale: 0.5,
          }}
          animate={{
            y: [0, -Math.random() * 60 - 30, 100],
            x: (Math.random() - 0.5) * 120,
            scale: Math.random() * 1.2,
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 0.6 + 0.8,
            ease: ["easeOut", "easeIn"],
          }}
        />
      ))}
    </>
  );
};
// --- FIN: Componente para las chispas ---

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const TechStack = () => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="w-full py-20 px-4 sm:px-8 bg-primary-light/90  dark:bg-gray-900 ">
      <div className="max-w-[90vw] mx-auto text-center">
        <motion.h2 
          className="text-4xl sm:text-5xl font-bold text-gray-200 dark:text-gray-300 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {t('tech_title')}
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-400 mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('tech_subtitle')}
        </motion.p>

        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-y-4 gap-x-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {technologies.map((tech) => (
            <TechIcon key={tech.name} {...tech} />
          ))}
        </motion.div>

        <motion.div 
          className="mt-20 pt-10 border-t border-gray-600/50 dark:border-gray-700/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
            {t('tech_current_work_title')}
          </h3>
          <span className='flex flex-row items-center justify-center'>
            <a target='_blank'  href='https://grupojcs.cl/' className='text-gray-200 dark:text-gray-300 hover:text-secondary-dark dark:hover:text-secondary-dark transition-colors duration-300 text-3xl'>
              GRUPO JCS
            </a>
            <br></br>
            <br></br>
            <br></br>
       
          </span>      
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('tech_current_work_desc')}
          </p>
        </motion.div>

        {/* --- INICIO DE LA SECCIÓN MODIFICADA --- */}
        <div className="w-full max-w-[90vw] mt-16">
          <Link href="/es/projects" legacyBehavior>
            <motion.a
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="relative flex justify-between items-center w-full h-12 font-bold text-secondary-light dark:text-secondary-dark rounded-md"
            >
              <div className="flex-grow h-[2px] relative bg-secondary-light/20 dark:bg-secondary-dark/20">
                <motion.div
                  className="absolute top-0 left-0 w-full h-full bg-secondary-light dark:bg-secondary-dark"
                  initial={{ x: "-100%" }}
                  animate={{ x: isHovered ? "0%" : "-100%" }}
                  transition={{ duration: 1.0, ease: [0.7, 0, 0.3, 1] }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <AnimatePresence>
                      {isHovered && (
                        <>
                          <motion.div
                            className="w-3 h-3 rounded-full bg-secondary-dark"
                            style={{ boxShadow: "0 0 25px 10px #D8B4FE" }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ duration: 0.2 }}
                          />
                          <Sparks />
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
              <motion.span
                className="ml-4 pr-2 z-10 text-gray-600 dark:text-gray-300 text-3xl cursor-pointer"
                variants={{
                  rest: { x: 0 },
                  hover: { x: [-3, 3, -3, 3, 0] }
                }}
                animate={isHovered ? "hover" : "rest"}
                transition={{
                  x: { delay: isHovered ? 0.4 : 0, duration: 0.4 }
                }}
              >
                {t('view_more_projects')}
                <FaArrowRight className="inline-block ml-2" />
              </motion.span>
            </motion.a>
          </Link>
        </div>
        {/* --- FIN DE LA NUEVA SECCIÓN --- */}
        
      </div>
    </section>
  );
};

export default TechStack;
