// app/[lang]/dashboard/faq/page.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getFaqs } from './actions';
import FaqManager from './FaqManager';

interface FaqPageProps {
  params: {
    lang: string;
  };
}

async function FaqPage({ params }: FaqPageProps) {
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
    console.error('[FaqPage] Session verification failed:', error);
    redirect(`/${params.lang}/login`);
  }

  const userRole = decodedToken.role || 'user';
  
  if (userRole !== 'user') {
      redirect(`/${params.lang}/dashboard`);
  }

  const initialFaqs = await getFaqs();

  return (
    <DashboardLayout
      userEmail={decodedToken.email}
      userName={decodedToken.name}
      userRole={userRole}
      lang={params.lang}
    >
      <FaqManager initialFaqs={initialFaqs} />
    </DashboardLayout>
  );
}

export default FaqPage;
