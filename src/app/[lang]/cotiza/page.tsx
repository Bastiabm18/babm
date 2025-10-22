"use client";
import QuotationForm from '../../components/cotizacion/QuotationForm';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa';

import {  useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function CotizaPage() {

    const router = useRouter();
    const { i18n } = useTranslation();

  return (
    <main className="min-h-screen bg-primary-light dark:bg-gray-900 flex flex-col pb-10 items-center justify-center">

      <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/${i18n.language}/`)} 
        className="flex items-center w-full text-left gap-2 mt-8 pl-5 text-secondary-dark font-bold"
      >
        <FaArrowLeft /> Inicio
      </motion.button>
      <QuotationForm />

      <motion.button 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      onClick={() => router.push(`/${i18n.language}/projects?id=`)} 
        className="flex text-right items-center justify-end w-full gap-2 mt-8 pr-5 text-secondary-dark font-bold"
      >
        <FaArrowRight /> Ver Mis Proyectos
      </motion.button>
    </main>
  );
}
