import React from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="ml-64 flex-1 animated-gradient flex flex-col"> {/* Remplacé bg-gray-100 par animated-gradient */}
          <div className="p-6 flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;