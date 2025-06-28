import React, { useState, useEffect } from 'react';
import { supabaseAdmin } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    videos: 0,
    revenue: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Utiliser supabaseAdmin au lieu de supabase.auth.admin
      if (supabaseAdmin) {
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        
        setStats(prev => ({
          ...prev,
          users: users?.users?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard DailyLessons</h1>
        <p className="text-white/70">Bienvenue dans votre panel d'administration</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-2">Utilisateurs</h3>
          <p className="text-3xl font-bold text-white">{stats.users}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-2">Cours</h3>
          <p className="text-3xl font-bold text-white">56</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <h3 className="text-white text-lg font-semibold mb-2">Vidéos</h3>
          <p className="text-3xl font-bold text-white">89</p>
        </div>
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Activité récente</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white">Nouvel utilisateur inscrit</span>
            <span className="text-white/70 text-sm">Il y a 2 minutes</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/10">
            <span className="text-white">Nouveau cours publié</span>
            <span className="text-white/70 text-sm">Il y a 1 heure</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-white">Paiement reçu</span>
            <span className="text-white/70 text-sm">Il y a 3 heures</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;