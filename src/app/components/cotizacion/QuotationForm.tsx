// components/QuotationForm.tsx
'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaIdCard, FaPhone, FaEnvelope } from 'react-icons/fa';
import ServiceCard from './ServiceCard';
import ConfirmationModal from './ConfirmationModal'; // Componente para el modal de confirmación

// --- TEXTOS MULTI-IDIOMA ---
const quotationTexts = {
  en: {
    title: 'Request a Quote',
    personalInfo: 'Your Information',
    namePlaceholder: 'Name or Company',
    rutPlaceholder: 'RUT (Optional)',
    phonePlaceholder: 'Phone',
    emailPlaceholder: 'Email',
    serviceSelection: 'Select Services',
    total: 'Total',
    cancelButton: 'Cancel',
    confirmButton: 'Request Quote',
    modalTitle: 'Confirm Quotation',
    modalMessage: 'Are you sure you want to send this quote request? You will receive a copy in your email.',
    modalConfirm: 'Send',
    modalCancel: 'Go Back'
  },
  es: {
    title: 'Cotiza tu Proyecto',
    personalInfo: 'Tus Datos',
    namePlaceholder: 'Nombre o Empresa',
    rutPlaceholder: 'RUT (Opcional)',
    phonePlaceholder: 'Teléfono',
    emailPlaceholder: 'Correo Electrónico',
    serviceSelection: 'Selecciona los Servicios',
    total: 'Total',
    cancelButton: 'Cancelar',
    confirmButton: 'Solicitar Cotización',
    modalTitle: 'Confirmar Cotización',
    modalMessage: '¿Estás seguro de que deseas enviar la cotización? Recibirás una notificación en tu correo.',
    modalConfirm: 'Enviar',
    modalCancel: 'Volver'
  },
  de: {
    title: 'Angebot anfordern',
    personalInfo: 'Ihre Informationen',
    namePlaceholder: 'Name oder Firma',
    rutPlaceholder: 'Steuernummer (Optional)',
    phonePlaceholder: 'Telefon',
    emailPlaceholder: 'E-Mail',
    serviceSelection: 'Dienste auswählen',
    total: 'Gesamt',
    cancelButton: 'Abbrechen',
    confirmButton: 'Angebot anfordern',
    modalTitle: 'Angebot bestätigen',
    modalMessage: 'Möchten Sie diese Angebotsanfrage wirklich senden? Sie erhalten eine Kopie per E-Mail.',
    modalConfirm: 'Senden',
    modalCancel: 'Zurück'
  },
  zh: {
    title: '获取报价',
    personalInfo: '您的信息',
    namePlaceholder: '姓名或公司',
    rutPlaceholder: '税号（可选）',
    phonePlaceholder: '电话',
    emailPlaceholder: '电子邮件',
    serviceSelection: '选择服务',
    total: '总计',
    cancelButton: '取消',
    confirmButton: '请求报价',
    modalTitle: '确认报价',
    modalMessage: '您确定要发送此报价请求吗？您的邮箱将收到一份副本。',
    modalConfirm: '发送',
    modalCancel: '返回'
  },
};

