'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactElement } from 'react';
import { FaHome, FaUsers, FaComment, FaChartBar, FaQuestion, FaSignOutAlt, FaChevronLeft, FaChevronRight, FaUserCircle } from 'react-icons/fa';
import { RiCalendarScheduleLine, RiHealthBookLine } from 'react-icons/ri';
import { GrUserAdmin } from 'react-icons/gr';
import { AiFillSetting } from 'react-icons/ai';
import {MdOutlinePostAdd} from "react-icons/md";
import { RiCustomerService2Fill } from "react-icons/ri";
import { BsBackspace } from "react-icons/bs";

interface MenuItem {
  name: string;
  path: string;
  icon: ReactElement;
  role: string[]; // Roles que pueden ver este item
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  userRole?: string;
  lang: string;
}

// Lista completa de todos los items posibles del menú
const allMenuItems: MenuItem[] = [
  // Items para todos los usuarios
  { name: 'Inicio', path: '/dashboard', icon: <FaHome />, role: ['user', 'user'] },
  { name: 'Mi Perfil', path: '/dashboard/profile', icon: <FaUserCircle />, role: ['user', 'user'] },
  { name:'Publicaciones', path:'/dashboard/publicacion',icon:<MdOutlinePostAdd/>,role:['user']}, 
  {name:'Servicios', path:'/dashboard/servicios', icon:<RiCustomerService2Fill/>, role:['user']},
  { name: 'Opiniones', path: '/dashboard/opiniones', icon: <FaComment />, role: ['user'] },
  { name: 'Promociones', path: '/dashboard/promos', icon: <FaChartBar />, role: ['user'] },
  { name: 'Faq', path: '/dashboard/faq', icon: <FaQuestion />, role: ['user'] },
  { name: 'Configuración ', path: '/dashboard/config', icon: <AiFillSetting/>, role: ['user'] },
  { name: 'Salir', path: '/', icon: <BsBackspace />, role: ['user'] },
];

export default function DashboardSidebar({ collapsed, onToggle, mobileOpen, setMobileOpen, userRole, lang }: SidebarProps) {
  const pathname = usePathname();

  // Filtra los items del menú según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    item.role.includes(userRole || 'user')
  );

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-40 transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            )}
            <button
              onClick={onToggle}
              className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hidden lg:block"
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={`/${lang}${item.path}`}
                    className={`flex items-center p-3 rounded-lg transition-colors
                      ${pathname === `/${lang}${item.path}` ? 'bg-primary-light/20 text-primary-dark dark:bg-primary-dark/30 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
