import React from 'react';
import { FaInstagram, FaYoutube, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-black bg-opacity-80 text-white py-8 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col items-center">
          <div className="flex space-x-6 mb-4">
            <a 
              href="https://www.instagram.com/kzoneproductions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl hover:text-pink-400 transition-colors"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://www.youtube.com/kzoneproductions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-2xl hover:text-pink-400 transition-colors"
            >
              <FaYoutube />
            </a>
            <a 
              href="mailto:info@kzone.com.tr" 
              className="text-2xl hover:text-pink-400 transition-colors"
            >
              <FaEnvelope />
            </a>
          </div>
          <div className="text-sm text-gray-400">
            &copy; {currentYear} kzone.com.tr - Tüm Hakları Saklıdır
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 