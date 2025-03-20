'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getEvents, getEventTypes, initializeEventTypes, getSettings, updateSettings, updateEventsVisibility, deleteEvents } from '@/services/firebase';
import { Event, EventType } from '@/types';
import EventForm from '@/components/EventForm';
import EventList from '@/components/EventList';

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventTypes, setEventTypes] = useState<Record<number, EventType>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [settings, setSettings] = useState<{ 
    homepageSortOrder: string;
    hideOldEvents: boolean;
  }>({ 
    homepageSortOrder: 'desc',
    hideOldEvents: false
  });
  const [savingSettings, setSavingSettings] = useState(false);
  
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
        const eventsData = await getEvents(true); // includeHidden=true ile tüm etkinlikleri getir
        const eventTypesData = await getEventTypes();
        const settingsData = await getSettings();
        
        console.log('Admin sayfası - Ayarlar:', settingsData);
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
        
        // Ayarları güvenli bir şekilde ayarla (undefined durumlarına karşı koruma)
        if (settingsData) {
          setSettings({
            homepageSortOrder: settingsData.homepageSortOrder || 'desc',
            hideOldEvents: settingsData.hideOldEvents === true ? true : false
          });
        }
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
    const eventsData = await getEvents(true); // includeHidden=true - admin panelinde tüm etkinlikleri göster
    setEvents(eventsData as Event[]);
    setShowForm(false);
    setEditingEvent(null);
  };
  
  const handleSettingsChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox değeri için checked kullan, diğerleri için value
    const updatedValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;
    
    setSettings({
      ...settings,
      [name]: updatedValue
    });
  };
  
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSettings(settings);
      alert('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      alert('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBulkVisibilityChange = async (eventIds: string[], isVisible: boolean) => {
    try {
      await updateEventsVisibility(eventIds, isVisible);
      // Etkinlikleri yeniden yükle
      const eventsData = await getEvents(true); // includeHidden=true - admin panelinde tüm etkinlikleri göster
      setEvents(eventsData as Event[]);
    } catch (error) {
      console.error('Etkinliklerin görünürlüğü değiştirilirken hata:', error);
      throw error;
    }
  };

  const handleBulkDelete = async (eventIds: string[]) => {
    try {
      await deleteEvents(eventIds);
      // Etkinlikleri yeniden yükle
      const eventsData = await getEvents(true); // includeHidden=true - admin panelinde tüm etkinlikleri göster
      setEvents(eventsData as Event[]);
    } catch (error) {
      console.error('Etkinlikler toplu silinirken hata:', error);
      throw error;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col mt-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <button
          onClick={handleAddEvent}
          className="text-white px-4 py-2 rounded-md transition-colors"
        >
          Yeni Etkinlik Ekle
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      ) : (
        <>
          {/* Ayarlar Bölümü */}
          <div className="bg-[#191009] bg-opacity-70 p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-4">Site Ayarları</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="homepageSortOrder" className="block text-sm font-medium mb-2">
                  Ana Sayfa Etkinlik Sıralama Düzeni
                </label>
                <select
                  id="homepageSortOrder"
                  name="homepageSortOrder"
                  value={settings.homepageSortOrder}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 appearance-none cursor-pointer bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23d1d5db'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundSize: "20px",
                    backgroundPosition: "calc(100% - 10px) center"
                  }}
                >
                  <option value="desc">Yeni Tarihten Eski Tarihe</option>
                  <option value="asc">Eski Tarihten Yeni Tarihe</option>
                </select>
              </div>
              
              <div>
                <div className="flex items-center">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="hideOldEvents"
                      name="hideOldEvents"
                      checked={settings.hideOldEvents}
                      onChange={handleSettingsChange}
                      className="h-5 w-5 rounded border-gray-700 text-pink-600 bg-gray-800 focus:ring-pink-600 focus:ring-offset-gray-800 focus:ring-offset-2 transition-all cursor-pointer"
                    />
                    <label htmlFor="hideOldEvents" className="ml-3 text-sm font-medium cursor-pointer select-none">
                      1 Aydan Eski Etkinlikleri Ana Sayfada Gizle
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={saveSettings}
                disabled={savingSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                {savingSettings ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </div>
          
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
            onBulkVisibilityChange={handleBulkVisibilityChange}
            onBulkDelete={handleBulkDelete}
          />
        </>
      )}
    </div>
  );
} 