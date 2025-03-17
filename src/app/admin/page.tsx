'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvents, getEventTypes, initializeEventTypes } from '@/services/firebase';
import { Event, EventType } from '@/types';
import EventForm from '@/components/EventForm';
import EventList from '@/components/EventList';

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<Record<number, EventType>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // EventTypes'ı başlat
        await initializeEventTypes();
        
        // Verileri getir
        const eventsData = await getEvents();
        const eventTypesData = await getEventTypes();
        
        console.log('Admin sayfası - Etkinlik türleri:', eventTypesData);
        
        // EventTypes'ı id'ye göre map'leme
        const eventTypesMap: Record<number, EventType> = {};
        if (eventTypesData && typeof eventTypesData === 'object') {
          Object.values(eventTypesData).forEach((type) => {
            if (type && typeof type === 'object' && 'id' in type && 'name' in type) {
              const eventType = type as unknown as EventType;
              eventTypesMap[eventType.id] = eventType;
            }
          });
        }
        
        console.log('Admin sayfası - Etkinlik türleri map:', eventTypesMap);
        
        setEvents(eventsData as Event[]);
        setEventTypes(eventTypesMap);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleFormSuccess = async () => {
    // Etkinlikleri yeniden yükle
    const eventsData = await getEvents();
    setEvents(eventsData as Event[]);
    setShowForm(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = async (event: Event) => {
    try {
      await handleFormSuccess();
      await handleFormSuccess();
    } catch (error: unknown) {
      console.error('Etkinlik eklenirken hata oluştu:', error);
      setError('Etkinlik eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={handleAddEvent}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Etkinlik Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="mb-8">
              <EventForm
                eventTypes={eventTypes}
                onClose={handleFormClose}
                onSuccess={handleFormSuccess}
                editEvent={editingEvent}
              />
            </div>
          )}

          <EventList
            events={events}
            eventTypes={eventTypes}
            onEdit={handleEditEvent}
            onDelete={handleFormSuccess}
          />
        </>
      )}
    </div>
  );
} 