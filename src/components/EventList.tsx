'use client';

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
  onBulkVisibilityChange?: (eventIds: string[], isVisible: boolean) => void;
}

const EventList: React.FC<EventListProps> = ({ 
  events, 
  eventTypes, 
  onEdit, 
  onDelete,
  onBulkVisibilityChange 
}) => {
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

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
    } catch (error: unknown) {
      console.error('Tarih formatlanırken hata:', error);
      return dateString;
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEvents(events.map(event => event.id));
    } else {
      setSelectedEvents([]);
    }
  };

  const handleSelectEvent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEvents([...selectedEvents, id]);
    } else {
      setSelectedEvents(selectedEvents.filter(eventId => eventId !== id));
    }
  };

  const handleBulkVisibilityChange = async (isVisible: boolean) => {
    if (selectedEvents.length === 0) {
      alert('Lütfen en az bir etkinlik seçin');
      return;
    }
    
    if (onBulkVisibilityChange) {
      setBulkActionLoading(true);
      try {
        await onBulkVisibilityChange(selectedEvents, isVisible);
        setSelectedEvents([]);
        alert(`Seçilen etkinliklerin görünürlüğü ${isVisible ? 'açıldı' : 'kapatıldı'}`);
      } catch (error) {
        console.error('Etkinlik görünürlüğü güncellenirken hata:', error);
        alert('Etkinlik görünürlüğü değiştirilirken bir hata oluştu');
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  if (events.length === 0) {
    return (
      <div className="bg-[#191009] bg-opacity-70 p-6 rounded-lg shadow-lg text-center">
        <p className="text-xl">Henüz etkinlik bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#191009] bg-opacity-70 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Etkinlikler</h2>
        
        {selectedEvents.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{selectedEvents.length} etkinlik seçildi</span>
            <button
              onClick={() => handleBulkVisibilityChange(true)}
              disabled={bulkActionLoading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              Göster
            </button>
            <button
              onClick={() => handleBulkVisibilityChange(false)}
              disabled={bulkActionLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
            >
              Gizle
            </button>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-3 px-2 text-left">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={selectedEvents.length === events.length && events.length > 0}
                  className="h-5 w-5 rounded border-gray-700 text-pink-600 bg-gray-800 focus:ring-pink-600 focus:ring-offset-gray-800 focus:ring-offset-2 transition-all cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 text-left">Etkinlik Türü</th>
              <th className="py-3 px-4 text-left">Mekan</th>
              <th className="py-3 px-4 text-left">Şehir</th>
              <th className="py-3 px-4 text-left">Tarih</th>
              <th className="py-3 px-4 text-left">Bilet Durumu</th>
              <th className="py-3 px-4 text-center">Anasayfa</th>
              <th className="py-3 px-4 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr 
                key={event.id} 
                className="border-b border-gray-800 hover:bg-gray-900"
              >
                <td className="py-3 px-2">
                  <input 
                    type="checkbox" 
                    checked={selectedEvents.includes(event.id)}
                    onChange={(e) => handleSelectEvent(event.id, e.target.checked)}
                    className="h-5 w-5 rounded border-gray-700 text-pink-600 bg-gray-800 focus:ring-pink-600 focus:ring-offset-gray-800 focus:ring-offset-2 transition-all cursor-pointer"
                  />
                </td>
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
                <td className="py-3 px-4 text-center">
                  {event.isVisible === false ? (
                    <div className="flex justify-center" title="Anasayfada gizli">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex justify-center" title="Anasayfada görünür">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </div>
                  )}
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