// app/[lang]/dashboard/live/page.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getFaqs } from './actions';
import LiveContent from './LiveContent';


interface LivePageProps {
  params: {
    lang: string;
  };
}

async function LivePage({ params }: LivePageProps) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('supabaseAuthSession')?.value;

  if (!sessionCookie) {
    redirect(`/${params.lang}/login`);
  }

  let userData: any = null;

  try {
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
    console.error('[LivePage] Error obteniendo sesión:', error);
    redirect(`/${params.lang}/login`);
  }

  if (!userData) {
    redirect(`/${params.lang}/login`);
  }

  const userRole = userData.role || 'user';
  
  if (userRole !== 'admin') {
      redirect(`/${params.lang}/dashboard`);
  }


  return (
    <DashboardLayout
      userEmail={userData.email}
      userName={userData.name}
      userRole={userRole}
      lang={params.lang}
    >
      <LiveContent />
    </DashboardLayout>

  );
}

export default LivePage;