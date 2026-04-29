'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
// ELIMINADO: import { signOut } from 'firebase/auth';
// ELIMINADO: import { getFirebaseAuth } from '@/lib/firebase/firebaseConfig';
import { getSupabaseBrowser } from '@/lib/supabase/supabase-client'; // NUEVO
import DashboardSidebar from './DashboardSidebar'; 
import { FaSignOutAlt } from 'react-icons/fa';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  userRole?: string;
  lang: string;
}

export default function DashboardLayout({ children, userEmail, userName, userRole, lang }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // NUEVO: Usamos Supabase para cerrar sesión en el cliente
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut(); 
      
      // CORREGIDO: Tu ruta API es /api/auth/session, NO /${lang}/api/auth/session
      await fetch('/api/auth/session', { method: 'DELETE' });

      router.push(`/${lang}/login`); 
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  return (
    <div className="flex h-screen bg-primary-light_alt dark:bg-background-dark_alt">
      <DashboardSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        userRole={userRole}
        lang={lang}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <header className="bg-primary-light dark:bg-background-dark/90 shadow-sm z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            
            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-right hidden sm:block">
                {userName && <p className="text-sm font-semibold text-gray-800 dark:text-white">{userName}</p>}
                {userEmail && <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors"
              >
                <FaSignOutAlt className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}