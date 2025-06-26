import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/80 backdrop-blur-sm text-white py-4 mt-auto w-full">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          <p>&copy; 2025 Admin Panel Dailylessons.</p>
        </div>
        <div>
          <nav className="flex space-x-6">
            <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;