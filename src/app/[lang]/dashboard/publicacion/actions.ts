'use server';

import { revalidatePath } from 'next/cache';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { FieldValue } from 'firebase-admin/firestore';

export interface Post {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  contenido?: string; 
  fecha: string;
  imagenes: { url: string; path: string }[];
}

// Interfaz para el valor de retorno de la acción
export interface FormState {
  success: boolean;
  message: string;
  post?: Post; // El post guardado es opcional
}


export async function getPosts(): Promise<Post[]> {
  try {
    const { firestore } = getAdminInstances();
    const postsSnapshot = await firestore.collection('posts').orderBy('fecha', 'desc').get();
    
    if (postsSnapshot.empty) return [];

    return postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        descripcion: data.descripcion,
        contenido: data.contenido || '',
        fecha: new Date(data.fecha.seconds * 1000).toISOString(),
        imagenes: data.imagenes || [],
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw new Error('No se pudieron obtener las publicaciones.');
  }
}

// ✅ FIX: La función ahora devuelve el post guardado
export async function createOrUpdatePost(formData: FormData): Promise<FormState> {
  const { firestore } = getAdminInstances();
  const storage = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

  const postId = formData.get('postId') as string | null;
  const rawData = {
    titulo: formData.get('titulo') as string,
    subtitulo: formData.get('subtitulo') as string,
    descripcion: formData.get('descripcion') as string,
    contenido: formData.get('contenido') as string || '',
  };

  try {
    const newImages: { url: string; path: string }[] = [];
    const files = formData.getAll('imagenes') as File[];

    for (const file of files) {
      if (file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const path = `posts/${Date.now()}-${file.name}`;
        const storageFile = storage.file(path);
        
        await storageFile.save(buffer, { metadata: { contentType: file.type } });
        await storageFile.makePublic();
        newImages.push({ url: storageFile.publicUrl(), path });
      }
    }

    let savedPostId = postId;
    if (postId) {
      const postRef = firestore.collection('posts').doc(postId);
      await postRef.update({
        ...rawData,
        ...(newImages.length > 0 && { imagenes: FieldValue.arrayUnion(...newImages) }),
      });
    } else {
      const newPostRef = await firestore.collection('posts').add({
        ...rawData,
        fecha: FieldValue.serverTimestamp(),
        imagenes: newImages,
      });
      savedPostId = newPostRef.id;
    }

    // Obtenemos el documento recién guardado para devolverlo
    const finalDoc = await firestore.collection('posts').doc(savedPostId!).get();
    const finalData = finalDoc.data()!;
    const savedPost: Post = {
        id: finalDoc.id,
        titulo: finalData.titulo,
        subtitulo: finalData.subtitulo,
        descripcion: finalData.descripcion,
        contenido: finalData.contenido || '',
        fecha: new Date(finalData.fecha.seconds * 1000).toISOString(),
        imagenes: finalData.imagenes || [],
    };

    revalidatePath('/dashboard/publicacion');
    return { success: true, message: 'Publicación guardada con éxito.', post: savedPost };
  } catch (error) {
    console.error('Error saving post:', error);
    return { success: false, message: 'Error al guardar la publicación.' };
  }
}

export async function deletePost(postId: string): Promise<{ success: boolean; message: string }> {
    try {
        const { firestore } = getAdminInstances();
        const storage = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
        const postRef = firestore.collection('posts').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) throw new Error('La publicación no existe.');

        const postData = postDoc.data() as Post;

        if (postData.imagenes?.length > 0) {
        for (const imagen of postData.imagenes) {
            if (imagen.path) await storage.file(imagen.path).delete().catch(err => console.error(`Failed to delete image ${imagen.path}:`, err));
        }
        }

        await postRef.delete();

        revalidatePath('/dashboard/publicacion');
        return { success: true, message: 'Publicación eliminada.' };
    } catch (error) {
        console.error('Error deleting post:', error);
        return { success: false, message: 'No se pudo eliminar la publicación.' };
    }
}
