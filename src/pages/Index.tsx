import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';

const Index = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : '/my-stats');
    }
  }, [isAuthenticated, isAdmin, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <Login />;
};

export default Index;
