import { ref, set, get, remove, update, query, orderByChild } from 'firebase/database';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Event, EventType } from '@/types';

// Event işlemleri
export const addEvent = async (event: Event) => {
  return set(ref(db, `eventList/${event.id}`), event);
};

export const getEvents = async () => {
  const eventsRef = query(ref(db, 'eventList'), orderByChild('date'));
  const snapshot = await get(eventsRef);
  
  if (snapshot.exists()) {
    const events = snapshot.val();
    return Object.values(events).sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
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
  const snapshot = await get(ref(db, 'eventTypes'));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return [];
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
    if (error.code === 'auth/email-already-in-use') {
      return true;
    }
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
    return false;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Admin kullanıcısı için sabit kontrol
    if (email === 'admin@kzone.com' && password === 'kzoneevents991155') {
      try {
        return await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // Eğer kullanıcı yoksa oluştur
        if (error.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, email, password);
          // Yeniden giriş yap
          return await signInWithEmailAndPassword(auth, email, password);
        }
        throw error;
      }
    } else {
      // Normal giriş işlemi
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    }
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
}; 