// en lib/i18n/index.ts

import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';

const resources = {
  en: {
    translation: {
      // --- Menu Keys ---
      inicio: 'Home',
      projects: 'Projects',
      contact: 'Contact',
      about: 'About',
      techstack: 'Tech Stack',
      login: 'Login',
      logout: 'Logout',

      // --- Portfolio Grid Translations ---
      view_project: 'View Project',
      view_more_projects: 'View More Projects',
      
      // --- Projects Page ---
      projects_title: 'Explore My Work',
      projects_subtitle: 'A curated collection of my best projects. Use the filters to navigate.',
      search_placeholder: 'Search projects...',
      filter_all: 'All',
      filter_web: 'Web Apps',
      filter_mobile: 'Mobile',
      filter_saas: 'SaaS',
      filter_api: 'APIs',
      back_button: 'Go Back',

      // --- Project Details ---
      title1: 'E-commerce Platform for Fashion Startup',
      subtitle1: 'Full-stack development with Next.js, TypeScript, and payment gateways.',
      description1: 'A full-stack e-commerce solution with a focus on performance and user experience, enabling seamless transactions.',
      title2: 'Real-Time Data Visualization',
      subtitle2: 'Creating interactive and dynamic dashboards with React.',
      description2: 'Interactive dashboard that processes and displays real-time data, helping businesses make informed decisions.',
      title3: 'Core Web Vitals Optimization',
      subtitle3: 'Case study: Improving a high-traffic site\'s performance by 50%.',
      description3: 'Improved conversion rates by 40% through rigorous A/B testing and Core Web Vitals optimization.',
      title4: 'Event Management Mobile App',
      subtitle4: 'Cross-platform development using React Native for iOS & Android.',
      description4: 'A cross-platform app for event management, featuring real-time updates, user authentication, and notifications.',
      title5: 'Robust API with Backend-as-a-Service',
      subtitle5: 'Integrating Firebase and Supabase to accelerate backend development.',
      description5: 'A scalable chat API with websockets, ensuring low-latency communication for thousands of concurrent users.',
      title6: 'My Favorite Development Stack',
      subtitle6: 'A look at the tools and technologies I use to build the future of the web.',
      description6: 'A static-generated site focused on content, performance, and SEO, documenting my journey in web development.',
      
      //tech stack
      tech_title: "My Toolbox & Things I Can Do",
      tech_subtitle: "The skills, tools, and technologies I use to bring your products to life:",
      tech_current_work_title: "Currently working on:",
      tech_current_work_desc: "Improving my skills in, and understanding of, modern JavaScript, TypeScript, and React. Also, having fun with Framer Motion, building & animating things via Tailwind CSS."

   
    },
  },
  es: {
    translation: {
      // --- Menu Keys ---
      inicio: 'Inicio',
      projects: 'Proyectos',
      contact: 'Contacto',
      about: 'Acerca de',
      techstack: 'Tecnologías',
      login: 'Ingresar',
      logout: 'Cerrar sesión',

      // --- Portfolio Grid Translations ---
      view_project: 'Ver Proyecto',
      view_more_projects: 'Ver más proyectos',

      // --- Projects Page ---
      projects_title: 'Explora Mi Trabajo',
      projects_subtitle: 'Una colección curada de mis mejores proyectos. Usa los filtros para navegar.',
      search_placeholder: 'Buscar proyectos...',
      filter_all: 'Todos',
      filter_web: 'Web Apps',
      filter_mobile: 'Móvil',
      filter_saas: 'SaaS',
      filter_api: 'APIs',
      back_button: 'Volver',
      
      // --- Project Details ---
      title1: 'Plataforma E-commerce para Startup de Moda',
      subtitle1: 'Desarrollo full-stack con Next.js, TypeScript y pasarelas de pago.',
      description1: 'Solución e-commerce full-stack centrada en el rendimiento y la experiencia de usuario, permitiendo transacciones fluidas.',
      title2: 'Visualización de Datos en Tiempo Real',
      subtitle2: 'Creación de dashboards interactivos y dinámicos con React',
      description2: 'Dashboard interactivo que procesa y muestra datos en tiempo real, ayudando a la toma de decisiones informadas.',
      title3: 'Paginas web para empresas',
      subtitle3: 'web para empresas con un diseño moderno y funcional.',
      description3: 'Mejora de la tasa de conversión en un 40% a través de pruebas A/B y optimización de Core Web Vitals.',
      title4: 'Aplicación Móvil para Gestión de Citas',
      subtitle4: 'Desarrollo multiplataforma con React Web Funcional en iOS y Android.',
      description4: 'App multiplataforma para gestionar eventos, con actualizaciones en tiempo real, autenticación y notificaciones.',
      title5: 'Manejo de Bases de Datos Relacionales y NoSQL',
      subtitle5: 'Integración de SQL , Firebase, Mongo DB , entre Otras para acelerar el desarrollo backend.',
      description5: 'Una API de chat escalable con websockets, garantizando comunicación de baja latencia para miles de usuarios.',
      title6: 'Mi Stack de Herramientas Favorito',
      subtitle6: 'Un vistazo a las tecnologías que uso para construir la web del futuro.',
      description6: 'Sitio estático enfocado en contenido, rendimiento y SEO, que documenta mi viaje en el desarrollo web.',
    
      //tech stack
      tech_title: "Mis Herramientas y Lo Que Puedo Hacer",
      tech_subtitle: "Las habilidades, herramientas y tecnologías que uso para dar vida a tus productos:",
      tech_current_work_title: "Actualmente trabajando en:",
      tech_current_work_desc: "Mejorando mis habilidades y comprensión de JavaScript moderno, TypeScript y React. Además, divirtiéndome con Framer Motion, construyendo y animando cosas con Tailwind CSS."

    
    },
  },
  de: {
    translation: {
      // --- Menu Keys ---
      inicio: 'Startseite',
      projects: 'Projekte',
      contact: 'Kontakt',
      about: 'Über mich',
      techstack: 'Technologien',
      login: 'Anmelden',
      logout: 'Abmelden',

      // --- Portfolio Grid Translations ---
      view_project: 'Projekt ansehen',
      view_more_projects: 'Weitere Projekte ansehen',

      // --- Projects Page ---
      projects_title: 'Entdecken Sie meine Arbeit',
      projects_subtitle: 'Eine kuratierte Sammlung meiner besten Projekte. Verwenden Sie die Filter zum Navigieren.',
      search_placeholder: 'Projekte suchen...',
      filter_all: 'Alle',
      filter_web: 'Web-Apps',
      filter_mobile: 'Mobil',
      filter_saas: 'SaaS',
      filter_api: 'APIs',
      back_button: 'Zurück',

      // --- Project Details ---
      title1: 'E-Commerce-Plattform für Mode-Startup',
      subtitle1: 'Full-Stack-Entwicklung mit Next.js, TypeScript und Zahlungsgateways.',
      description1: 'Eine Full-Stack-E-Commerce-Lösung mit Fokus auf Leistung und Benutzererfahrung für reibungslose Transaktionen.',
      title2: 'Echtzeit-Datenvisualisierung',
      subtitle2: 'Erstellung interaktiver Dashboards mit React und D3.js.',
      description2: 'Interaktives Dashboard, das Echtzeitdaten verarbeitet und anzeigt, um Unternehmen bei fundierten Entscheidungen zu unterstützen.',
      title3: 'Core Web Vitals Optimierung',
      subtitle3: 'Fallstudie: Verbesserung der Leistung einer stark frequentierten Website um 50 %.',
      description3: 'Steigerung der Konversionsraten um 40% durch rigorose A/B-Tests und Core-Web-Vitals-Optimierung.',
      title4: 'Mobile App für Eventmanagement',
      subtitle4: 'Plattformübergreifende Entwicklung mit React Native für iOS & Android.',
      description4: 'Eine plattformübergreifende App zur Eventverwaltung mit Echtzeit-Updates, Benutzerauthentifizierung und Benachrichtigungen.',
      title5: 'Robuste API mit Backend-as-a-Service',
      subtitle5: 'Integration von Firebase und Supabase zur Beschleunigung der Backend-Entwicklung.',
      description5: 'Eine skalierbare Chat-API mit Websockets, die eine Kommunikation mit geringer Latenz für Tausende von Benutzern gewährleistet.',
      title6: 'Mein Lieblings-Entwicklungsstack',
      subtitle6: 'Ein Blick auf die Tools und Technologien, die ich verwende, um die Zukunft des Webs zu gestalten.',
      description6: 'Eine statisch generierte Website mit Fokus auf Inhalt, Leistung und SEO, die meine Reise in der Webentwicklung dokumentiert.',
   
      //tech stack
      tech_title: "Meine Werkzeuge & Fähigkeiten",
      tech_subtitle: "Die Fähigkeiten, Werkzeuge und Technologien, die ich verwende, um Ihre Produkte zum Leben zu erwecken:",
      tech_current_work_title: "Derzeit arbeite ich an:",
      tech_current_work_desc: "Verbesserung meiner Fähigkeiten und meines Verständnisses von modernem JavaScript, TypeScript und React. Außerdem habe ich Spaß mit Framer Motion und baue & animiere Dinge mit Tailwind CSS."


    },
  },
  zh: {
    translation: {
      // --- Menu Keys ---
      inicio: '首页',
      projects: '项目',
      contact: '联系',
      about: '关于',
      techstack: '技术栈',
      login: '登录',
      logout: '登出',

      // --- Portfolio Grid Translations ---
      view_project: '查看项目',
      view_more_projects: '查看更多项目',

      // --- Projects Page ---
      projects_title: '探索我的工作',
      projects_subtitle: '我最好的项目的精选集合。使用筛选器进行导航。',
      search_placeholder: '搜索项目...',
      filter_all: '全部',
      filter_web: '网络应用',
      filter_mobile: '移动应用',
      filter_saas: '软件即服务',
      filter_api: '接口',
      back_button: '返回',
      
      // --- Project Details ---
      title1: '时尚初创公司的电子商务平台',
      subtitle1: '使用 Next.js、TypeScript 和支付网关进行全栈开发。',
      description1: '一个注重性能和用户体验的全栈电子商务解决方案，可实现无缝交易。',
      title2: '实时数据可视化',
      subtitle2: '使用 React 和 D3.js 创建交互式动态仪表板。',
      description2: '处理和显示实时数据的交互式仪表板，帮助企业做出明智决策。',
      title3: '核心 Web 指标优化',
      subtitle3: '案例研究：将高流量网站的性能提高 50%。',
      description3: '通过严格的 A/B 测试和核心 Web 指标优化，将转化率提高了 40%。',
      title4: '事件管理移动应用程序',
      subtitle4: '使用 React Native 为 iOS 和 Android 进行跨平台开发。',
      description4: '一款用于事件管理的跨平台应用程序，具有实时更新、用户身份验证和通知功能。',
      title5: '具有后端即服务的强大 API',
      subtitle5: '集成 Firebase 和 Supabase 以加速后端开发。',
      description5: '一个使用 Websockets 的可扩展聊天 API，可确保数千并发用户的低延迟通信。',
      title6: '我最喜欢的开发堆栈',
      subtitle6: '了解我用来构建网络未来的工具和技术。',
      description6: '一个专注于内容、性能和 SEO 的静态生成网站，记录了我的 Web 开发之旅。',

      //tech stack
      tech_title: "我的工具箱和技能",
      tech_subtitle: "我用来将您的产品变为现实的技能、工具和技术：",
      tech_current_work_title: "目前正在进行：",
      tech_current_work_desc: "提高我对现代 JavaScript、TypeScript 和 React 的技能和理解。此外，我还喜欢使用 Framer Motion，通过 Tailwind CSS 构建和制作动画。"

    },
  },
};

export async function initTranslations(locale: string) {
  const i18nInstance = createInstance();

  await i18nInstance
    .use(initReactI18next)
    .init({
      resources,
      lng: locale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });

  return {
    i18n: i18nInstance,
    resources: i18nInstance.services.resourceStore.data,
    t: i18nInstance.t
  };
}
