// app/[lang]/dashboard/publicacion/page.tsx
import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import DashboardLayout from '@/app/components/DashboardLayout';
import { getPosts, Post } from './actions';
import PostManager from './PostManager';

interface PublicacionPageProps {
  params: {
    lang: string;
  };
}

async function PublicacionPage({ params }: PublicacionPageProps) {
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
    console.error('[PublicacionPage] Session verification failed:', error);
    redirect(`/${params.lang}/login`);
  }

  const userRole = decodedToken.role || 'user';
  
  // Obtenemos las publicaciones desde la server action
  const initialPosts = await getPosts();

  return (
    <DashboardLayout
      userEmail={decodedToken.email}
      userName={decodedToken.name}
      userRole={userRole}
      lang={params.lang}
    >
      <PostManager initialPosts={initialPosts} />
    </DashboardLayout>
  );
}

export default PublicacionPage;
