import React, { createContext, useContext, useState } from 'react';

type UserRole = 'admin' | 'supervisor';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: Record<string, User> = {
  'admin@company.com': { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' },
  'supervisor@company.com': { id: '2', name: 'Ahmed Hassan', email: 'supervisor@company.com', role: 'supervisor' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Demo login - replace with Appwrite auth
    const demoUser = demoUsers[email];
    if (demoUser && demoUser.role === role) {
      setUser(demoUser);
      return true;
    }
    // Allow any email for demo
    setUser({
      id: Math.random().toString(),
      name: email.split('@')[0],
      email,
      role,
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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
