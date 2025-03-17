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
    
    if (snapshot.exists()) {
      const events = snapshot.val();
      console.log('Etkinlikler (ham veri):', events);
      
      // Object.values ile dizi haline getir
      const eventsArray = Object.values(events) as unknown[];
      console.log('Etkinlikler (dizi):', eventsArray);
      
      // Tarihe göre sırala
      const sortedEvents = eventsArray.sort((a, b) => {
        const aObj = a as { date: string };
        const bObj = b as { date: string };
        const dateA = new Date(aObj.date).getTime();
        const dateB = new Date(bObj.date).getTime();
        return dateB - dateA;
      });
      
      console.log('Etkinlikler (sıralı):', sortedEvents);
      return sortedEvents;
    } else {
      console.log('Etkinlik bulunamadı');
    }
  } catch (error) {
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
  } catch (error) {
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
  } catch (error: any) {
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
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
}; 