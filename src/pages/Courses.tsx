import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Lesson {
  id: string;
  created_at: string;
  difficulty: number;
  creator_id: string;
  titre: string;
  description: string;
  sections_count?: number;
  videos_count?: number;
}

interface NewLesson {
  titre: string;
  description: string;
  difficulty: number;
  creator_id: string;
}

const Courses: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      
      // Récupérer les cours
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('Lessons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (lessonsError) {
        setError('Erreur lors de la récupération des cours: ' + lessonsError.message);
        console.error('Error fetching lessons:', lessonsError);
        return;
      }

      // Enrichir avec le nombre de sections et vidéos
      const enrichedLessons = await Promise.all(
        lessonsData?.map(async (lesson) => {
          // Compter les sections
          const { count: sectionsCount } = await supabase
            .from('Sections')
            .select('*', { count: 'exact', head: true })
            .eq('lesson_id', lesson.id);

          // Compter les vidéos via les sections
          const { data: sections } = await supabase
            .from('Sections')
            .select('id')
            .eq('lesson_id', lesson.id);

          let videosCount = 0;
          if (sections) {
            for (const section of sections) {
              const { count } = await supabase
                .from('Videos')
                .select('*', { count: 'exact', head: true })
                .eq('section_id', section.id);
              videosCount += count || 0;
            }
          }

          return {
            ...lesson,
            sections_count: sectionsCount || 0,
            videos_count: videosCount
          };
        }) || []
      );

      setLessons(enrichedLessons);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson({ ...lesson });
    setIsCreateMode(false);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLesson({
      id: '',
      titre: '',
      description: '',
      difficulty: 1,
      creator_id: '',
      created_at: new Date().toISOString()
    });
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingLesson) return;
    
    try {
      setSaving(true);
      
      if (isCreateMode) {
        // Créer un nouveau cours
        const { error } = await supabase
          .from('Lessons')
          .insert({
            titre: editingLesson.titre,
            description: editingLesson.description,
            difficulty: editingLesson.difficulty,
            creator_id: editingLesson.creator_id
          });
        
        if (error) {
          setError('Erreur lors de la création: ' + error.message);
          return;
        }
      } else {
        // Modifier un cours existant
        const { error } = await supabase
          .from('Lessons')
          .update({
            titre: editingLesson.titre,
            description: editingLesson.description,
            difficulty: editingLesson.difficulty,
            creator_id: editingLesson.creator_id
          })
          .eq('id', editingLesson.id);
        
        if (error) {
          setError('Erreur lors de la sauvegarde: ' + error.message);
          return;
        }
      }

      await fetchLessons();
      setIsModalOpen(false);
      setEditingLesson(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) return;
    
    try {
      const { error } = await supabase
        .from('Lessons')
        .delete()
        .eq('id', lessonId);
      
      if (error) {
        setError('Erreur lors de la suppression: ' + error.message);
        return;
      }

      await fetchLessons();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Error:', err);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
    setError(null);
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Débutant',
      2: 'Intermédiaire',
      3: 'Avancé',
      4: 'Expert'
    };
    return labels[difficulty as keyof typeof labels] || 'Inconnu';
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-400/20 text-green-300',
      2: 'bg-yellow-400/20 text-yellow-300',
      3: 'bg-orange-400/20 text-orange-300',
      4: 'bg-red-400/20 text-red-300'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-400/20 text-gray-300';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-xl">Chargement des cours...</div>
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
            <li>Les tables 'Lessons', 'Sections' et 'Videos' existent dans Supabase</li>
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
          <h1 className="text-3xl font-bold text-white mb-2">Gestion des Cours</h1>
          <p className="text-white/70">Liste de tous les cours disponibles</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-green-400/20 text-green-300 rounded hover:bg-green-400/30 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Nouveau cours
        </button>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">
            Cours ({lessons.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">Titre</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Difficulté</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Sections</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Vidéos</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Date de création</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-white font-medium">{lesson.titre}</div>
                      <div className="text-white/60 text-sm truncate max-w-xs">
                        {lesson.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {getDifficultyLabel(lesson.difficulty)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">
                    <span className="flex items-center">
                      <i className="fas fa-list-alt mr-2 text-blue-300"></i>
                      {lesson.sections_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">
                    <span className="flex items-center">
                      <i className="fas fa-video mr-2 text-purple-300"></i>
                      {lesson.videos_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {new Date(lesson.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(lesson)}
                        className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded hover:bg-yellow-400/30 transition-colors text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleDelete(lesson.id)}
                        className="px-3 py-1 bg-red-400/20 text-red-300 rounded hover:bg-red-400/30 transition-colors text-xs"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {lessons.length === 0 && (
          <div className="p-8 text-center text-white/70">
            <div className="mb-4">
              <i className="fas fa-graduation-cap text-4xl text-white/30"></i>
            </div>
            <p className="text-lg mb-2">Aucun cours trouvé</p>
            <p className="text-sm">Cliquez sur "Nouveau cours" pour commencer</p>
          </div>
        )}
      </div>

      {/* Modal de création/modification */}
      {isModalOpen && editingLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {isCreateMode ? 'Créer un nouveau cours' : 'Modifier le cours'}
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
                  value={editingLesson.titre}
                  onChange={(e) => setEditingLesson({ ...editingLesson, titre: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Titre du cours"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingLesson.description}
                  onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="Description du cours"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Difficulté */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Difficulté</label>
                  <select
                    value={editingLesson.difficulty}
                    onChange={(e) => setEditingLesson({ ...editingLesson, difficulty: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value={1} className="bg-gray-800 text-white">Débutant</option>
                    <option value={2} className="bg-gray-800 text-white">Intermédiaire</option>
                    <option value={3} className="bg-gray-800 text-white">Avancé</option>
                    <option value={4} className="bg-gray-800 text-white">Expert</option>
                  </select>
                </div>

                {/* Creator ID */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Creator ID</label>
                  <input
                    type="text"
                    value={editingLesson.creator_id}
                    onChange={(e) => setEditingLesson({ ...editingLesson, creator_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="ID du créateur"
                  />
                </div>
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
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-graduation-cap text-2xl text-blue-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Total cours</p>
              <p className="text-white text-xl font-bold">{lessons.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-star text-2xl text-green-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Débutant</p>
              <p className="text-white text-xl font-bold">
                {lessons.filter(lesson => lesson.difficulty === 1).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-fire text-2xl text-orange-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Avancé</p>
              <p className="text-white text-xl font-bold">
                {lessons.filter(lesson => lesson.difficulty === 3).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-video text-2xl text-purple-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Total vidéos</p>
              <p className="text-white text-xl font-bold">
                {lessons.reduce((total, lesson) => total + (lesson.videos_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;