import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Video {
  id: string;
  section_id: string;
  created_at: string;
  url: string;
  titre: string;
  section?: {
    id: string;
    titre: string;
    lesson?: {
      id: string;
      titre: string;
    };
  };
}

interface Section {
  id: string;
  lesson_id: string;
  titre: string;
  lesson?: {
    id: string;
    titre: string;
  };
}

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVideos();
    fetchSections();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // Récupérer les vidéos avec les sections et cours
      const { data: videosData, error: videosError } = await supabase
        .from('Videos')
        .select(`
          *,
          section:section_id (
            id,
            titre,
            lesson:lesson_id (
              id,
              titre
            )
          )
        `)
        .order('created_at', { ascending: false });
      
      if (videosError) {
        setError('Erreur lors de la récupération des vidéos: ' + videosError.message);
        console.error('Error fetching videos:', videosError);
        return;
      }

      setVideos(videosData || []);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('Sections')
        .select(`
          *,
          lesson:lesson_id (
            id,
            titre
          )
        `)
        .order('titre', { ascending: true });
      
      if (sectionsError) {
        console.error('Error fetching sections:', sectionsError);
        return;
      }

      setSections(sectionsData || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (video: Video) => {
    setEditingVideo({ ...video });
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingVideo({
      id: '',
      section_id: '',
      titre: '',
      url: '',
      created_at: new Date().toISOString()
    });
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingVideo) return;
    
    try {
      setSaving(true);
      
      if (isCreateMode) {
        // Créer une nouvelle vidéo
        const { error } = await supabase
          .from('Videos')
          .insert({
            section_id: editingVideo.section_id,
            titre: editingVideo.titre,
            url: editingVideo.url
          });
        
        if (error) {
          setError('Erreur lors de la création: ' + error.message);
          return;
        }
      } else {
        // Modifier une vidéo existante
        const { error } = await supabase
          .from('Videos')
          .update({
            section_id: editingVideo.section_id,
            titre: editingVideo.titre,
            url: editingVideo.url
          })
          .eq('id', editingVideo.id);
        
        if (error) {
          setError('Erreur lors de la sauvegarde: ' + error.message);
          return;
        }
      }

      await fetchVideos();
      setIsModalOpen(false);
      setEditingVideo(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return;
    
    try {
      const { error } = await supabase
        .from('Videos')
        .delete()
        .eq('id', videoId);
      
      if (error) {
        setError('Erreur lors de la suppression: ' + error.message);
        return;
      }

      await fetchVideos();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Error:', err);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingVideo(null);
    setError(null);
  };

  const getVideoThumbnail = (url: string) => {
    // Extraire l'ID YouTube si c'est une URL YouTube (on verra plus tard pour d'autres plateformes)
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(youtubeRegex);
    if (match) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-xl">Chargement des vidéos...</div>
      </div>
    );
  }

  if (error && !isModalOpen) {
    return (
      <div className="bg-red-400/30 border border-red-400 text-white px-4 py-3 rounded mb-4">
        {error}
        <div className="mt-2 text-sm">
          <p>Vérifications à effectuer :</p>
          <ul className="list-disc list-inside mt-1">
            <li>Les tables 'Videos', 'Sections' et 'Lessons' existent dans Supabase</li>
            <li>Les permissions RLS sont configurées</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Vidéos</h1>
          <p className="text-white/70">Liste de toutes les vidéos disponibles</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-400/20 text-green-300 rounded hover:bg-green-400/30 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Nouvelle vidéo
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">
            Vidéos ({videos.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Aperçu</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Titre</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Section</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Cours</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {videos.map((video) => {
                const thumbnail = getVideoThumbnail(video.url);
                return (
                  <tr key={video.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-16 h-12 bg-gray-700 rounded overflow-hidden">
                        {thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={video.titre}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-video text-white/50"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{video.titre}</div>
                      <div className="text-white/60 text-sm">
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-300 transition-colors"
                        >
                          <i className="fas fa-external-link-alt mr-1"></i>
                          Voir la vidéo
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {video.section?.titre || 'Section inconnue'}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {video.section?.lesson?.titre || 'Cours inconnu'}
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {new Date(video.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(video)}
                          className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded hover:bg-yellow-400/30 transition-colors text-xs"
                        >
                          <i className="fas fa-edit mr-1"></i>
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDelete(video.id)}
                          className="px-3 py-1 bg-red-400/20 text-red-300 rounded hover:bg-red-400/30 transition-colors text-xs"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {videos.length === 0 && (
          <div className="p-8 text-center text-white/70">
            <div className="mb-4">
              <i className="fas fa-video text-4xl text-white/30"></i>
            </div>
            <p className="text-lg mb-2">Aucune vidéo trouvée</p>
            <p className="text-sm">Cliquez sur "Nouvelle vidéo" pour commencer</p>
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      {isModalOpen && editingVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {isCreateMode ? 'Créer une nouvelle vidéo' : 'Modifier la vidéo'}
            </h3>
            
            {error && (
              <div className="bg-red-400/30 border border-red-400 text-white px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Titre */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Titre</label>
                <input
                  type="text"
                  value={editingVideo.titre}
                  onChange={(e) => setEditingVideo({ ...editingVideo, titre: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Titre de la vidéo"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">URL de la vidéo</label>
                <input
                  type="url"
                  value={editingVideo.url}
                  onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Section */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Section</label>
                <select
                  value={editingVideo.section_id}
                  onChange={(e) => setEditingVideo({ ...editingVideo, section_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="" className="bg-gray-800 text-white">Sélectionner une section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id} className="bg-gray-800 text-white">
                      {section.lesson?.titre} - {section.titre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-400/20 text-white rounded hover:bg-gray-400/30 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-400/20 text-green-300 rounded hover:bg-green-400/30 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving && <i className="fas fa-spinner fa-spin mr-2"></i>}
                {saving ? 'Sauvegarde...' : (isCreateMode ? 'Créer' : 'Sauvegarder')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-video text-2xl text-purple-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Total vidéos</p>
              <p className="text-white text-xl font-bold">{videos.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-youtube text-2xl text-red-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Vidéos YouTube</p>
              <p className="text-white text-xl font-bold">
                {videos.filter(video => video.url.includes('youtube.com') || video.url.includes('youtu.be')).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-calendar-day text-2xl text-blue-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Ajoutées aujourd'hui</p>
              <p className="text-white text-xl font-bold">
                {videos.filter(video => 
                  new Date(video.created_at).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videos;