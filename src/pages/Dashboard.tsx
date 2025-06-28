import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    videos: 0,
    sections: 0,
    administrators: 0,
    teachers: 0,
    students: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  // Gestion de la structure roles (tableau ou objet)
  const getUserRole = (user: any): string => {
    if (!user.roles) return '';
    
    if (Array.isArray(user.roles)) {
      return user.roles[0]?.role || '';
    }
    
    return user.roles.role || '';
  };

  const fetchAllStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupération des données avec jointures
      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select(`
          id,
          user_id,
          role_id,
          email,
          roles:role_id (
            id,
            role
          )
        `);

      if (usersError) throw usersError;

      const { data: coursesData, error: coursesError } = await supabase
        .from('Lessons')
        .select('id, titre, created_at')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('Sections')
        .select('id, titre, created_at')
        .order('created_at', { ascending: false });

      if (sectionsError) throw sectionsError;

      const { data: videosData, error: videosError } = await supabase
        .from('Videos')
        .select('id, titre, created_at')
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;

      const totalUsers = usersData?.length || 0;
      const totalCourses = coursesData?.length || 0;
      const totalSections = sectionsData?.length || 0;
      const totalVideos = videosData?.length || 0;

      // Comptage des rôles spécifiques
      const administrators = usersData?.filter(user => 
        getUserRole(user).toLowerCase() === 'administrateur'
      ).length || 0;

      const teachers = usersData?.filter(user => 
        getUserRole(user).toLowerCase() === 'enseignant'
      ).length || 0;

      const students = usersData?.filter(user => 
        getUserRole(user).toLowerCase() === 'apprenant'
      ).length || 0;

      // Construction de l'activité récente
      const activities = [];

      if (coursesData && coursesData.length > 0) {
        activities.push({
          type: 'course',
          message: `Nouveau cours créé: "${coursesData[0].titre}"`,
          time: new Date(coursesData[0].created_at).toLocaleString('fr-FR'),
          icon: 'fas fa-graduation-cap',
          color: 'text-blue-300'
        });
      }

      if (videosData && videosData.length > 0) {
        activities.push({
          type: 'video',
          message: `Nouvelle vidéo ajoutée: "${videosData[0].titre}"`,
          time: new Date(videosData[0].created_at).toLocaleString('fr-FR'),
          icon: 'fas fa-video',
          color: 'text-purple-300'
        });
      }

      if (sectionsData && sectionsData.length > 0) {
        activities.push({
          type: 'section',
          message: `Nouvelle section créée: "${sectionsData[0].titre}"`,
          time: new Date(sectionsData[0].created_at).toLocaleString('fr-FR'),
          icon: 'fas fa-list-alt',
          color: 'text-green-300'
        });
      }

      // Tri chronologique des activités
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setStats({
        users: totalUsers,
        courses: totalCourses,
        videos: totalVideos,
        sections: totalSections,
        administrators,
        teachers,
        students
      });

      setRecentActivity(activities.slice(0, 5)); 

    } catch (err: any) {
      setError('Erreur lors du chargement des statistiques: ' + err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcul du temps écoulé avec validation
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-xl">Chargement du dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-400/30 border border-red-400 text-white px-4 py-3 rounded mb-4">
        {error}
        <button 
          onClick={fetchAllStats}
          className="ml-2 px-3 py-1 bg-red-400/20 rounded hover:bg-red-400/30 transition-colors text-xs"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard DailyLessons</h1>
        <p className="text-white/70">Bienvenue dans votre panel d'administration</p>
      </div>
      
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Utilisateurs</h3>
              <p className="text-3xl font-bold text-white">{stats.users}</p>
            </div>
            <i className="fas fa-users text-3xl text-blue-300 opacity-50"></i>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Cours</h3>
              <p className="text-3xl font-bold text-white">{stats.courses}</p>
            </div>
            <i className="fas fa-graduation-cap text-3xl text-green-300 opacity-50"></i>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Vidéos</h3>
              <p className="text-3xl font-bold text-white">{stats.videos}</p>
            </div>
            <i className="fas fa-video text-3xl text-purple-300 opacity-50"></i>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white text-lg font-semibold mb-2">Sections</h3>
              <p className="text-3xl font-bold text-white">{stats.sections}</p>
            </div>
            <i className="fas fa-list-alt text-3xl text-yellow-300 opacity-50"></i>
          </div>
        </div>
      </div>

      {/* Statistiques par rôles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-crown text-2xl text-red-300 mr-3"></i>
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">Administrateurs</h3>
              <p className="text-2xl font-bold text-white">{stats.administrators}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-chalkboard-teacher text-2xl text-purple-300 mr-3"></i>
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">Enseignants</h3>
              <p className="text-2xl font-bold text-white">{stats.teachers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-user-graduate text-2xl text-green-300 mr-3"></i>
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">Apprenants</h3>
              <p className="text-2xl font-bold text-white">{stats.students}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Activité récente */}
      <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Activité récente</h2>
          <button 
            onClick={fetchAllStats}
            className="px-3 py-1 bg-blue-400/20 text-blue-300 rounded hover:bg-blue-400/30 transition-colors text-sm flex items-center"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Actualiser
          </button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
                <div className="flex items-center">
                  <i className={`${activity.icon} ${activity.color} mr-3`}></i>
                  <span className="text-white">{activity.message}</span>
                </div>
                <span className="text-white/70 text-sm">{getTimeAgo(activity.time)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/70">
              <i className="fas fa-clock text-4xl text-white/30 mb-4"></i>
              <p>Aucune activité récente</p>
              <p className="text-sm">Les nouvelles activités apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Résumé rapide */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">Résumé de la plateforme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">Contenu</h4>
            <ul className="space-y-1 text-white/70">
              <li>• {stats.courses} cours disponibles</li>
              <li>• {stats.sections} sections organisées</li>
              <li>• {stats.videos} vidéos publiées</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Communauté</h4>
            <ul className="space-y-1 text-white/70">
              <li>• {stats.students} apprenants inscrits</li>
              <li>• {stats.teachers} enseignants actifs</li>
              <li>• {stats.administrators} administrateur{stats.administrators > 1 ? 's' : ''}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;