'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Image from 'next/image';

// --- Objeto con las 4 traducciones correctas ---
const translations = {
  en: {
    about_title: "About Me",
    about_intro: "Hey! Glad to see you here. I'm a programmer and web designer, the kind of person who dives deep into code to build tech solutions that not only work but also feel intuitive and look great. A graduate of Federico Santa María University, I've been on this path for over 6 years, finding the perfect balance between back-end logic and front-end creativity.",
    about_philosophy: "My work philosophy is simple: every project is a new challenge and an opportunity to create something unique. I specialize in full-stack development, which means I'm equally comfortable building an application's engine (back-end) with technologies like PHP, SQL, and Node.js, as I am bringing the visible part of a site to life (front-end) with HTML5, CSS, and the modern JavaScript ecosystem (Next.js, TypeScript). I love designing interfaces from scratch, ensuring that every visual detail is not only aesthetic but also offers a smooth and responsive user experience on any device.",
    about_current_work: "Currently, I'm part of the team at Grupo JCS, a logistics company in southern Chile, while also developing projects as a freelancer. This combination keeps me constantly evolving, facing challenges ranging from creating corporate websites and catalogs to developing complex systems with interactive maps, databases, graphs, and Artificial Intelligence features.",
    about_communication: "I firmly believe in clear and honest communication. For me, it's essential that you understand every stage of the process and that we work together to overcome any obstacles, ensuring the final result is exactly what you need.",
    about_passions: "When I'm not in front of a screen, my life revolves around my daughter, soccer—my great passion that leads me to play for two teams, Catiray and Unión Los Carrera—and skateboarding. These passions fill me with energy and have taught me the value of discipline and teamwork, principles I apply to every line of code I write.",
    about_cta: "If you have an idea in mind or a technological challenge, let's talk! I'd love to help you make it a reality."
  },
  es: {
    about_title: "Quién Soy",
    about_intro: "¡Ey! Qué bueno verte por aquí. Soy programador y diseñador web, el tipo de persona que se sumerge en el código para construir soluciones tecnológicas que no solo funcionan, sino que también se sienten intuitivas y se ven geniales. Egresado de la Universidad Federico Santa María, llevo más de 6 años en este camino, encontrando el equilibrio perfecto entre la lógica del back-end y la creatividad del front-end.",
    about_philosophy: "Mi filosofía de trabajo es simple: cada proyecto es un nuevo desafío y una oportunidad para crear algo único. Me especializo en el desarrollo full-stack, lo que significa que me siento igual de cómodo construyendo el motor de una aplicación (back-end) con tecnologías como PHP, SQL y Node.js, como dando vida a la parte visible de un sitio (front-end) con HTML5, CSS y el ecosistema moderno de JavaScript (Next.js, TypeScript). Me encanta diseñar interfaces desde cero, asegurándome de que cada detalle visual no solo sea estético, sino que también ofrezca una experiencia de usuario fluida y adaptable a cualquier dispositivo (responsive).",
    about_current_work: "Actualmente, formo parte del equipo de Grupo JCS, una empresa de logística en el sur de Chile, y al mismo tiempo desarrollo proyectos de manera freelance. Esta combinación me mantiene en constante evolución, enfrentando retos que van desde la creación de sitios corporativos y catálogos, hasta el desarrollo de sistemas complejos con mapas interactivos, bases de datos, gráficos y funcionalidades de Inteligencia Artificial.",
    about_communication: "Creo firmemente en la comunicación clara y honesta. Para mí, es fundamental que entiendas cada etapa del proceso y que trabajemos juntos para superar cualquier obstáculo, garantizando que el resultado final sea exactamente lo que necesitas.",
    about_passions: "Cuando no estoy frente a una pantalla, mi vida gira en torno a mi hija, el fútbol —mi gran pasión que me lleva a jugar en dos equipos, Catiray y Unión Los Carrera— y el skate. Estas pasiones me llenan de energía y me han enseñado el valor de la disciplina y el trabajo en equipo, principios que aplico en cada línea de código que escribo.",
    about_cta: "Si tienes una idea en mente o un desafío tecnológico, ¡hablemos! Me encantaría ayudarte a hacerlo realidad."
  },
  de: {
    about_title: "Über Mich",
    about_intro: "Hey! Schön, dich hier zu sehen. Ich bin Programmierer und Webdesigner, die Art von Person, die tief in den Code eintaucht, um technische Lösungen zu entwickeln, die nicht nur funktionieren, sondern sich auch intuitiv anfühlen und großartig aussehen. Als Absolvent der Universität Federico Santa María bin ich seit über 6 Jahren auf diesem Weg und finde die perfekte Balance zwischen Back-End-Logik und Front-End-Kreativität.",
    about_philosophy: "Meine Arbeitsphilosophie ist einfach: Jedes Projekt ist eine neue Herausforderung und eine Gelegenheit, etwas Einzigartiges zu schaffen. Ich bin auf die Full-Stack-Entwicklung spezialisiert, was bedeutet, dass ich mich gleichermaßen wohl dabei fühle, den Motor einer Anwendung (Back-End) mit Technologien wie PHP, SQL und Node.js zu erstellen, wie auch den sichtbaren Teil einer Website (Front-End) mit HTML5, CSS und dem modernen JavaScript-Ökosystem (Next.js, TypeScript) zum Leben zu erwecken. Ich liebe es, Schnittstellen von Grund auf zu entwerfen und sicherzustellen, dass jedes visuelle Detail nicht nur ästhetisch ist, sondern auch eine reibungslose und anpassungsfähige Benutzererfahrung auf jedem Gerät bietet.",
    about_current_work: "Derzeit bin ich Teil des Teams bei Grupo JCS, einem Logistikunternehmen im Süden Chiles, und entwickle gleichzeitig Projekte als Freiberufler. Diese Kombination hält mich in ständiger Entwicklung und stellt mich vor Herausforderungen, die von der Erstellung von Unternehmenswebsites und Katalogen bis hin zur Entwicklung komplexer Systeme mit interaktiven Karten, Datenbanken, Grafiken und Funktionen der künstlichen Intelligenz reichen.",
    about_communication: "Ich glaube fest an eine klare und ehrliche Kommunikation. Für mich ist es entscheidend, dass Sie jede Phase des Prozesses verstehen und wir zusammenarbeiten, um alle Hindernisse zu überwinden und sicherzustellen, dass das Endergebnis genau Ihren Anforderungen entspricht.",
    about_passions: "Wenn ich nicht vor einem Bildschirm sitze, dreht sich mein Leben um meine Tochter, Fußball – meine große Leidenschaft, die mich für zwei Teams spielen lässt, Catiray und Unión Los Carrera – und Skateboarding. Diese Leidenschaften erfüllen mich mit Energie und haben mir den Wert von Disziplin und Teamarbeit gelehrt, Prinzipien, die ich in jeder Zeile Code anwende, die ich schreibe.",
    about_cta: "Wenn Sie eine Idee oder eine technologische Herausforderung haben, lassen Sie uns reden! Ich würde Ihnen gerne helfen, sie zu verwirklichen."
  },
  zh: {
    about_title: "关于我",
    about_intro: "嘿！很高兴在这里见到你。我是一名程序员和网页设计师，那种沉浸于代码中构建技术解决方案的人，这些方案不仅功能强大，而且感觉直观、看起来也很棒。我毕业于费德里科·圣玛丽亚大学，在这条路上已经走了六年多，找到了后端逻辑和前端创造力之间的完美平衡。",
    about_philosophy: "我的工作理念很简单：每个项目都是一个新的挑战和创造独特事物的机会。我专注于全栈开发，这意味着我既能熟练使用PHP、SQL和Node.js等技术构建应用程序的引擎（后端），也能使用HTML5、CSS和现代JavaScript生态系统（Next.js, TypeScript）为网站的可见部分注入活力（前端）。我喜欢从头开始设计界面，确保每个视觉细节不仅美观，而且能在任何设备上提供流畅且响应迅速的用户体验。",
    about_current_work: "目前，我是智利南部一家物流公司 Grupo JCS 团队的一员，同时也作为自由职业者开发项目。这种结合使我能够不断进步，面对从创建公司网站和目录到开发带有交互式地图、数据库、图表和人工智能功能的复杂系统的各种挑战。",
    about_communication: "我坚信清晰和诚实的沟通。对我来说，让你了解流程的每个阶段，并共同努力克服任何障碍，确保最终结果正是你所需要的，这是至关重要的。",
    about_passions: "当不面对屏幕时，我的生活围绕着我的女儿、足球——我巨大的热情让我为两支球队（Catiray和Unión Los Carrera）效力——以及滑板。这些爱好让我充满活力，并教会了我纪律和团队合作的价值，这些原则我应用于我写的每一行代码中。",
    about_cta: "如果你有想法或技术挑战，我们聊聊吧！我很乐意帮助你实现它。"
  }
};

