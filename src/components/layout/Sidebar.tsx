import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-gray-800 text-white w-64 flex flex-col h-screen fixed">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-xl font-bold">Admin Panel</h3>
      </div>
      <div className="flex-grow overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-violet-deep text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`
              }
            >
              <i className="fas fa-home mr-3"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/users" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-violet-deep text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`
              }
            >
              <i className="fas fa-users mr-3"></i>
              <span>Utilisateurs</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/cours" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-violet-deep text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`
              }
            >
              <i className="fas fa-graduation-cap mr-3"></i>
              <span>Cours</span>
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/video" 
              className={({ isActive }: { isActive: boolean }) => 
                `flex items-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-violet-deep text-white' 
                    : 'hover:bg-gray-700 text-gray-300 hover:text-white'
                }`
              }
            >
              <i className="fas fa-video mr-3"></i>
              <span>Vidéos</span>
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>© 2025 DailyLessons</p>
      </div>
    </div>
  );
};

export default Sidebar;