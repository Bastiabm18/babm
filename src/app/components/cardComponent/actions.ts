'use server';

import { getAdminInstances } from "@/lib/firebase/firebase-admin"; // Revisa que la ruta sea correcta

export interface Post {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  fecha: string;
  imagenes: { url: string; path: string }[];
}

export async function getPosts(): Promise<Post[]> {
  try {
    const { firestore } = getAdminInstances();
    const postsSnapshot = await firestore.collection('posts').orderBy('fecha', 'desc').get();
    
    if (postsSnapshot.empty) {
      return [];
    }

    return postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || '',
        subtitulo: data.subtitulo || '',
        descripcion: data.descripcion || '',
        fecha: new Date(data.fecha._seconds * 1000).toISOString(),
        imagenes: data.imagenes || [],
      };
    });
  } catch (error) {
    console.error('Error al obtener los posts:', error);
    return [];
  }
}