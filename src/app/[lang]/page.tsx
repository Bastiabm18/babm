'use client';
import { useTranslation } from 'react-i18next';
import ImageSlider from '../components/ImageSlider';
import CodeSimulator from '../components/CodeSimulator';
import ContactPage from '../components/ContactPage';
import ProjectsGrid from '../components/cardComponent/ProyectsGrid';
import TechStack from '../components/TechStack/TechStack';
import  Faqs  from '../components/faqs/Faqs';
import QuotationForm from '../components/cotizacion/QuotationForm';
import { PromoModal } from '../components/PromoModal';
import { Sponsors } from '../components/SponsorCarousel';
import AboutUs from '../components/About';
import HeroSlider from '../components/HeroSlider';
export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex flex-col gap-20 mb-10 items-center justify-center  bg-background-light dark:bg-background-dark">
      <section className='flex items-center justify-center w-[95vw] '>
      <ImageSlider />

      </section>
      <section className='flex items-center justify-center w-[95vw] '>
      <CodeSimulator/>
      </section>
      <section id="proyectos" className='flex items-center justify-center w-[95vw]'>
        <ProjectsGrid />
        </section>
      <section id="techstack" className='flex items-center justify-center w-[95vw]'>
        <TechStack />
      </section>
      <section id="contacto" className='flex items-center justify-center  w-[95vw]'>
        <ContactPage/>
      </section>
      <section id="cotiza" className='flex items-center justify-center w-[95vw]'>
        <HeroSlider />
        </section>



        <section id="faq" className='flex items-center justify-center w-[95vw]'>
        <Faqs />
        </section>
      <section id="about" className='flex items-center justify-center w-[95vw]'>
        <AboutUs />
        </section>
        <section className=' flex items-center justify-center w-[95vw]'>
          <Sponsors />
        </section>
        
          <PromoModal />
    </div>
  );
}