// --- SERVICIOS ESTÁTICOS CON TRADUCCIONES ---
const servicesData = [
  { 
    id: 'spa', 
    price: 1500000, 
    name: { 
      es: 'Aplicación de Página Única (SPA)', 
      en: 'Single Page Application (SPA)', 
      de: 'Single-Page-Anwendung (SPA)', 
      zh: '单页应用程序 (SPA)' 
    },
    description: {
      es: 'Una aplicación web moderna y fluida construida con tecnologías como React o Vue.',
      en: 'A modern, fluid web app built with technologies like React or Vue.',
      de: 'Eine moderne, flüssige Web-App, die mit Technologien wie React oder Vue erstellt wurde.',
      zh: '使用 React 或 Vue 等技术构建的现代化流畅网页应用。'
    }
  },
  { 
    id: 'ecommerce', 
    price: 2500000, 
    name: { 
      es: 'Sitio E-commerce Completo', 
      en: 'Full E-commerce Site', 
      de: 'Vollständige E-Commerce-Website', 
      zh: '完整电子商务网站' 
    },
    description: {
      es: 'Tienda online con carrito de compras, pagos y gestión de productos.',
      en: 'Online store with a shopping cart, payments, and product management.',
      de: 'Onlineshop mit Warenkorb, Zahlungen und Produktverwaltung.',
      zh: '包含购物车、支付和产品管理的在线商店。'
    }
  },
  { 
    id: 'catalog', 
    price: 900000, 
    name: { 
      es: 'Catálogo de Productos', 
      en: 'Product Catalog', 
      de: 'Produktkatalog', 
      zh: '产品目录' 
    },
    description: {
      es: 'Una vitrina digital para mostrar productos o servicios, sin carrito de compras.',
      en: 'A digital showcase for products or services, without a shopping cart.',
      de: 'Eine digitale Vitrine für Produkte oder Dienstleistungen, ohne Warenkorb.',
      zh: '用于展示产品或服务的数字展柜，不含购物车功能。'
    }
  },
  { 
    id: 'scheduling', 
    price: 1200000, 
    name: { 
      es: 'Sistema de Agendamiento', 
      en: 'Scheduling System', 
      de: 'Terminplanungssystem', 
      zh: '预约系统' 
    },
    description: {
      es: 'Plataforma para que los usuarios reserven horas, citas o servicios.',
      en: 'A platform for users to book appointments, services, or time slots.',
      de: 'Eine Plattform für Benutzer zur Buchung von Terminen, Dienstleistungen oder Zeitfenstern.',
      zh: '供用户预订约会、服务或时间段的平台。'
    }
  },
  { 
    id: 'managementSoftware', 
    price: 4000000, 
    name: { 
      es: 'Software de Gestión de Empresa', 
      en: 'Business Management Software', 
      de: 'Unternehmensverwaltungssoftware', 
      zh: '企业管理软件' 
    },
    description: {
      es: 'Sistema interno para manejar clientes, cotizaciones, inventario, etc.',
      en: 'Internal system to manage clients, quotes, inventory, etc.',
      de: 'Ein internes System zur Verwaltung von Kunden, Angeboten, Inventar usw.',
      zh: '用于管理客户、报价、库存等的内部系统。'
    }
  },
  { 
    id: 'api', 
    price: 1800000, 
    name: { 
      es: 'Desarrollo de API', 
      en: 'API Development', 
      de: 'API-Entwicklung', 
      zh: 'API 开发' 
    },
    description: {
      es: 'La lógica de backend que conecta la app con la base de datos y asegura la seguridad.',
      en: 'The backend logic that connects the app with the database and ensures security.',
      de: 'Die Backend-Logik, die die App mit der Datenbank verbindet und die Sicherheit gewährleistet.',
      zh: '连接应用程序与数据库并确保安全的后端逻辑。'
    }
  },
  { 
    id: 'realtime', 
    price: 800000, 
    name: { 
      es: 'Funcionalidades Real-Time', 
      en: 'Real-Time Features', 
      de: 'Echtzeit-Funktionen', 
      zh: '实时功能' 
    },
    description: {
      es: 'Chats en vivo, notificaciones instantáneas y dashboards que se actualizan solos.',
      en: 'Live chats, instant notifications, and self-updating dashboards.',
      de: 'Live-Chats, sofortige Benachrichtigungen und selbstaktualisierende Dashboards.',
      zh: '实时聊天、即时通知和自动更新的仪表板。'
    }
  },
  { 
    id: 'multilang', 
    price: 350000, 
    name: { 
      es: 'Soporte Multilenguaje', 
      en: 'Multi-language Support', 
      de: 'Mehrsprachige Unterstützung', 
      zh: '多语言支持' 
    },
    description: {
      es: 'Permite que el contenido de la aplicación se muestre en varios idiomas.',
      en: 'Allows the application content to be displayed in multiple languages.',
      de: 'Ermöglicht die Anzeige von Anwendungsinhalten in mehreren Sprachen.',
      zh: '允许应用程序内容以多种语言显示。'
    }
  },
  { 
    id: 'darkmode', 
    price: 250000, 
    name: { 
      es: 'Modo Oscuro/Claro', 
      en: 'Dark/Light Mode', 
      de: 'Dunkel-/Hell-Modus', 
      zh: '深色/浅色模式' 
    },
    description: {
      es: 'Implementación de un tema visual oscuro además del tema claro.',
      en: 'Implementation of a dark visual theme in addition to the light one.',
      de: 'Implementierung eines dunklen visuellen Themas zusätzlich zum hellen.',
      zh: '在浅色主题之外实现深色视觉主题。'
    }
  }
];

