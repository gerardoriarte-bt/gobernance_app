import { UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const UserService = {
  /**
   * Fetches a user profile from the API by their Auth UID.
   */
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    try {
      const res = await fetch(`${API_URL}/users/${uid}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch user');
      return await res.json();
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  /**
   * Creates or updates a user profile via API.
   */
  syncUserProfile: async (uid: string, data: Partial<UserProfile>) => {
    try {
      const payload = {
        id: uid,
        ...data
      };

      const res = await fetch(`${API_URL}/users/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to sync user');
      return await res.json();
    } catch (error) {
       console.error("Error syncing user:", error);
       throw error;
    }
  },
  
  /**
   * Fetches all registered users from the API.
   */
  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return await res.json();
    } catch (error) {
       console.error("Error fetching all users:", error);
       return [];
    }
  }
};
