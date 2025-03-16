import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-black bg-opacity-80 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-3xl font-bold">
          <Link href="/">
            KZONE PRODUCTIONS
          </Link>
        </div>
        
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-pink-400 transition-colors">
                Ana Sayfa
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link href="/admin" className="hover:text-pink-400 transition-colors">
                    Admin Panel
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => logout()} 
                    className="hover:text-pink-400 transition-colors"
                  >
                    Çıkış
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login" className="hover:text-pink-400 transition-colors">
                  Giriş
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 