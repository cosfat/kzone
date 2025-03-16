'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createAdminUser = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Firebase Authentication için admin kullanıcısı oluştur
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@kzone.com', 
        'kzoneevents991155'
      );
      
      // Realtime Database'e de kullanıcı bilgilerini kaydet
      await set(ref(db, 'users/admin'), {
        username: 'admin',
        role: 'admin'
      });
      
      setResult('Admin kullanıcısı başarıyla oluşturuldu!');
    } catch (error: any) {
      console.error('Admin kullanıcısı oluşturulurken hata:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setResult('Admin kullanıcısı zaten var. Giriş yapabilirsiniz.');
      } else {
        setError(`Hata: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="bg-black bg-opacity-70 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Kullanıcısı Oluştur</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {result && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
            {result}
          </div>
        )}
        
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center">
            Bu sayfa, Firebase Authentication'da admin kullanıcısı oluşturmak için kullanılır.
          </p>
          
          <button
            onClick={createAdminUser}
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İşlem Yapılıyor...' : 'Admin Kullanıcısı Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
} 