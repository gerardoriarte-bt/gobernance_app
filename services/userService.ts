
import { db } from '../utils/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';

export const UserService = {
  /**
   * Fetches a user profile from Firestore by their Auth UID.
   */
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  /**
   * Creates or updates a user profile. 
   * Useful for initial setup or syncing Google Profile data.
   */
  syncUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        // Create new user (Default to 'trafficker' if not specified)
        const newUser: UserProfile = {
            id: uid,
            name: data.name || 'Unknown',
            email: data.email || '',
            avatar: data.avatar,
            role: 'trafficker', // Default safety role
            ...data
        };
        // Add timestamp if we were using a real backend field, 
        // but sticking to UserProfile type for now.
        await setDoc(userRef, newUser);
        return newUser;
      } else {
        // Update existing (e.g. new avatar)
        await updateDoc(userRef, {
            ...data,
            lastLogin: serverTimestamp()
        });
        return { ...snap.data(), ...data } as UserProfile;
      }
    } catch (error) {
       console.error("Error syncing user:", error);
       throw error;
    }
  }
};