const AboutUs = () => {
  const { i18n } = useTranslation();
  
  const lang = i18n.language.split('-')[0] as keyof typeof translations;
  const content = translations[lang] || translations['en'];

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.6, 0.05, 0.01, 0.9],
      },
    }),
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section className="w-full py-20 px-4 sm:px-8 bg-primary-light/90 dark:bg-gray-900">
      <div className="max-w-[90vw] mx-auto">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-center text-gray-200 dark:text-gray-300 mb-12"
          initial="hidden"
          animate="visible"
          variants={textVariants}
        >
          {content.about_title}
        </motion.h2>

        {/* Contenedor principal que cambia de flex-col a grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-12 md:items-center mb-12">
          {/* Columna de Texto */}
          <motion.div
            className="order-2 md:order-1" // En móvil (flex-col), el texto va segundo. En desktop (grid), va primero.
            initial="hidden"
            animate="visible"
            variants={textVariants}
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-8 md:mt-0">
              {content.about_intro}
            </p>
                <br/>
                <br/>
                <br/>
                      <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={0.2}
          >
            {content.about_philosophy}
          </motion.p>
          </motion.div>
          
          {/* Columna de Imagen */}
          <motion.div
            className="relative w-full h-96 md:h-[600px] rounded-lg overflow-hidden group order-1 md:order-2" // En móvil va primero, en desktop segundo.
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <Image
              src="/yo.jpg"
              alt="Foto del programador"
              fill
              sizes="(max-width: 768px) 90vw, 45vw"
              className="object-contain rounded-lg grayscale hover:grayscale-0 group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            <div className="absolute inset-0  rounded-lg pointer-events-none"></div>
          </motion.div>
        </div>

        {/* Resto del texto */}
        <div className="space-y-6">

          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={0.3}
          >
            {content.about_current_work}
          </motion.p>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={0.4}
          >
            {content.about_communication}
          </motion.p>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={0.5}
          >
            {content.about_passions}
          </motion.p>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 font-bold"
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={0.6}
          >
            {content.about_cta}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;