
import React from 'react';
import TaxonomyBuilder from './components/TaxonomyBuilder';
import LoginScreen from './components/LoginScreen';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen">
      { isAuthenticated ? <TaxonomyBuilder /> : <LoginScreen /> }
    </div>
  );
};

export default App;
