'use server';

import { revalidatePath } from 'next/cache';
import { getAdminInstances } from '@/lib/firebase/firebase-admin'; // Revisa que la ruta sea correcta
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

export interface FormState {
  success: boolean;
  message: string;
  post?: Post;
}


export async function handleDownload(
  url: string,
  fileName: string = 'archivo_descarga'
): Promise<void> {
  if (!url) {
    console.error("La URL para la descarga está vacía.");
    return;
  }

  try {
    // 1. Obtener el recurso (imagen) como un Blob
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error al obtener el recurso: ${response.statusText}`);
    }
    const blob = await response.blob();

    // 2. Crear una URL local temporal para el Blob
    const blobUrl = window.URL.createObjectURL(blob);

    // 3. Crear un enlace (<a>) en el DOM para forzar la descarga
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', fileName); // Establece el nombre del archivo
    
    // 4. Ejecutar la descarga
    document.body.appendChild(link);
    link.click();

    // 5. Limpieza (Importante para evitar fugas de memoria)
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

  } catch (error) {
    console.error("Error al ejecutar la descarga:", error);
    // Opcional: Podrías usar una librería de notificaciones aquí
    alert("Ocurrió un error al intentar descargar el archivo."); 
  }
}

/**
 * Obtiene todos los posts de la colección, ordenados por fecha descendente.
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const { firestore } = getAdminInstances();
    const postsSnapshot = await firestore.collection('posts').orderBy('fecha', 'desc').get();
    
    if (postsSnapshot.empty) return [];

    return postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        titulo: data.titulo || '',
        subtitulo: data.subtitulo || '',
        descripcion: data.descripcion || '',
        contenido: data.contenido || '',
        fecha: new Date(data.fecha._seconds * 1000).toISOString(),
        imagenes: data.imagenes || [],
      };
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

/**
 * Obtiene un único post por su ID.
 * @param id El ID del documento del post a buscar.
 * @returns El objeto del post o null si no se encuentra.
 */
export async function getPostById(id: string): Promise<Post | null> {
    try {
      const { firestore } = getAdminInstances();
      const postDoc = await firestore.collection('posts').doc(id).get();
  
      if (!postDoc.exists) {
        console.log('No se encontró un post con el ID:', id);
        return null;
      }
  
      const data = postDoc.data()!;
      return {
        id: postDoc.id,
        titulo: data.titulo || '',
        subtitulo: data.subtitulo || '',
        descripcion: data.descripcion || '',
        contenido: data.contenido || '',
        fecha: new Date(data.fecha._seconds * 1000).toISOString(),
        imagenes: data.imagenes || [],
      };
    } catch (error) {
      console.error(`Error al obtener el post con ID ${id}:`, error);
      return null;
    }
  }

/**
 * Crea o actualiza un post en Firestore y sube las imágenes a Storage.
 */
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

/**
 * Elimina un post de Firestore y sus imágenes asociadas de Storage.
 */
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