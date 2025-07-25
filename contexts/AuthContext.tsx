import React, { createContext, useContext } from 'react';
import { useRouter } from 'next/router';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user for bypass authentication
const DEMO_USER = {
  id: "demo-user-123",
  email: "demo@winston-ai.com",
  user_metadata: {
    full_name: "Demo User"
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const signOut = async () => {
    try {
      // For demo purposes, just redirect to home
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const value = {
    user: DEMO_USER, // Always return demo user
    loading: false,
    error: null,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 