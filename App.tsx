
import React from 'react';
import TaxonomyBuilder from './components/TaxonomyBuilder';
import LoginScreen from './components/LoginScreen';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const { isAuthenticated, restoreSession, loginWithGoogle } = useAuthStore();

  React.useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        const { auth } = await import('./utils/firebaseConfig');
        const { onAuthStateChanged } = await import('firebase/auth');
        const { UserService } = await import('./services/userService');

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            // User is signed in, restore session
            console.log("Session found, restoring...", user.email);
            
            // Try to fetch profile from DB
            let userProfile = await UserService.getUserProfile(user.uid);
            
            // Auto-sync if missing (safety net)
            if (!userProfile) {
                 userProfile = await UserService.syncUserProfile(user.uid, {
                     name: user.displayName || 'User',
                     email: user.email || '',
                     avatar: user.photoURL || undefined,
                     role: 'trafficker'
                 });
            }

            if (userProfile) {
                restoreSession(userProfile);
            }
          } else {
             // User is signed out
             console.log("No active session.");
          }
        });
      } catch (error) {
         console.error("Auth init failed", error);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [restoreSession]);

  return (
    <div className="min-h-screen">
      { isAuthenticated ? <TaxonomyBuilder /> : <LoginScreen /> }
    </div>
  );
};

export default App;
