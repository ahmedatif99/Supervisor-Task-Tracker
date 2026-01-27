import { account, databases, ID, DATABASE_ID, SUPERVISORS_COLLECTION_ID, Query } from '../lib/appwrite';

import React, { createContext, useContext, useState, useEffect } from 'react';



interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  prefs?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: string, isAdmin: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'supervisor_app_user';


// Demo users for testing
const demoUsers: Record<string, User> = {
  'admin@company.com': { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
  'supervisor@company.com': { id: '2', name: 'Ahmed Hassan', email: 'supervisor@company.com', role: 'supervisor' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // const [user, setUser] = useState<User | null>(() => {

  //   const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  //   return stored ? JSON.parse(stored) : null;
  // });

  // Check for existing session on mount

  useEffect(() => {
    // if (user) {
    //   localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    // } else {
    //   localStorage.removeItem(AUTH_STORAGE_KEY);
    // }
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const appwriteUser = await account.get();
      const role = appwriteUser.prefs?.role || 'supervisor';
      setUser({
        id: appwriteUser.$id,
        name: appwriteUser.name,
        email: appwriteUser.email,
        role: role,
      });
    } catch (error) {
      // No active session
      setUser(null);
    } finally {
      setLoading(false);
    }
  };


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await account.createEmailPasswordSession(email, password);
      const appwriteUser = await account.get();
      const role = appwriteUser.prefs?.role || 'supervisor';
      setUser({
        id: appwriteUser.$id,
        name: appwriteUser.name,
        email: appwriteUser.email,
        role: role,
      });

      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
    // Allow any email for demo

    return true;
  };
  const signup = async (email: string, password: string, name: string, role: string, isAdmin: boolean): Promise<boolean> => {
    try {

      const newUser = await account.create(ID.unique(), email, password, name);
      if (!isAdmin) {

        await account.createEmailPasswordSession(email, password);
      }
      await account.updatePrefs({ role: role });

      const doc = await databases.createDocument(
        DATABASE_ID,
        SUPERVISORS_COLLECTION_ID,
        ID.unique(),
        {
          $id: newUser.$id,
          email,
          name,
          role,
          total_points: 0,
          total_task: 0,
          rank: 0,
          $createdAt: new Date().toISOString(),
        }
      );

      setUser({
        id: newUser.$id,
        name, email,
        role,
      });

      return true;
    }
    catch (error) {
      console.error("Signup failed", error);
      return false;
    }
  }
  const logout = async (): Promise<void> => {
    try {
      await account.deleteSession('current');
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
