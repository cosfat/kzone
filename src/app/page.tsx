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
    } catch (error: unknown) {
      console.error('Tarih kontrolü yapılırken hata:', error);
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
          <h1 className="text-2xl font-bold mb-8 rounded-lg text-white uppercase tracking-widest">GÖSTERİ TARİHLERİ</h1>
          <div className="w-full rounded-lg overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {events.map((event) => (
                    <tr 
                      key={event.id} 
                      className="border-b border-gray-700 hover:bg-[#191009] hover:bg-opacity-50 max-md:flex max-md:flex-col md:table-row max-md:mb-4 md:mb-0 md:bg-transparent"
                    >
                      <td className="py-2 md:py-3 px-4 font-medium max-md:flex-1 md:flex-none max-md:border-b-0 max-md:text-center">{formatDate(event.date)}</td>
                      <td className="py-2 md:py-3 px-4 font-medium max-md:flex-1 md:flex-none max-md:border-b-0 max-md:text-center">{event.venue}</td>
                      <td className="py-2 md:py-3 px-4 max-md:flex-1 md:flex-none max-md:border-b-0 max-md:text-center">
                        <div className="flex flex-col max-md:items-center">
                          <span className="font-bold">
                            {eventTypes[event.eventType]?.name || 'Diğer'}
                          </span>
                          <span className="text-gray-300">{event.city}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-md:text-center md:text-right max-md:w-full md:w-auto">
                        {isEventPassed(event.date) ? (
                          <span className="bg-gray-800 text-gray-400 px-3 py-1 text-xs uppercase font-bold max-md:inline-block max-md:w-full md:w-auto">
                            GEÇTİ
                          </span>
                        ) : event.ticketStatus === 'Satışta' ? (
                          event.ticketLink ? (
                            <a 
                              href={event.ticketLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{backgroundColor: 'white', color: 'black'}}
                              className="px-4 max-md:py-3 md:py-3 max-md:text-base md:text-sm transition-colors uppercase font-bold max-md:block md:inline-block max-md:w-full md:w-auto max-md:mt-1 md:mt-0 max-md:rounded md:rounded-none hover:bg-gray-200 md:px-6"
                            >
                              BİLET
                            </a>
                          ) : (
                            <span className="bg-green-900 text-green-300 px-2 py-1 rounded-full text-xs max-md:inline-block max-md:w-full md:w-auto">
                              Satışta
                            </span>
                          )
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs max-md:inline-block max-md:w-full md:w-auto ${
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
