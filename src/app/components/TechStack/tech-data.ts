// /components/TechStack/tech-data.ts

import {
  FaHtml5, FaCss3Alt, FaJsSquare, FaReact, FaGitAlt, FaGithub,
  FaServer, FaFigma, FaNodeJs, FaMapMarkedAlt
} from 'react-icons/fa';
import {
  SiTypescript, SiFirebase, SiTailwindcss, SiVercel, SiChartdotjs, SiLeaflet
} from 'react-icons/si';
import { TbApi, TbBrandVscode, TbRoute } from 'react-icons/tb';
import { CgWebsite } from 'react-icons/cg';
import { MdAccessibilityNew } from 'react-icons/md';
import { AiOutlineAntDesign } from 'react-icons/ai';

export const technologies = [
  { name: 'HTML5', IconComponent: FaHtml5, color: 'hover:text-orange-500' },
  { name: 'CSS3', IconComponent: FaCss3Alt, color: 'hover:text-blue-500' },
  { name: 'JavaScript', IconComponent: FaJsSquare, color: 'hover:text-yellow-400' },
  { name: 'TypeScript', IconComponent: SiTypescript, color: 'hover:text-blue-600' },
  { name: 'React', IconComponent: FaReact, color: 'hover:text-sky-400' },
  { name: 'Tailwind CSS', IconComponent: SiTailwindcss, color: 'hover:text-cyan-400' },
  { name: 'Node.js', IconComponent: FaNodeJs, color: 'hover:text-green-500' },
  { name: 'Firebase', IconComponent: SiFirebase, color: 'hover:text-amber-400' },
  { name: 'RESTful APIs', IconComponent: TbApi, color: 'hover:text-emerald-500' },
  { name: 'Git', IconComponent: FaGitAlt, color: 'hover:text-orange-600' },
  { name: 'Github', IconComponent: FaGithub, color: 'hover:text-gray-400' },
  { name: 'Figma', IconComponent: FaFigma, color: 'hover:text-pink-500' },
  { name: 'Ant Design', IconComponent: AiOutlineAntDesign, color: 'hover:text-red-500' },
  { name: 'VS Code', IconComponent: TbBrandVscode, color: 'hover:text-sky-500' },
  { name: 'Vercel', IconComponent: SiVercel, color: 'hover:text-white' },
  { name: 'Chart.js', IconComponent: SiChartdotjs, color: 'hover:text-red-400' },
  { name: 'Leaflet', IconComponent: SiLeaflet, color: 'hover:text-green-600' },
  { name: 'Mapbox', IconComponent: FaMapMarkedAlt, color: 'hover:text-blue-700' },
  { name: 'OSRM', IconComponent: TbRoute, color: 'hover:text-indigo-500' },
  { name: 'Responsive', IconComponent: CgWebsite, color: 'hover:text-purple-500' },
  { name: 'Accessibility', IconComponent: MdAccessibilityNew, color: 'hover:text-teal-400' },
];
