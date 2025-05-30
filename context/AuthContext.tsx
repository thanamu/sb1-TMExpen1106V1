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

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<boolean>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Check if user is logged in on app start
    const checkLoginStatus = async () => {
      try {
        const userJson = await storage.getItem('user');
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would validate with a server
      // For demo, we're checking local storage
      const usersJson = await storage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      const user = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (user) {
        // Store user data in storage
        const { password, ...userWithoutPassword } = user;
        await storage.setItem('user', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    userData: Partial<User>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would send data to a server
      // For demo, we're storing locally
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
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
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