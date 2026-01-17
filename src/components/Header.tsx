'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#191009] bg-opacity-80 text-white py-4">
      {user && (
        <div className="container mx-auto flex justify-end mb-4">
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link href="/admin" className="hover:text-pink-400 transition-colors !text-white">
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
            </ul>
          </nav>
        </div>
      )}
      <div className="container mx-auto flex items-center justify-center">
        <div className="text-2xl font-bold">
          <Link href="/" className="px-4 py-2 rounded !text-white tracking-widest block" style={{ backgroundColor: '#3e2c24' }}>
            KZONE PRODUCTION
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 