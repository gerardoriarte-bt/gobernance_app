
import React from 'react';
import TaxonomyBuilder from './components/TaxonomyBuilder';
import LoginScreen from './components/LoginScreen';
import { useAuthStore } from './store/useAuthStore';

const App: React.FC = () => {
  const { isAuthenticated, restoreSession } = useAuthStore();
  const [isAuthChecking, setIsAuthChecking] = React.useState(true);

  React.useEffect(() => {
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        const { auth } = await import('./utils/firebaseConfig');
        const { onAuthStateChanged } = await import('firebase/auth');
        const { UserService } = await import('./services/userService');

        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            console.log("✅ Session restored:", user.email);
            let userProfile = await UserService.getUserProfile(user.uid);
            
            if (!userProfile) {
                 const isSantiago = user.email === 'santiago.rodriguez@lobueno.co';
                 userProfile = await UserService.syncUserProfile(user.uid, {
                     name: user.displayName || 'User',
                     email: user.email || '',
                     avatar: user.photoURL || undefined,
                     role: isSantiago ? 'superadmin' : 'trafficker'
                 });
            }

            if (userProfile) restoreSession(userProfile);
          } else {
             console.log("❌ No active session.");
          }
          setIsAuthChecking(false);
        });
      } catch (error) {
         console.error("Auth init failed", error);
         setIsAuthChecking(false);
      }
    };

    initAuth();
    return () => { if (unsubscribe) unsubscribe(); };
  }, [restoreSession]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p className="text-sm opacity-50 uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      { isAuthenticated ? <TaxonomyBuilder /> : <LoginScreen /> }
    </div>
  );
};

export default App;
