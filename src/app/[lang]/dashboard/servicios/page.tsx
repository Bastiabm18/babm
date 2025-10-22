// app/[lang]/dashboard/servicios/page.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getServices } from './actions';
import ServiceManager from './ServiceManager'

interface ServiciosPageProps {
  params: {
    lang: string;
  };
}

async function ServiciosPage({ params }: ServiciosPageProps) {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('firebaseAuthSession')?.value;

  if (!sessionCookie) {
    redirect(`/${params.lang}/login`);
  }

  let decodedToken;
  try {
    const { auth: adminAuth } = getAdminInstances();
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch (error) {
    console.error('[ServiciosPage] Session verification failed:', error);
    redirect(`/${params.lang}/login`);
  }

  const userRole = decodedToken.role || 'user';
  
  // ✅ FIX: Redirige si el rol no es 'user'
  if (userRole !== 'user') {
      console.warn(`[ServiciosPage] Unauthorized access attempt by role: ${userRole}. Redirecting...`);
      redirect(`/${params.lang}/dashboard`); // O a la página principal
  }

  const initialServices = await getServices();

  return (
    <DashboardLayout
      userEmail={decodedToken.email}
      userName={decodedToken.name}
      userRole={userRole}
      lang={params.lang}
    >
      {/* ✅ FIX: Se pasan solo las props correctas a ServiceManager */}
      <ServiceManager initialServices={initialServices} />
    </DashboardLayout>
  );
}

export default ServiciosPage;