'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { FiMail } from 'react-icons/fi';
import EmailModal from './EmailModal';
import dynamic from 'next/dynamic';

const contactTexts = {
  en: {
    title: 'Contact Us',
    socialTitle: 'Follow Us',
    infoTitle: 'Business Information',
    hours: 'Hours',
    hoursDetail: 'Mon - Fri: 9:00 AM - 6:00 PM',
    location: 'Location',
    locationDetail: '123 Tech Avenue, Silicon Valley, CA',
    emailButton: 'Send an Email',
    modalTitle: 'Get in Touch',
    modalEmailPlaceholder: 'Your Email',
    modalMessagePlaceholder: 'Your Message...',
    modalSendButton: 'Send Message'
  },
  es: {
    title: 'Contáctanos',
    socialTitle: 'Síguenos',
    infoTitle: 'Información Comercial',
    hours: 'Horarios',
    hoursDetail: 'Lun - Vie: 9:00 AM - 6:00 PM',
    location: 'Ubicación',
    locationDetail: 'Alameda 811,Concepcion, Chile',
    emailButton: 'Enviar un Email',
    modalTitle: 'Ponte en Contacto',
    modalEmailPlaceholder: 'Tu Email',
    modalMessagePlaceholder: 'Tu Mensaje...',
    modalSendButton: 'Enviar Mensaje'
  },
  de: {
    title: 'Kontaktieren Sie uns',
    socialTitle: 'Folgen Sie uns',
    infoTitle: 'Geschäftsinformationen',
    hours: 'Öffnungszeiten',
    hoursDetail: 'Mo - Fr: 9:00 - 18:00 Uhr',
    location: 'Standort',
    locationDetail: 'Technologie-Allee 123, Berlin, DE',
    emailButton: 'E-Mail senden',
    modalTitle: 'In Kontakt treten',
    modalEmailPlaceholder: 'Ihre E-Mail',
    modalMessagePlaceholder: 'Ihre Nachricht...',
    modalSendButton: 'Nachricht senden'
  },
  zh: {
    title: '联系我们',
    socialTitle: '关注我们',
    infoTitle: '商业信息',
    hours: '营业时间',
    hoursDetail: '周一至周五: 上午9点 - 下午6点',
    location: '位置',
    locationDetail: '科技大道123号, 北京, 中国',
    emailButton: '发送邮件',
    modalTitle: '保持联系',
    modalEmailPlaceholder: '您的邮箱',
    modalMessagePlaceholder: '您的留言...',
    modalSendButton: '发送消息'
  },
};

const socialLinks = [
  { icon: FaInstagram, href: 'https://instagram.com/bastiabm' },
  { icon: FaFacebook, href: 'https://facebook.com/bastian.andres.5437/' },
  { icon: FaLinkedin, href: 'https://linkedin.com/in/andres-barrios-medina-381680212/' },
  { icon: FaYoutube, href: 'https://youtube.com/channel/UCdWAWjHy1CGvnzjaoIet9kA' },
];

export default function ContactPage() {
  const { i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const Map = useMemo(() => dynamic(() => import('./Map'), { 
    loading: () => <p className="text-center">Cargando mapa...</p>,
    ssr: false
  }), []);
  
  const texts = contactTexts[i18n.language as keyof typeof contactTexts] || contactTexts.en;

  const modalTexts = {
    title: texts.modalTitle,
    emailPlaceholder: texts.modalEmailPlaceholder,
    messagePlaceholder: texts.modalMessagePlaceholder,
    sendButton: texts.modalSendButton,
  };

  return (
    <>
      <div className="w-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark py-16 lg:py-24 px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
         
          {/* --- CAMBIO AQUÍ: La grilla ahora es de 5 columnas en 'lg' --- */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 md:gap-16">
            
            {/* --- CAMBIO AQUÍ: La columna de información ocupa 2 de 5 columnas --- */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-primary-light dark:text-primary-dark">{texts.infoTitle}</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <FaClock className="text-xl mt-1 text-primary-light dark:text-primary-dark" />
                    <div>
                      <h3 className="font-semibold">{texts.hours}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{texts.hoursDetail}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-4">
                    <FaMapMarkerAlt className="text-xl mt-1 text-primary-light dark:text-primary-dark" />
                    <div>
                      <h3 className="font-semibold">{texts.location}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{texts.locationDetail}</p>
                    </div>
                  </div>
                   <div className="flex items-start gap-4">
                    <FiMail className="text-xl mt-1 text-primary-light dark:text-primary-dark" />
                    <div>
                       <h3 className="font-semibold">Email</h3>
                       <motion.button
                        onClick={() => setIsModalOpen(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="mt-1 text-white bg-primary-light dark:bg-primary-dark font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                       >
                         {texts.emailButton}
                       </motion.button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-white dark:bg-slate-800/50 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-primary-light dark:text-primary-dark">{texts.socialTitle}</h2>
                <div className="flex justify-center sm:justify-start space-x-6">
                  {socialLinks.map((social, index) => (
                    <motion.a 
                      key={index}
                      href={social.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-3xl text-slate-600 dark:text-slate-300 hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                    >
                      <social.icon />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* --- CAMBIO AQUÍ: La columna del mapa ocupa 3 de 5 columnas --- */}
            <motion.div 
              className="lg:col-span-3 w-full h-80 lg:h-full rounded-lg shadow-lg overflow-hidden z-10"
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.7, delay: 0.4 }}
            >
                <Map position={[-36.827174, -73.050255]} />
            </motion.div>

          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isModalOpen && <EmailModal key="email-modal" onClose={() => setIsModalOpen(false)} texts={modalTexts} />}
      </AnimatePresence>
    </>
  );
}