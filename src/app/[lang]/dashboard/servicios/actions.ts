'use server';

import { revalidatePath } from 'next/cache';
import { getAdminInstances } from '@/lib/firebase/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// 1. Define el tipado para un Servicio
export interface Service {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  fechaHora: string; // Se guardará como string en formato ISO
  activo: boolean;
}

// Interfaz para el estado del formulario que se devolverá
export interface FormState {
  success: boolean;
  message: string;
  service?: Service;
}

// --- FUNCIÓN PARA OBTENER TODOS LOS SERVICIOS ---
export async function getServices(): Promise<Service[]> {
  try {
    const { firestore } = getAdminInstances();
    const servicesSnapshot = await firestore.collection('services').orderBy('fechaHora', 'desc').get();
    
    if (servicesSnapshot.empty) {
      return [];
    }

    return servicesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        fechaHora: new Date(data.fechaHora.seconds * 1000).toISOString(),
        activo: data.activo,
      };
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    throw new Error('No se pudieron obtener los servicios.');
  }
}

// --- FUNCIÓN PARA CREAR O ACTUALIZAR UN SERVICIO ---
export async function createOrUpdateService(formData: FormData): Promise<FormState> {
  const { firestore } = getAdminInstances();
  const serviceId = formData.get('serviceId') as string | null;

  const rawData = {
    nombre: formData.get('nombre') as string,
    descripcion: formData.get('descripcion') as string,
    // Convertimos el precio a número, asegurándonos de que sea válido
    precio: parseFloat(formData.get('precio') as string) || 0,
    activo: formData.get('activo') === 'on', // El checkbox envía 'on' si está marcado
  };

  try {
    let savedServiceId = serviceId;

    if (serviceId) {
      // --- Lógica de Actualización ---
      const serviceRef = firestore.collection('services').doc(serviceId);
      await serviceRef.update({
        ...rawData,
        fechaHora: FieldValue.serverTimestamp(), // Actualiza la fecha en cada edición
      });
    } else {
      // --- Lógica de Creación ---
      const newServiceRef = await firestore.collection('services').add({
        ...rawData,
        fechaHora: FieldValue.serverTimestamp(),
      });
      savedServiceId = newServiceRef.id;
    }

    // Obtenemos el documento guardado para devolverlo y actualizar la UI en tiempo real
    const finalDoc = await firestore.collection('services').doc(savedServiceId!).get();
    const finalData = finalDoc.data()!;
    const savedService: Service = {
      id: finalDoc.id,
      nombre: finalData.nombre,
      descripcion: finalData.descripcion,
      precio: finalData.precio,
      fechaHora: new Date(finalData.fechaHora.seconds * 1000).toISOString(),
      activo: finalData.activo,
    };

    revalidatePath('/dashboard/servicios'); // Actualiza la caché de Next.js
    return { success: true, message: 'Servicio guardado con éxito.', service: savedService };
  } catch (error) {
    console.error('Error saving service:', error);
    return { success: false, message: 'Error al guardar el servicio.' };
  }
}

// --- FUNCIÓN PARA ELIMINAR UN SERVICIO ---
export async function deleteService(serviceId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { firestore } = getAdminInstances();
    await firestore.collection('services').doc(serviceId).delete();

    revalidatePath('/dashboard/servicios');
    return { success: true, message: 'Servicio eliminado.' };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, message: 'No se pudo eliminar el servicio.' };
  }
}
