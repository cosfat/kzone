import { ref, set, get, remove, update, query, orderByChild } from 'firebase/database';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Event, EventType } from '@/types';

// Event işlemleri
export const addEvent = async (event: Event) => {
  return set(ref(db, `eventList/${event.id}`), event);
};

export const getEvents = async () => {
  try {
    console.log('Etkinlikler getiriliyor...');
    const eventsRef = query(ref(db, 'eventList'), orderByChild('date'));
    const snapshot = await get(eventsRef);
    
    // Ayarları getir
    const settings = await getSettings();
    const sortOrder = settings.homepageSortOrder || 'desc';
    const hideOldEvents = settings.hideOldEvents || false;
    
    if (snapshot.exists()) {
      const events = snapshot.val();
      console.log('Etkinlikler (ham veri):', events);
      
      // Object.values ile dizi haline getir
      const eventsArray = Object.values(events) as unknown[];
      console.log('Etkinlikler (dizi):', eventsArray);
      
      // Eski etkinlikleri filtrele (eğer hideOldEvents etkinse)
      let filteredEvents = eventsArray;
      if (hideOldEvents) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        
        filteredEvents = eventsArray.filter((event) => {
          const eventObj = event as { date: string };
          const eventDate = new Date(eventObj.date);
          return eventDate >= oneMonthAgo;
        });
      }
      
      // Tarihe göre sırala
      const sortedEvents = filteredEvents.sort((a, b) => {
        const aObj = a as { date: string };
        const bObj = b as { date: string };
        const dateA = new Date(aObj.date).getTime();
        const dateB = new Date(bObj.date).getTime();
        
        // sortOrder değerine göre sıralama yap
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
      
      console.log('Etkinlikler (sıralı):', sortedEvents);
      return sortedEvents;
    } else {
      console.log('Etkinlik bulunamadı');
    }
  } catch (error: unknown) {
    console.error('Etkinlikler getirilirken hata:', error);
  }
  
  return [];
};

export const getEvent = async (id: string) => {
  const snapshot = await get(ref(db, `eventList/${id}`));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

export const updateEvent = async (id: string, data: Partial<Event>) => {
  return update(ref(db, `eventList/${id}`), data);
};

export const deleteEvent = async (id: string) => {
  return remove(ref(db, `eventList/${id}`));
};

// EventType işlemleri
export const getEventTypes = async () => {
  try {
    console.log('Etkinlik türleri getiriliyor...');
    const snapshot = await get(ref(db, 'eventTypes'));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Etkinlik türleri:', data);
      return data;
    } else {
      console.log('Etkinlik türleri bulunamadı, başlatılıyor...');
      await initializeEventTypes();
      
      // Tekrar deneyelim
      const newSnapshot = await get(ref(db, 'eventTypes'));
      if (newSnapshot.exists()) {
        const data = newSnapshot.val();
        console.log('Etkinlik türleri başlatıldı:', data);
        return data;
      }
    }
  } catch (error: unknown) {
    console.error('Etkinlik türleri getirilirken hata:', error);
  }
  
  // Varsayılan değerleri döndür
  return {
    1: { id: 1, name: "Ek İş" },
    2: { id: 2, name: "Still Standing" }
  };
};

export const initializeEventTypes = async () => {
  const eventTypes: EventType[] = [
    { id: 1, name: "Ek İş" },
    { id: 2, name: "Still Standing" }
  ];
  
  for (const type of eventTypes) {
    await set(ref(db, `eventTypes/${type.id}`), type);
  }
};

// Kullanıcı işlemleri
export const initializeAdmin = async () => {
  try {
    // Firebase Authentication için admin kullanıcısı oluştur
    await createUserWithEmailAndPassword(auth, 'admin@kzone.com', 'kzoneevents991155');
    
    // Realtime Database'e de kullanıcı bilgilerini kaydet
    await set(ref(db, 'users/admin'), {
      username: 'admin',
      role: 'admin'
    });
    
    return true;
  } catch (error: unknown) {
    // Kullanıcı zaten varsa hata verme
    if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/email-already-in-use') {
      return true;
    }
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
    return false;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: unknown) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

// Ayarlar işlemleri
export const getSettings = async () => {
  try {
    console.log('Ayarlar getiriliyor...');
    const snapshot = await get(ref(db, 'settings'));
    
    if (snapshot.exists()) {
      const settings = snapshot.val();
      console.log('Ayarlar:', settings);
      return settings;
    } else {
      console.log('Ayarlar bulunamadı, varsayılan ayarlar oluşturuluyor...');
      const defaultSettings = {
        homepageSortOrder: 'desc', // varsayılan: yeniden eskiye
        hideOldEvents: false // varsayılan: eski etkinlikleri göster
      };
      await updateSettings(defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Ayarlar getirilirken hata:', error);
    return {
      homepageSortOrder: 'desc', // hata durumunda varsayılan değer
      hideOldEvents: false
    };
  }
};

export const updateSettings = async (settings: Record<string, any>) => {
  return update(ref(db, 'settings'), settings);
}; 