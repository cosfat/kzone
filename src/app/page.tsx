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
          Object.values(eventTypesData).forEach((type) => {
            if (type && typeof type === 'object' && 'id' in type && 'name' in type) {
              const eventType = type as unknown as EventType;
              eventTypesMap[eventType.id] = eventType;
            }
          });
        }
        
        console.log('Ana sayfa - Etkinlik türleri map:', eventTypesMap);
        
        setEvents(Array.isArray(eventsData) ? eventsData as Event[] : []);
        setEventTypes(eventTypesMap);
      } catch (error: unknown) {
        console.error('Veri yüklenirken hata oluştu:', error);
        // Hata işleme
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
    } catch (error: unknown) {
      console.error('Tarih formatlanırken hata:', error);
      return dateString;
    }
  };

  const isEventPassed = (dateString: string) => {
    try {
      const eventDate = new Date(dateString);
      const today = new Date();
      return eventDate < today;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="flex flex-col items-center pt-8">
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : events.length === 0 ? (
        <p className="text-xl text-center">Henüz etkinlik bulunmamaktadır.</p>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-8 bg-[#393327] px-10 py-4 rounded-lg text-white uppercase">GÖSTERİ TARİHLERİ</h1>
          <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {events.map((event) => (
                    <tr 
                      key={event.id} 
                      className="border-b border-gray-700 hover:bg-[#191009] hover:bg-opacity-50"
                    >
                      <td className="py-3 px-4 font-medium">{formatDate(event.date)}</td>
                      <td className="py-3 px-4 font-medium">{event.venue}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold">
                            {eventTypes[event.eventType]?.name || 'Diğer'}
                          </span>
                          <span className="text-gray-300">{event.city}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isEventPassed(event.date) ? (
                          <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-xs uppercase font-bold">
                            GEÇTİ
                          </span>
                        ) : event.ticketStatus === 'Satışta' ? (
                          event.ticketLink ? (
                            <a 
                              href={event.ticketLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-red-600 hover:bg-red-700 !text-white px-4 py-2 rounded-md text-sm transition-colors uppercase font-bold"
                            >
                              BİLET
                            </a>
                          ) : (
                            <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs">
                              Satışta
                            </span>
                          )
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            event.ticketStatus === 'Tükendi' 
                              ? 'bg-red-900 text-red-300' 
                              : 'bg-yellow-900 text-yellow-300'
                          }`}>
                            {event.ticketStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
