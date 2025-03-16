import React, { useState } from 'react';
import { Event, EventType } from '@/types';
import { deleteEvent } from '@/services/firebase';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface EventListProps {
  events: Event[];
  eventTypes: Record<number, EventType>;
  onEdit: (event: Event) => void;
  onDelete: () => void;
}

const EventList: React.FC<EventListProps> = ({ events, eventTypes, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      setLoading(true);
      setDeleteId(id);
      
      try {
        await deleteEvent(id);
        onDelete();
      } catch (error) {
        console.error('Etkinlik silinirken hata oluştu:', error);
        alert('Etkinlik silinirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
        setDeleteId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl">Henüz etkinlik bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="bg-black bg-opacity-70 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Etkinlikler</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-4 text-left">Etkinlik Türü</th>
              <th className="py-3 px-4 text-left">Mekan</th>
              <th className="py-3 px-4 text-left">Şehir</th>
              <th className="py-3 px-4 text-left">Tarih</th>
              <th className="py-3 px-4 text-left">Bilet Durumu</th>
              <th className="py-3 px-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr 
                key={event.id} 
                className="border-b border-gray-800 hover:bg-gray-900"
              >
                <td className="py-3 px-4">
                  {eventTypes[event.eventType]?.name || 'Diğer'}
                </td>
                <td className="py-3 px-4">{event.venue}</td>
                <td className="py-3 px-4">{event.city}</td>
                <td className="py-3 px-4">{formatDate(event.date)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    event.ticketStatus === 'Satışta' 
                      ? 'bg-green-900 text-green-300' 
                      : event.ticketStatus === 'Tükendi' 
                        ? 'bg-red-900 text-red-300' 
                        : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {event.ticketStatus}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEdit(event)}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={loading && deleteId === event.id}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50"
                  >
                    {loading && deleteId === event.id ? 'Siliniyor...' : 'Sil'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventList; 