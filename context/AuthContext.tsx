import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

// Define types for our context
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  suburb: string;
  postcode: string;
};

type StoredCredentials = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberedEmail: string;
  setRememberCredentials: (remember: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
  autoLogin: () => Promise<boolean>;
};

// Create a platform-specific storage implementation
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.setItemAsync(key, value);
    }
  },
  deleteItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.deleteItemAsync(key);
    }
  },
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberedEmail, setRememberedEmail] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(false);

  useEffect(() => {
    // Check if user is logged in and attempt auto-login on app start
    const checkLoginStatus = async () => {
      try {
        // First, try to restore the current session
        const userJson = await storage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
          setIsLoading(false);
          return;
        }
        
        // If no active session, check for stored credentials and auto-login
        const credentialsJson = await storage.getItem('storedCredentials');
        if (credentialsJson) {
          const credentials: StoredCredentials = JSON.parse(credentialsJson);
          setRememberedEmail(credentials.email);
          
          if (credentials.rememberMe) {
            // Attempt auto-login with stored credentials
            const success = await performLogin(credentials.email, credentials.password, false);
            if (!success) {
              // If auto-login fails, clear invalid credentials
              await storage.deleteItem('storedCredentials');
            }
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const performLogin = async (email: string, password: string, storeCredentials: boolean = true): Promise<boolean> => {
    setIsLoading(true);
    try {
      const usersJson = await storage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const existingUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase()
      );

      if (!existingUser) {
        return false; // User doesn't exist
      }

      if (existingUser.password !== password) {
        return false; // Wrong password
      }

      // Store user data in storage and state (excluding password)
      const { password: _, ...userWithoutPassword } = existingUser;
      await storage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      // Store credentials if requested
      if (storeCredentials && rememberCredentials) {
        const credentialsToStore: StoredCredentials = {
          email,
          password,
          rememberMe: true
        };
        await storage.setItem('storedCredentials', JSON.stringify(credentialsToStore));
      }
      
      return true;

    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const login = async (email: string, password: string): Promise<boolean> => {
    return performLogin(email, password, true);
  };
  
  const autoLogin = async (): Promise<boolean> => {
    try {
      const credentialsJson = await storage.getItem('storedCredentials');
      if (credentialsJson) {
        const credentials: StoredCredentials = JSON.parse(credentialsJson);
        if (credentials.rememberMe) {
          return await performLogin(credentials.email, credentials.password, false);
        }
      }
      return false;
    } catch (error) {
      console.error('Auto-login error:', error);
      return false;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const usersJson = await storage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // Check if user already exists
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return false;
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        suburb: userData.suburb || '',
        postcode: userData.postcode || '',
        createdAt: new Date().toISOString(),
      };
      
      // Save to users list
      await storage.setItem('users', JSON.stringify([...users, newUser]));
      
      // Login the user
      const { password: _, ...userWithoutPassword } = newUser;
      await storage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      
      // Store credentials if remember me is enabled
      if (rememberCredentials) {
        const credentialsToStore: StoredCredentials = {
          email,
          password,
          rememberMe: true
        };
        await storage.setItem('storedCredentials', JSON.stringify(credentialsToStore));
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await storage.deleteItem('user');
      setUser(null);
      
      // Keep stored credentials for future auto-login unless user explicitly wants to forget
      // Only clear if rememberCredentials is false
      if (!rememberCredentials) {
        await storage.deleteItem('storedCredentials');
        setRememberedEmail('');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setRememberCredentialsHandler = (remember: boolean) => {
    setRememberCredentials(remember);
    if (!remember) {
      // If user disables remember me, clear stored credentials
      storage.deleteItem('storedCredentials');
      setRememberedEmail('');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        rememberedEmail,
        setRememberCredentials: setRememberCredentialsHandler,
        login,
        register,
        logout,
        autoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};