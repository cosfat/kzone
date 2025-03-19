'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Event, EventType } from '@/types';
import { addEvent, updateEvent } from '@/services/firebase';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface EventFormProps {
  eventTypes: Record<number, EventType>;
  onClose: () => void;
  onSuccess: () => void;
  editEvent: Event | null;
}

const EventForm: React.FC<EventFormProps> = ({ eventTypes, onClose, onSuccess, editEvent }) => {
  const [formData, setFormData] = useState<Omit<Event, 'id'> & { id?: string }>({
    eventType: 1,
    venue: '',
    city: '',
    date: new Date().toISOString().split('T')[0],
    ticketStatus: 'Satışta',
    ticketLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  useEffect(() => {
    if (editEvent) {
      setFormData({
        ...editEvent
      });
      setSelectedDate(editEvent.date ? new Date(editEvent.date) : new Date());
    }
    
    console.log('EventForm - Etkinlik türleri:', eventTypes);
  }, [editEvent, eventTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'eventType' ? parseInt(value, 10) : value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (editEvent) {
        // Güncelleme işlemi
        await updateEvent(editEvent.id, formData);
      } else {
        // Yeni etkinlik ekleme
        const newEvent: Event = {
          id: uuidv4(),
          ...formData as Omit<Event, 'id'>
        };
        await addEvent(newEvent);
      }
      onSuccess();
    } catch (error) {
      console.error('Etkinlik kaydedilirken hata oluştu:', error);
      setError('Etkinlik kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#191009] bg-opacity-70 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {editEvent ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium mb-1">
              Etkinlik Türü
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                backgroundSize: "20px",
                backgroundPosition: "calc(100% - 10px) center"
              }}
              required
            >
              {Object.keys(eventTypes).length > 0 ? (
                Object.values(eventTypes).map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))
              ) : (
                <>
                  <option value={1}>Ek İş</option>
                  <option value={2}>Still Standing</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium mb-1">
              Tarih
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
              calendarClassName="bg-gray-800 text-white border border-gray-700 shadow-lg rounded-md"
              showPopperArrow={false}
              popperClassName="date-picker-popper"
              dayClassName={_ => 
                "hover:bg-pink-700 rounded-full mx-1 text-center"
              }
              required
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium mb-1">
              Mekan
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1">
              Şehir
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="ticketStatus" className="block text-sm font-medium mb-1">
              Bilet Durumu
            </label>
            <select
              id="ticketStatus"
              name="ticketStatus"
              value={formData.ticketStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer bg-no-repeat bg-right pr-10"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                backgroundSize: "20px", 
                backgroundPosition: "calc(100% - 10px) center"
              }}
              required
            >
              <option value="Satışta">Satışta</option>
              <option value="Tükendi">Tükendi</option>
              <option value="Yakında">Yakında</option>
            </select>
          </div>

          <div>
            <label htmlFor="ticketLink" className="block text-sm font-medium mb-1">
              Bilet Linki
            </label>
            <input
              type="url"
              id="ticketLink"
              name="ticketLink"
              value={formData.ticketLink}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? 'Kaydediliyor...' : editEvent ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventForm; 