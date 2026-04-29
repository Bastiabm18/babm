import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardContent from '../../components/DashboardContent';

interface DashboardPageProps {
  params: {
    lang: string;
  };
}

async function DashboardPage({ params }: DashboardPageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('supabaseAuthSession')?.value;

  if (!sessionCookie) {
    redirect(`/${params.lang}/login`);
  }

  let userData: any = null;

  try {
    // Genera la URL absoluta. Si no existe la variable, usa localhost:3000 automáticamente.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ;

    const res = await fetch(`${baseUrl}/api/auth/session`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Cookie: `supabaseAuthSession=${sessionCookie}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      userData = data.user;
    } else {
      redirect(`/${params.lang}/login`);
    }
  } catch (error) {
    console.error('[Dashboard] Error obteniendo sesión:', error);
    redirect(`/${params.lang}/login`);
  }

  if (!userData) {
    redirect(`/${params.lang}/login`);
  }

  const userRole = userData.role || 'user';
  if (!['user', 'admin'].includes(userRole)) {
    console.warn(`[Dashboard] Acceso no autorizado, rol: ${userRole}`);
    redirect(`/${params.lang}`);
  }

  return (
    <DashboardLayout
      userEmail={userData.email}
      userName={userData.name}
      userRole={userRole}
      lang={params.lang}
    >
      <DashboardContent
        userName={userData.name} 
        lang={params.lang} 
      />
    </DashboardLayout>
  );
}

export default DashboardPage;