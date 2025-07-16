import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define weather types
export type WeatherData = {
  temperature: number; // in celsius
  condition: string; // e.g., 'Sunny', 'Cloudy', 'Rain'
  icon: string; // icon code
  location: string;
};

type WeatherContextType = {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  refreshWeather: () => Promise<void>;
};

// Create context
const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

// Provider component
export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock function to simulate fetching weather data
  // In a real app, you would use a real weather API
  const fetchWeather = async (suburb: string, postcode: string): Promise<WeatherData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock weather data based on current date
    const date = new Date();
    const month = date.getMonth();
    const isWinter = month >= 5 && month <= 8; // June to September in Southern Hemisphere
    
    // Generate random temperature based on season
    const baseTemp = isWinter ? 15 : 25;
    const randomVariation = Math.floor(Math.random() * 10) - 5; // -5 to +5
    const temperature = baseTemp + randomVariation;
    
    // Mock conditions based on temperature
    let condition, icon;
    if (temperature > 28) {
      condition = 'Sunny';
      icon = '☀️';
    } else if (temperature > 20) {
      condition = 'Partly Cloudy';
      icon = '⛅';
    } else if (temperature > 15) {
      condition = 'Cloudy';
      icon = '☁️';
    } else {
      condition = 'Rainy';
      icon = '🌧️';
    }
    
    return {
      temperature,
      condition,
      icon,
      location: `${suburb}, ${postcode}`
    };
  };
  
  // Fetch weather when user changes or manually refreshed
  const refreshWeather = async () => {
    if (!user?.user_metadata?.suburb || !user?.user_metadata?.postcode) {
      setWeather(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const weatherData = await fetchWeather(
        user.user_metadata.suburb, 
        user.user_metadata.postcode
      );
      setWeather(weatherData);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and refresh when user changes
  useEffect(() => {
    refreshWeather();
    
    // Set up interval to refresh every 30 minutes
    const intervalId = setInterval(refreshWeather, 30 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  return (
    <WeatherContext.Provider
      value={{
        weather,
        isLoading,
        error,
        refreshWeather
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

// Custom hook for using the weather context
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};