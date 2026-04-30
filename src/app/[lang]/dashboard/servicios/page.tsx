// app/[lang]/dashboard/servicios/page.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// import { getAdminInstances } from '@/lib/firebase/firebase-admin'; <-- BORRADO
import DashboardLayout from '@/app/components/DashboardLayout';
import { getServices } from './actions';
import ServiceManager from './ServiceManager';

interface ServiciosPageProps {
  params: {
    lang: string;
  };
}

async function ServiciosPage({ params }: ServiciosPageProps) {
  const cookieStore = await cookies();
  // CAMBIADO: de firebaseAuthSession a supabaseAuthSession
  const sessionCookie = cookieStore.get('supabaseAuthSession')?.value;

  if (!sessionCookie) {
    redirect(`/${params.lang}/login`);
  }

  // CAMBIADO: en vez de decodedToken, usamos userData como tu otro código
  let userData: any = null;

  try {
    // PATRÓN EXACTO QUE ME DISTE
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
    console.error('[ServiciosPage] Error obteniendo sesión:', error);
    redirect(`/${params.lang}/login`);
  }

  if (!userData) {
    redirect(`/${params.lang}/login`);
  }

  const userRole = userData.role || 'user';
  
  //FIX: Redirige si el rol no es 'admin'
  if (userRole !== 'admin') {
      console.warn(`[ServiciosPage] Unauthorized access attempt by role: ${userRole}. Redirecting...`);
      redirect(`/${params.lang}/dashboard`); 
  }

  const initialServices = await getServices();

  return (
    <DashboardLayout
      userEmail={userData.email}  // CAMBIADO: de decodedToken a userData
      userName={userData.name}    // CAMBIADO: de decodedToken a userData
      userRole={userRole}
      lang={params.lang}
    >
      {/* ✅ FIX: Se pasan solo las props correctas a ServiceManager */}
      <ServiceManager initialServices={initialServices} />
    </DashboardLayout>
  );
}

export default ServiciosPage;