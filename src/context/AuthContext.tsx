import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail } from 'lucide-react';
import { useNotification } from './NotificationContext';

interface User {
  email: string;
  name?: string;
  picture?: string;
  provider: 'email' | 'google';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google') => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signInWithProvider: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const AUTHORIZED_EMAILS = [
  'koutsovt@gmail.com',
  'koutsovt@yahoo.com',
  'andrew@elrigsaa.com.au',
  'brian@jardongroup.com.au'
];

export const providers = [
  {
    id: 'google',
    name: 'Google',
    icon: () => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-green-600 hover:bg-green-700 text-white',
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('user'));
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const validateUser = (email: string): boolean => {
    return AUTHORIZED_EMAILS.includes(email.toLowerCase());
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!validateUser(email)) {
        throw new Error('Unauthorized email address');
      }

      const newUser = {
        email,
        provider: 'email' as const,
      };

      setUser(newUser);
      setIsAuthenticated(true);
      navigate('/dashboard');
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Failed to sign in') };
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then(res => res.json());

        if (!validateUser(userInfo.email)) {
          showNotification('Unauthorized email address', 'error');
          return;
        }

        const googleUser = {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          provider: 'google' as const,
        };

        setUser(googleUser);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } catch (error) {
        console.error('Google user info error:', error);
        showNotification('Failed to get user info', 'error');
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      showNotification('Google login failed', 'error');
    },
    flow: 'implicit',
    scope: 'email profile openid',
    popup: true,
    ux_mode: 'popup',
  });

  const signInWithProvider = async (provider: 'google') => {
    try {
      if (provider === 'google') {
        handleGoogleLogin();
        return;
      }
    } catch (error) {
      console.error(`${provider} sign in error:`, error);
      showNotification(error instanceof Error ? error.message : 'Authentication failed', 'error');
    }
  };

  const signOut = async () => {
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      signIn,
      signOut,
      signInWithProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
};