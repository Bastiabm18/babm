'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';
import ProjectCard from './ProyectCard';
import { getPosts, Post } from './actions'; // Asegúrate que la ruta a 'actions.ts' es correcta

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const Sparks = () => {
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary-light dark:bg-secondary-dark"
          style={{
            boxShadow: "0 0 10px 2px",
          }}
          initial={{ y: 0, x: 0, scale: 0.5 }}
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

export default function ProjectsGrid() {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Se usa useEffect para obtener los datos en el lado del cliente, igual que en tu FAQ.tsx
  useEffect(() => {
    async function loadPosts() {
      try {
        const fetchedPosts = await getPosts();
        // Guardamos solo los primeros 6
        setPosts(fetchedPosts.slice(0, 6)); 
      } catch (error) {
        console.error("Falló la carga de posts", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Muestra un spinner mientras los datos están cargando
  if (loading) {
    return (
      <section className="w-screen min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-4xl text-primary-dark dark:text-primary-light" />
      </section>
    );
  }

  // No renderiza nada si, después de cargar, no hay posts
  if (posts.length === 0) {
    return null;
  }

  return (
    <section 
      id="proyectos" 
      className="w-screen min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-100 dark:bg-gray-900"
    >
      {/* Grid de Proyectos */}
      <motion.div
        className="w-full max-w-[90vw] items-center justify-center p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map(post => (
          <ProjectCard key={post.id} post={post} />
        ))}
      </motion.div>

      {/* Link de "Ver más proyectos" */}
      <div className="w-full max-w-[90vw] mt-16">
        <Link href={`/${i18n.language}/projects?id=`} legacyBehavior>
          <motion.a
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex justify-between items-center w-full h-12 font-bold text-primary-light dark:text-secondary-dark rounded-md"
          >
            <div className="flex-grow h-[2px] relative bg-primary-light/20 dark:bg-secondary-dark/20">
              <motion.div
                className="absolute top-0 left-0 w-full h-full bg-primary-light dark:bg-secondary-dark"
                initial={{ x: "-100%" }}
                animate={{ x: isHovered ? "0%" : "-100%" }}
                transition={{ duration: 1.0, ease: [0.7, 0, 0.3, 1] }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <AnimatePresence>
                    {isHovered && (
                      <>
                        <motion.div
                          className="w-3 h-3 rounded-full bg-primary-light dark:bg-secondary-dark"
                          style={{ boxShadow: "0 0 25px 10px" }}
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
              className="ml-4 pr-2 z-10 text-3xl text-primary-light dark:text-gray-300 cursor-pointer"
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
    </section>
  );
};