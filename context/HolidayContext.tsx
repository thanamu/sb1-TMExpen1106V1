import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useAuth } from './AuthContext';

// Platform-specific storage implementation
const storage = {
  getItemAsync: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.getItemAsync(key);
    }
  },
  setItemAsync: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.setItemAsync(key, value);
    }
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    } else {
      const SecureStore = require('expo-secure-store');
      return SecureStore.deleteItemAsync(key);
    }
  }
};

// Define types
export type ModeOfTravel = 'Car' | 'Plane' | 'Train' | 'Bus' | 'Cruise' | 'Other';
export type DailyExpenseType = 'Meals' | 'Transport' | 'Attraction' | 'Other';

export type Holiday = {
  id: string;
  userId: string;
  description: string;
  modeOfTravel: ModeOfTravel;
  departureDate: string;
  numberOfDays: number;
  travelTransportCost: number;
  accommodationCost: number;
  travelInsuranceCost: number;
  totalCost: number;
  createdAt: string;
};

export type DailyExpense = {
  id: string;
  userId: string;
  holidayId: string;
  dayNumber: number;
  type: DailyExpenseType;
  amount: number;
  description?: string;
  hasReceipt: boolean;
  receiptUri?: string;
  createdAt: string;
};

type HolidayContextType = {
  holidays: Holiday[];
  dailyExpenses: DailyExpense[];
  
  // Holiday CRUD
  addHoliday: (holiday: Omit<Holiday, 'id' | 'userId' | 'totalCost' | 'createdAt'>) => Promise<void>;
  updateHoliday: (id: string, holiday: Partial<Holiday>) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;
  
  // Daily Expense CRUD
  addDailyExpense: (expense: Omit<DailyExpense, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateDailyExpense: (id: string, expense: Partial<DailyExpense>) => Promise<void>;
  deleteDailyExpense: (id: string) => Promise<void>;
  getDailyExpenses: (holidayId: string) => DailyExpense[];
  getDailyExpensesByDay: (holidayId: string, dayNumber: number) => DailyExpense[];
  
  // Summary functions
  getHolidayTotalCost: (holidayId: string) => number;
  getHolidayDailyCosts: (holidayId: string) => number;
  
  isLoading: boolean;
};

// Helper function to generate unique IDs
let idCounter = 0;
const generateUniqueId = () => {
  const timestamp = Date.now();
  const counter = ++idCounter;
  return `holiday-${timestamp}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create context
const HolidayContext = createContext<HolidayContextType | undefined>(undefined);

// Provider component
export const HolidayProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setHolidays([]);
        setDailyExpenses([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load holidays
        const holidaysKey = `holidays_${user.id}`;
        const holidaysJson = await storage.getItemAsync(holidaysKey);
        const loadedHolidays = holidaysJson ? JSON.parse(holidaysJson) : [];
        setHolidays(loadedHolidays);
        
        // Load daily expenses
        const expensesKey = `holiday_daily_expenses_${user.id}`;
        const expensesJson = await storage.getItemAsync(expensesKey);
        const loadedExpenses = expensesJson ? JSON.parse(expensesJson) : [];
        setDailyExpenses(loadedExpenses);
      } catch (error) {
        console.error('Error loading holiday data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Holiday CRUD operations
  const addHoliday = async (holiday: Omit<Holiday, 'id' | 'userId' | 'totalCost' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const totalCost = holiday.travelTransportCost + holiday.accommodationCost + holiday.travelInsuranceCost;
      
      const newHoliday: Holiday = {
        ...holiday,
        id: generateUniqueId(),
        userId: user.id,
        totalCost,
        createdAt: new Date().toISOString()
      };
      
      const updatedHolidays = [...holidays, newHoliday];
      setHolidays(updatedHolidays);
      
      const holidaysKey = `holidays_${user.id}`;
      await storage.setItemAsync(holidaysKey, JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error('Error adding holiday:', error);
    }
  };
  
  const updateHoliday = async (id: string, holidayUpdate: Partial<Holiday>) => {
    if (!user) return;
    
    try {
      const updatedHolidays = holidays.map(holiday => {
        if (holiday.id === id) {
          const updated = { ...holiday, ...holidayUpdate };
          // Recalculate total cost if any cost fields are updated
          if (holidayUpdate.travelTransportCost !== undefined || 
              holidayUpdate.accommodationCost !== undefined || 
              holidayUpdate.travelInsuranceCost !== undefined) {
            updated.totalCost = updated.travelTransportCost + updated.accommodationCost + updated.travelInsuranceCost;
          }
          return updated;
        }
        return holiday;
      });
      
      setHolidays(updatedHolidays);
      
      const holidaysKey = `holidays_${user.id}`;
      await storage.setItemAsync(holidaysKey, JSON.stringify(updatedHolidays));
    } catch (error) {
      console.error('Error updating holiday:', error);
    }
  };
  
  const deleteHoliday = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedHolidays = holidays.filter(holiday => holiday.id !== id);
      setHolidays(updatedHolidays);
      
      // Also delete related daily expenses
      const updatedExpenses = dailyExpenses.filter(expense => expense.holidayId !== id);
      setDailyExpenses(updatedExpenses);
      
      // Save both updates
      const holidaysKey = `holidays_${user.id}`;
      const expensesKey = `holiday_daily_expenses_${user.id}`;
      
      await Promise.all([
        storage.setItemAsync(holidaysKey, JSON.stringify(updatedHolidays)),
        storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses))
      ]);
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };

  // Daily Expense CRUD operations
  const addDailyExpense = async (expense: Omit<DailyExpense, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newExpense: DailyExpense = {
        ...expense,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedExpenses = [...dailyExpenses, newExpense];
      setDailyExpenses(updatedExpenses);
      
      const expensesKey = `holiday_daily_expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error adding daily expense:', error);
    }
  };
  
  const updateDailyExpense = async (id: string, expenseUpdate: Partial<DailyExpense>) => {
    if (!user) return;
    
    try {
      const updatedExpenses = dailyExpenses.map(expense => 
        expense.id === id ? { ...expense, ...expenseUpdate } : expense
      );
      
      setDailyExpenses(updatedExpenses);
      
      const expensesKey = `holiday_daily_expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error updating daily expense:', error);
    }
  };
  
  const deleteDailyExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedExpenses = dailyExpenses.filter(expense => expense.id !== id);
      setDailyExpenses(updatedExpenses);
      
      const expensesKey = `holiday_daily_expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error deleting daily expense:', error);
    }
  };

  // Helper functions
  const getDailyExpenses = (holidayId: string): DailyExpense[] => {
    return dailyExpenses.filter(expense => expense.holidayId === holidayId);
  };
  
  const getDailyExpensesByDay = (holidayId: string, dayNumber: number): DailyExpense[] => {
    return dailyExpenses.filter(expense => 
      expense.holidayId === holidayId && expense.dayNumber === dayNumber
    );
  };
  
  const getHolidayTotalCost = (holidayId: string): number => {
    const holiday = holidays.find(h => h.id === holidayId);
    if (!holiday) return 0;
    
    const dailyCosts = getHolidayDailyCosts(holidayId);
    return holiday.travelTransportCost + holiday.accommodationCost + holiday.travelInsuranceCost + dailyCosts;
  };
  
  const getHolidayDailyCosts = (holidayId: string): number => {
    return dailyExpenses
      .filter(expense => expense.holidayId === holidayId)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  return (
    <HolidayContext.Provider
      value={{
        holidays,
        dailyExpenses,
        addHoliday,
        updateHoliday,
        deleteHoliday,
        addDailyExpense,
        updateDailyExpense,
        deleteDailyExpense,
        getDailyExpenses,
        getDailyExpensesByDay,
        getHolidayTotalCost,
        getHolidayDailyCosts,
        isLoading
      }}
    >
      {children}
    </HolidayContext.Provider>
  );
};

// Custom hook for using the holiday context
export const useHoliday = () => {
  const context = useContext(HolidayContext);
  if (context === undefined) {
    throw new Error('useHoliday must be used within a HolidayProvider');
  }
  return context;
};