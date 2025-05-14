import { createContext, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthUser } from '../types';

interface AuthContextProps {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  initializeAuth: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: false,
  initialized: false,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  initializeAuth: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  const initializeAuth = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      
      // Initialize default admin user if no users exist
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.length === 0) {
        const adminUser: User = {
          id: uuidv4(),
          name: 'Admin',
          email: 'admin@thebuxx.com',
          password: 'admin123',
          isAdmin: true
        };
        localStorage.setItem('users', JSON.stringify([adminUser]));
      }
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        setError('Email ou senha incorretos');
        return false;
      }
      
      const authUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        isAdmin: foundUser.isAdmin
      };
      
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      setUser(authUser);
      return true;
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        setError('Email já está em uso');
        return false;
      }
      
      const newUser: User = {
        id: uuidv4(),
        name,
        email,
        password,
        isAdmin: false
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      const authUser: AuthUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin
      };
      
      localStorage.setItem('currentUser', JSON.stringify(authUser));
      setUser(authUser);
      return true;
    } catch (error) {
      setError('Erro ao registrar. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        initialized,
        error,
        login,
        register,
        logout,
        initializeAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}