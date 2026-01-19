import { account, databases, ID } from '../lib/appwrite';
import React, { createContext, useContext, useState, useEffect } from 'react';



interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'supervisor_app_user';


// Demo users for testing
const demoUsers: Record<string, User> = {
  'admin@company.com': { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
  'supervisor@company.com': { id: '2', name: 'Ahmed Hassan', email: 'supervisor@company.com', role: 'supervisor' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {

    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);


  const login = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    try {
      await account.createEmailPasswordSession(email, password);
      const loUser = await account.get();
      setUser({
        id: loUser.$id,
        name,
        email,
        role: loUser.prefs.role,
      });
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
    // Allow any email for demo

    return true;
  };
  const signup = async (email: string, name: string, password: string, role: string): Promise<boolean> => {
    try {

      const newUser = await account.create(ID.unique(), email, password, name);
      await account.createEmailPasswordSession(email, password);

      const doc = await databases.createDocument(
        '696b5c4900133d923bc6',
        'supervisors',
        ID.unique(),
        {
          $id: newUser.$id,
          email,
          name,
          role,
          points: 0,
          total_task: 0,
          rank: 0,
          $createdAt: new Date().toISOString(),
        }
      );
      await account.updatePrefs({ role: role })

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
  const logout = async () => {
    await account.deleteSession('current');
    setUser(null);
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
