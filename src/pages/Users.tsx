import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  user_id: string;
  role_id: string;
  email: string;
  roles?: {
    id: string;
    role: string;
  };
}

interface Role {
  id: string;
  role: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Récupérer les utilisateurs
      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('id, user_id, role_id, email')
        .order('id', { ascending: true });
      
      if (usersError) {
        setError('Erreur lors de la récupération des utilisateurs: ' + usersError.message);
        console.error('Error fetching users:', usersError);
        return;
      }

      // Récupérer les rôles
      const { data: rolesData, error: rolesError } = await supabase
        .from('Roles')
        .select('id, role');
      
      if (rolesError) {
        setError('Erreur lors de la récupération des rôles: ' + rolesError.message);
        console.error('Error fetching roles:', rolesError);
        return;
      }

      // Joindre manuellement les données
      const usersWithRoles: User[] = usersData?.map(user => ({
        ...user,
        roles: rolesData?.find(role => role.id === user.role_id)
      })) || [];

      setUsers(usersWithRoles);
      setRoles(rolesData || []);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir le modal de modification
  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    if (!editingUser) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('Users')
        .update({
          user_id: editingUser.user_id,
          role_id: editingUser.role_id,
          email: editingUser.email
        })
        .eq('id', editingUser.id);
      
      if (error) {
        setError('Erreur lors de la sauvegarde: ' + error.message);
        return;
      }

      // Recharger les données
      await fetchUsers();
      
      // Fermer le modal
      setIsModalOpen(false);
      setEditingUser(null);
      setError(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour fermer le modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  // Fonction pour obtenir le nom du rôle
  const getRoleName = (user: User) => {
    return user.roles?.role || 'Inconnu';
  };

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      'administrateur': 'bg-red-400/20 text-red-300',
      'enseignant': 'bg-purple-400/20 text-purple-300',
      'apprenant': 'bg-green-400/20 text-green-300'
    };
    return colors[roleName.toLowerCase()] || 'bg-gray-400/20 text-gray-300';
  };

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (roleName: string) => {
    const icons: { [key: string]: string } = {
      'administrateur': 'fas fa-crown',
      'enseignant': 'fas fa-chalkboard-teacher',
      'apprenant': 'fas fa-graduation-cap'
    };
    return icons[roleName.toLowerCase()] || 'fas fa-user';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white text-xl">Chargement des utilisateurs...</div>
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
            <li>Les tables 'Users' et 'Roles' existent dans Supabase</li>
            <li>Les permissions RLS sont configurées</li>
            <li>La relation entre Users.role_id et Roles.id est correcte</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Gestion des Utilisateurs</h1>
        <p className="text-white/70">Liste de tous les utilisateurs inscrits</p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-white/20">
          <h2 className="text-xl font-semibold text-white">
            Utilisateurs ({users.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-white font-semibold">ID</th>
                <th className="px-6 py-3 text-left text-white font-semibold">User ID</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Rôle</th>
                <th className="px-6 py-3 text-left text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => {
                const roleName = getRoleName(user);
                return (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-white/70 font-mono text-sm">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 text-white/70 font-mono text-sm">
                      {user.user_id.length > 12 
                        ? user.user_id.substring(0, 12) + '...' 
                        : user.user_id
                      }
                    </td>
                    <td className="px-6 py-4 text-white">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getRoleColor(roleName)}`}>
                        <i className={getRoleIcon(roleName)}></i>
                        {roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded hover:bg-yellow-400/30 transition-colors text-xs"
                      >
                        <i className="fas fa-edit mr-1"></i>
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="p-8 text-center text-white/70">
            <div className="mb-4">
              <i className="fas fa-users text-4xl text-white/30"></i>
            </div>
            <p className="text-lg mb-2">Aucun utilisateur trouvé</p>
            <p className="text-sm">Les utilisateurs apparaîtront ici une fois ajoutés à la base de données</p>
          </div>
        )}
      </div>

      {/* Modal de modification */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Modifier l'utilisateur</h3>
            
            {error && (
              <div className="bg-red-400/30 border border-red-400 text-white px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {/* User ID */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">User ID</label>
                <input
                  type="text"
                  value={editingUser.user_id}
                  onChange={(e) => setEditingUser({ ...editingUser, user_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-white text-sm font-medium mb-2">Rôle</label>
                <select
                  value={editingUser.role_id}
                  onChange={(e) => setEditingUser({ ...editingUser, role_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id} className="bg-gray-800 text-white">
                      {role.role}
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
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-crown text-2xl text-red-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Administrateurs</p>
              <p className="text-white text-xl font-bold">
                {users.filter(user => {
                  const roleName = getRoleName(user).toLowerCase();
                  return roleName === 'administrateur';
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-chalkboard-teacher text-2xl text-purple-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Enseignants</p>
              <p className="text-white text-xl font-bold">
                {users.filter(user => {
                  const roleName = getRoleName(user).toLowerCase();
                  return roleName === 'enseignant';
                }).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <div className="flex items-center">
            <i className="fas fa-graduation-cap text-2xl text-green-300 mr-3"></i>
            <div>
              <p className="text-white/70 text-sm">Apprenants</p>
              <p className="text-white text-xl font-bold">
                {users.filter(user => {
                  const roleName = getRoleName(user).toLowerCase();
                  return roleName === 'apprenant';
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;