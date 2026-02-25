
import { create } from 'zustand';
import { UserProfile, UserRole } from '../types';

interface AuthState {
  user: UserProfile | null;
  users: UserProfile[]; // List of all users for CRUD
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth Actions
  loginWithGoogle: () => Promise<void>;
  restoreSession: (user: UserProfile) => void;
  logout: () => Promise<void>;
  
  // CRUD Actions
  addUser: (user: Omit<UserProfile, 'id' | 'avatar'>) => void;
  updateUser: (id: string, data: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  fetchAllUsers: () => Promise<void>;
}

// Initial Mock Data
const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_jose_001',
    name: 'Jose Rodriguez',
    email: 'jose.rodriguez@lobueno.co',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jose',
    role: 'admin'
  },
  {
    id: 'usr_santiago_002',
    name: 'Santiago Rodriguez Rivera',
    email: 'santiago.rodriguez@lobueno.co',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Santiago',
    role: 'admin'
  },
  {
    id: 'usr_gerardo_003',
    name: 'Gerardo Carlos Riarte',
    email: 'gerardo.riarte@buentipo.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gerardo',
    role: 'admin'
  },
  {
    id: 'usr_christian_004',
    name: 'Christian Eduardo Martinez Moreno',
    email: 'christian.martinez@lobueno.co',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian',
    role: 'admin'
  },
  {
    id: 'usr_joffre_005',
    name: 'Joffre Carmona',
    email: 'joffre@buentipo.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joffre',
    role: 'trafficker'
  },
  {
    id: 'usr_admin_000',
    name: 'Super Admin',
    email: 'admin@governance.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    role: 'admin'
  },
  {
    id: 'usr_planner_007',
    name: 'Demo Planner',
    email: 'planner@governance.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Planner',
    role: 'planner'
  }
];

const getStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultValue;
};

const setStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  users: getStorage('users_db', INITIAL_USERS),
  isAuthenticated: false,
  isLoading: false,

  loginWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { auth, googleProvider } = await import('../utils/firebaseConfig');
      const { signInWithPopup } = await import('firebase/auth');
      
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Validate email domain
      const allowedDomains = ['lobueno.co', 'buentipo.com', 'hermano.com'];
      const userEmail = googleUser.email || '';
      const emailDomain = userEmail.split('@')[1];

      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
         alert(`Acceso denegado: El dominio @${emailDomain || 'desconocido'} no está autorizado. Solo lobueno.co, buentipo.com y hermano.com están permitidos.`);
         await auth.signOut();
         set({ isLoading: false, isAuthenticated: false, user: null });
         return;
      }

      // 1. Try to get user from Real Firestore
      try {
          const { UserService } = await import('../services/userService');
          let userProfile = await UserService.getUserProfile(googleUser.uid);
          
          if (!userProfile) {
             // Optional: Auto-register as Trafficker for new Google Users?
             // Or strictly deny. Let's Auto-register for smoother UX in this demo phase.
             userProfile = await UserService.syncUserProfile(googleUser.uid, {
                 name: googleUser.displayName || 'User',
                 email: googleUser.email || '',
                 avatar: googleUser.photoURL || undefined,
                 role: 'trafficker' // Default role
             });
          }

          if (userProfile) {
              set({ 
                  user: userProfile, 
                  isAuthenticated: true, 
                  isLoading: false 
              });
              await get().fetchAllUsers();
              return;
          }

      } catch (dbError: any) {
          // If Firestore fails (e.g. permission denied or invalid config), warning and continue to local check
          console.warn("Firestore unavailable, checking local 'users_db'...", dbError);
      }

      // 2. Fallback: Check local 'database' (localStorage) for Demo/MVP
      const validUser = get().users.find(u => u.email === googleUser.email);

      if (validUser) {
        set({ 
          user: validUser,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        alert('Access Denied: Your email is not authorized for this application.');
        await auth.signOut();
        set({ isLoading: false, isAuthenticated: false, user: null });
      }

    } catch (error: any) {
      console.error("Login failed", error);
      
      // Fallback for Development/Demo without real Firebase Keys
      if (error.code === 'auth/invalid-api-key' || error.message?.includes('api-key')) {
         console.warn("Firebase not configured. Using Mock Login for Demo.");
         alert("⚠️ Demo Mode: Firebase keys missing.\nLogging in as 'Super Admin' for testing purposes.");
         
         // Mock User - imitating a Google User Result
         const mockUser = {
            id: 'mock_google_user',
            name: 'Demo Admin',
            email: 'admin@governance.com', // Matches the mock admin in INITIAL_USERS
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleAdmin',
            role: 'admin' as UserRole
         };

         // Find matching user in our 'db'
         const validUser = get().users.find(u => u.email === mockUser.email);
         
         if (validUser) {
             set({ 
                user: validUser,
                isAuthenticated: true,
                isLoading: false
             });
         }
         return;
      }

      set({ isLoading: false });
    }
  },

  restoreSession: (userProfile: UserProfile) => {
      set({ 
          user: userProfile, 
          isAuthenticated: true, 
          isLoading: false 
      });
      get().fetchAllUsers();
  },

  logout: async () => {
    try {
       const { auth } = await import('../utils/firebaseConfig');
       await auth.signOut();
       set({ user: null, isAuthenticated: false });
    } catch (error) {
       console.error("Logout failed", error);
    }
  },

  addUser: (userData) => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name.replace(/\s/g, '')}`,
      ...userData
    };
    
    set(state => {
      const updatedUsers = [...state.users, newUser];
      setStorage('users_db', updatedUsers);
      return { users: updatedUsers };
    });
  },

  updateUser: (id, data) => {
    set(state => {
      const updatedUsers = state.users.map(u => u.id === id ? { ...u, ...data } : u);
      setStorage('users_db', updatedUsers);
      
      // If updating current user, update session too
      const currentUser = state.user?.id === id ? { ...state.user, ...data } : state.user;
      
      return { users: updatedUsers, user: currentUser as UserProfile };
    });
  },

  deleteUser: (id) => {
    set(state => {
      const updatedUsers = state.users.filter(u => u.id !== id);
      setStorage('users_db', updatedUsers);
      return { users: updatedUsers };
    });
  },

  fetchAllUsers: async () => {
    const { UserService } = await import('../services/userService');
    const users = await UserService.getAllUsers();
    if (users && users.length > 0) {
      set({ users });
      setStorage('users_db', users);
    }
  }
}));
