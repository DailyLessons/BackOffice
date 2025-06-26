import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800/80 backdrop-blur-sm text-white py-3 px-4 flex justify-between items-center shadow-lg">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">DailyLessons Admin</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-white/80 hidden sm:inline-block">
          {user?.email || 'admin@dailylessons.com'}
        </span>
        <button 
          onClick={handleLogout} 
          className="px-4 py-2 bg-rose-deep hover:bg-rose-deep/80 text-white rounded-lg transition-colors flex items-center"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;