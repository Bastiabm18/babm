'use client';

import { useState } from 'react';
import { Service } from '@/app/[lang]/dashboard/servicios/actions';
import ServiceForm from './ServiceForm';
import ServicesTable from './ServiceTable';
interface ServiceManagerProps {
  initialServices: Service[];
}

export default function ServiceManager({ initialServices }: ServiceManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Esta función actualiza el estado local para reflejar los cambios al instante.
  const handleServiceSaved = (savedService: Service) => {
    if (editingService) {
      // Si estábamos editando, reemplazamos el servicio antiguo por el nuevo.
      setServices(services.map(s => s.id === savedService.id ? savedService : s));
    } else {
      // Si es un servicio nuevo, lo añadimos al principio de la lista.
      setServices([savedService, ...services]);
    }
    setEditingService(null); // Limpia el formulario después de guardar.
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube al formulario para editar
  };

  const handleCancelEdit = () => {
    setEditingService(null);
  };

  return (
    <div className="space-y-8">
      <ServiceForm 
        editingService={editingService}
        onCancelEdit={handleCancelEdit}
        onServiceSaved={handleServiceSaved}
      />
      <ServicesTable 
        services={services}
        onEdit={handleEdit}
        onServiceDeleted={(serviceId) => setServices(services.filter(s => s.id !== serviceId))}
      />
    </div>
  );
}