export default function QuotationForm() {
  const { i18n } = useTranslation();
  const lang = i18n.language as keyof typeof quotationTexts;
  const texts = quotationTexts[lang] || quotationTexts.en;

  const [formData, setFormData] = useState({ name: '', rut: '', phone: '', email: '' });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((total, serviceId) => {
      const service = servicesData.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  }, [selectedServices]);

  const handleCancel = () => {
    setFormData({ name: '', rut: '', phone: '', email: '' });
    setSelectedServices([]);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleConfirmQuote = () => {
    console.log("Cotización Enviada:", { ...formData, services: selectedServices, total: totalPrice });
    // Aquí iría la lógica para enviar el correo o llamar a una API
    setIsModalOpen(false);
    handleCancel(); // Limpiar formulario después de enviar
  };
  
  const modalTexts = {
    title: texts.modalTitle,
    message: texts.modalMessage,
    confirmButton: texts.modalConfirm,
    cancelButton: texts.modalCancel
  };

  return (
    <>
      <div className="w-full bg-primary-light dark:bg-gray-900 text-text-light dark:text-text-dark py-16 lg:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-400 dark:bg-slate-800/50 p-8 rounded-xl shadow-2xl">
            <h1 className="text-3xl font-bold text-center mb-2 text-gray-700 dark:text-primary-dark">{texts.title}</h1>
            <p className="text-center text-slate-600 dark:text-slate-400 mb-8">{texts.personalInfo}</p>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Inputs con íconos */}
                {[
                  { name: 'name', placeholder: texts.namePlaceholder, icon: FaUser, type: 'text' },
                  { name: 'rut', placeholder: texts.rutPlaceholder, icon: FaIdCard, type: 'text' },
                  { name: 'phone', placeholder: texts.phonePlaceholder, icon: FaPhone, type: 'tel' },
                  { name: 'email', placeholder: texts.emailPlaceholder, icon: FaEnvelope, type: 'email' }
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <field.icon className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      required={field.name !== 'rut'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-700 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition"
                    />
                  </div>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-center mb-6 text-gray-600 dark:text-primary-dark">{texts.serviceSelection}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {servicesData.map(service => (
                  <ServiceCard
                    key={service.id}
                    serviceName={service.name[lang] || service.name.en}
                    servicePrice={service.price}
                    isSelected={selectedServices.includes(service.id)}
                    onSelect={() => handleServiceToggle(service.id)}
                  />
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
                <div className="text-xl text-gray-700 dark:text-gray-400 font-bold mb-4 sm:mb-0">
                  {texts.total}: <span className="text-gray-700 dark:text-primary-dark">{totalPrice.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</span>
                </div>
                <div className="flex gap-4">
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-6 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 font-semibold rounded-lg hover:opacity-90 transition"
                  >
                    {texts.cancelButton}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-2 px-6 bg-primary-light dark:bg-primary-dark text-white font-semibold rounded-lg hover:opacity-90 transition"
                  >
                    {texts.confirmButton}
                  </motion.button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      
      <AnimatePresence>
        {isModalOpen && (
          <ConfirmationModal 
            key="confirmation-modal"
            onClose={() => setIsModalOpen(false)} 
            onConfirm={handleConfirmQuote}
            texts={modalTexts}
          />
        )}
      </AnimatePresence>
    </>
  );
}