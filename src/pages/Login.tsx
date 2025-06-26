import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Authentification avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return;
      }
      
      if (data?.session) {
        // L'authentification a réussi
        navigate('/dashboard');
      } else {
        setError('Une erreur inattendue s\'est produite');
      }
    } catch (err) {
      setError('Une erreur s\'est produite lors de la connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-md border-2 border-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login DailyLessons</h1>
          <p className="text-white/70">Entrez vos accès pour accéder au panel admin de DailyLessons</p>
        </div>
        
        {error && (
          <div className="bg-red-400/30 border border-red-400 text-white px-4 py-3 rounded mb-4" role="alert">
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/20 border border-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/50"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-white text-primary py-3 px-4 rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-colors font-semibold shadow-lg"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;