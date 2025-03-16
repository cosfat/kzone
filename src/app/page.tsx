'use client';

import { useEffect, useState } from 'react';
import { getEvents, getEventTypes } from '@/services/firebase';
import { Event, EventType } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<Record<number, EventType>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventsData = await getEvents();
        const eventTypesData = await getEventTypes();
        
        console.log('Ana sayfa - Etkinlikler:', eventsData);
        console.log('Ana sayfa - Etkinlik türleri:', eventTypesData);
        
        // EventTypes'ı id'ye göre map'leme
        const eventTypesMap: Record<number, EventType> = {};
        if (eventTypesData && typeof eventTypesData === 'object') {
          Object.values(eventTypesData).forEach((type: any) => {
            if (type && type.id) {
              eventTypesMap[type.id] = type;
            }
          });
        }
        
        console.log('Ana sayfa - Etkinlik türleri map:', eventTypesMap);
        
        setEvents(Array.isArray(eventsData) ? eventsData as Event[] : []);
        setEventTypes(eventTypesMap);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-12 text-center">Yaklaşan Etkinlikler</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : events.length === 0 ? (
        <p className="text-xl text-center">Henüz etkinlik bulunmamaktadır.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {events.map((event) => (
            <div 
              key={event.id} 
              className="bg-black bg-opacity-70 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                      {eventTypes[event.eventType]?.name || 'Diğer'}
                    </span>
                    <h2 className="text-xl font-bold">{event.venue}</h2>
                    <p className="text-gray-300">{event.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatDate(event.date)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    event.ticketStatus === 'Satışta' 
                      ? 'text-green-400' 
                      : event.ticketStatus === 'Tükendi' 
                        ? 'text-red-400' 
                        : 'text-yellow-400'
                  }`}>
                    {event.ticketStatus}
                  </span>
                  
                  {event.ticketLink && event.ticketStatus === 'Satışta' && (
                    <a 
                      href={event.ticketLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Bilet Al
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
