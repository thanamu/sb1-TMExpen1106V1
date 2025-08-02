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

// Vehicle Types
export type VehicleType = 'Car' | 'SUV' | 'UTE' | 'Pickup Truck' | 'Caravan' | 'Boat';
export type FuelType = 'Petrol' | 'Diesel' | 'LPG' | 'EV';
export type ConsumableType = 'Tyres' | 'Wiper Blades' | 'Engine Oil' | 'Other';

export type Vehicle = {
  id: string;
  userId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: string;
  registrationNumber: string;
  registrationDueDate: string;
  insuranceDueDate: string;
  serviceDueDate: string;
  fuelType: FuelType;
};

export type VehicleExpense = {
  id: string;
  userId: string;
  vehicleId: string;
  type: 'Insurance' | 'Registration' | 'Service' | 'Inspection' | 'Consumable' | 'Fuel';
  date: string;
  amount: number;
  hasReceipt: boolean;
  receiptUri?: string;
  
  // Insurance specific
  insuranceType?: string;
  
  // Registration specific
  registrationDate?: string;
  
  // Inspection specific
  inspectionDate?: string;
  
  // Service specific
  serviceType?: string;
  serviceNotes?: string;
  
  // Consumable specific
  consumableType?: ConsumableType;
  
  // Fuel specific
  fuelType?: FuelType;
  liters?: number;
  kilometers?: number;
};

// Define types
export type Expense = {
  id: string;
  userId: string;
  category: 'Grocery' | 'Café' | 'Restaurant' | 'Shopping' | 'Entertainment' | 'Vehicles' | 'Other';
  amount: number;
  date: string;
  hasReceipt: boolean;
  receiptUri?: string;
  
  // Entertainment specific fields
  entertainmentType?: string;
  entertainmentCost?: number;
  travelCost?: number;
  foodCost?: number;

  // Café specific fields
  cafeName?: string;
  foodDescription?: string;
  numberOfPatrons?: number;

  // Restaurant specific fields
  restaurantName?: string;
  restaurantFoodDescription?: string;
  restaurantPatrons?: number;

  // Shopping specific fields
  shopName?: string;
  itemDescription?: string;
};

export type Activity = {
  id: string;
  userId: string;
  type: string;
  duration: number; // in minutes
  kilojoules: number;
  steps: number;
  date: string;
  notes?: string;
};

type ExpenseSummary = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
};

type ActivitySummary = {
  dailyDuration: number;
  dailyKilojoules: number;
  dailySteps: number;
  weeklyDuration: number;
  weeklyKilojoules: number;
  weeklySteps: number;
  monthlyDuration: number;
  monthlyKilojoules: number;
  monthlySteps: number;
};

type DataContextType = {
  expenses: Expense[];
  activities: Activity[];
  vehicles: Vehicle[];
  vehicleExpenses: VehicleExpense[];
  expenseSummary: ExpenseSummary;
  activitySummary: ActivitySummary;
  addExpense: (expense: Omit<Expense, 'id' | 'userId'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'userId'>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'userId'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addVehicleExpense: (expense: Omit<VehicleExpense, 'id' | 'userId'>) => Promise<void>;
  updateVehicleExpense: (id: string, expense: Partial<VehicleExpense>) => Promise<void>;
  deleteVehicleExpense: (id: string) => Promise<void>;
  getVehicleExpenses: (vehicleId: string) => VehicleExpense[];
  isLoading: boolean;
};

// Helper function to generate unique IDs
let idCounter = 0;
const generateUniqueId = () => {
  const timestamp = Date.now();
  const counter = ++idCounter;
  return `${timestamp}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to normalize date to start of day in local timezone
const normalizeDateToDayStart = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

// Helper functions for date calculations
const isToday = (date: Date) => {
  const today = normalizeDateToDayStart(new Date());
  const normalizedDate = normalizeDateToDayStart(date);
  return normalizedDate.getTime() === today.getTime();
};

const isThisWeek = (date: Date) => {
  const now = normalizeDateToDayStart(new Date());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  const normalizedDate = normalizeDateToDayStart(date);
  return normalizedDate >= startOfWeek && normalizedDate <= endOfWeek;
};

const isThisMonth = (date: Date) => {
  const now = normalizeDateToDayStart(new Date());
  const normalizedDate = normalizeDateToDayStart(date);
  return normalizedDate.getMonth() === now.getMonth() &&
    normalizedDate.getFullYear() === now.getFullYear();
};

const isThisYear = (date: Date) => {
  const now = normalizeDateToDayStart(new Date());
  const normalizedDate = normalizeDateToDayStart(date);
  return normalizedDate.getFullYear() === now.getFullYear();
};

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleExpenses, setVehicleExpenses] = useState<VehicleExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize summary values
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0
  });
  
  const [activitySummary, setActivitySummary] = useState<ActivitySummary>({
    dailyDuration: 0,
    dailyKilojoules: 0,
    dailySteps: 0,
    weeklyDuration: 0,
    weeklyKilojoules: 0,
    weeklySteps: 0,
    monthlyDuration: 0,
    monthlyKilojoules: 0,
    monthlySteps: 0
  });

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setExpenses([]);
        setActivities([]);
        setVehicles([]);
        setVehicleExpenses([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load expenses
        const expensesKey = `expenses_${user.id}`;
        const expensesJson = await storage.getItemAsync(expensesKey);
        const loadedExpenses = expensesJson ? JSON.parse(expensesJson) : [];
        setExpenses(loadedExpenses);
        
        // Load activities
        const activitiesKey = `activities_${user.id}`;
        const activitiesJson = await storage.getItemAsync(activitiesKey);
        const loadedActivities = activitiesJson ? JSON.parse(activitiesJson) : [];
        setActivities(loadedActivities);
        
        // Load vehicles
        const vehiclesKey = `vehicles_${user.id}`;
        const vehiclesJson = await storage.getItemAsync(vehiclesKey);
        const loadedVehicles = vehiclesJson ? JSON.parse(vehiclesJson) : [];
        setVehicles(loadedVehicles);
        
        // Load vehicle expenses
        const vehicleExpensesKey = `vehicle_expenses_${user.id}`;
        const vehicleExpensesJson = await storage.getItemAsync(vehicleExpensesKey);
        const loadedVehicleExpenses = vehicleExpensesJson ? JSON.parse(vehicleExpensesJson) : [];
        setVehicleExpenses(loadedVehicleExpenses);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Calculate summaries whenever expenses or activities change
  useEffect(() => {
    if (!user) return;
    
    // Calculate expense summaries
    let daily = 0, weekly = 0, monthly = 0, yearly = 0;
    
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const amount = expense.amount;
      
      if (isToday(expenseDate)) daily += amount;
      if (isThisWeek(expenseDate)) weekly += amount;
      if (isThisMonth(expenseDate)) monthly += amount;
      if (isThisYear(expenseDate)) yearly += amount;
    });
    
    setExpenseSummary({ daily, weekly, monthly, yearly });
    
    // Calculate activity summaries
    let dailyDuration = 0, dailyKilojoules = 0, dailySteps = 0;
    let weeklyDuration = 0, weeklyKilojoules = 0, weeklySteps = 0;
    let monthlyDuration = 0, monthlyKilojoules = 0, monthlySteps = 0;
    
    activities.forEach(activity => {
      const activityDate = new Date(activity.date);
      
      if (isToday(activityDate)) {
        dailyDuration += activity.duration;
        dailyKilojoules += activity.kilojoules;
        dailySteps += activity.steps;
      }
      
      if (isThisWeek(activityDate)) {
        weeklyDuration += activity.duration;
        weeklyKilojoules += activity.kilojoules;
        weeklySteps += activity.steps;
      }
      
      if (isThisMonth(activityDate)) {
        monthlyDuration += activity.duration;
        monthlyKilojoules += activity.kilojoules;
        monthlySteps += activity.steps;
      }
    });
    
    setActivitySummary({
      dailyDuration,
      dailyKilojoules,
      dailySteps,
      weeklyDuration,
      weeklyKilojoules,
      weeklySteps,
      monthlyDuration,
      monthlyKilojoules,
      monthlySteps
    });
  }, [expenses, activities, user]);

  // CRUD operations for expenses
  const addExpense = async (expense: Omit<Expense, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newExpense: Expense = {
        ...expense,
        id: generateUniqueId(),
        userId: user.id
      };
      
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      
      // Save to storage
      const expensesKey = `expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };
  
  const updateExpense = async (id: string, expenseUpdate: Partial<Expense>) => {
    if (!user) return;
    
    try {
      const updatedExpenses = expenses.map(expense => 
        expense.id === id ? { ...expense, ...expenseUpdate } : expense
      );
      
      setExpenses(updatedExpenses);
      
      // Save to storage
      const expensesKey = `expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };
  
  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedExpenses = expenses.filter(expense => expense.id !== id);
      setExpenses(updatedExpenses);
      
      // Save to storage
      const expensesKey = `expenses_${user.id}`;
      await storage.setItemAsync(expensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };
  
  // CRUD operations for activities
  const addActivity = async (activity: Omit<Activity, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newActivity: Activity = {
        ...activity,
        id: generateUniqueId(),
        userId: user.id
      };
      
      const updatedActivities = [...activities, newActivity];
      setActivities(updatedActivities);
      
      // Save to storage
      const activitiesKey = `activities_${user.id}`;
      await storage.setItemAsync(activitiesKey, JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };
  
  const updateActivity = async (id: string, activityUpdate: Partial<Activity>) => {
    if (!user) return;
    
    try {
      const updatedActivities = activities.map(activity => 
        activity.id === id ? { ...activity, ...activityUpdate } : activity
      );
      
      setActivities(updatedActivities);
      
      // Save to storage
      const activitiesKey = `activities_${user.id}`;
      await storage.setItemAsync(activitiesKey, JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  };
  
  const deleteActivity = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedActivities = activities.filter(activity => activity.id !== id);
      setActivities(updatedActivities);
      
      // Save to storage
      const activitiesKey = `activities_${user.id}`;
      await storage.setItemAsync(activitiesKey, JSON.stringify(updatedActivities));
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  // Vehicle CRUD operations
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newVehicle: Vehicle = {
        ...vehicle,
        id: generateUniqueId(),
        userId: user.id
      };
      
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      
      // Save to storage
      const vehiclesKey = `vehicles_${user.id}`;
      await storage.setItemAsync(vehiclesKey, JSON.stringify(updatedVehicles));
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };
  
  const updateVehicle = async (id: string, vehicleUpdate: Partial<Vehicle>) => {
    if (!user) return;
    
    try {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, ...vehicleUpdate } : vehicle
      );
      
      setVehicles(updatedVehicles);
      
      // Save to storage
      const vehiclesKey = `vehicles_${user.id}`;
      await storage.setItemAsync(vehiclesKey, JSON.stringify(updatedVehicles));
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };
  
  const deleteVehicle = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      
      // Also delete related vehicle expenses
      const updatedVehicleExpenses = vehicleExpenses.filter(
        expense => expense.vehicleId !== id
      );
      setVehicleExpenses(updatedVehicleExpenses);
      
      // Save to storage
      const vehiclesKey = `vehicles_${user.id}`;
      await storage.setItemAsync(vehiclesKey, JSON.stringify(updatedVehicles));
      
      const vehicleExpensesKey = `vehicle_expenses_${user.id}`;
      await storage.setItemAsync(vehicleExpensesKey, JSON.stringify(updatedVehicleExpenses));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };
  
  // Vehicle Expense CRUD operations
  const addVehicleExpense = async (expense: Omit<VehicleExpense, 'id' | 'userId'>) => {
    if (!user) return;
    
    try {
      const newExpense: VehicleExpense = {
        ...expense,
        id: generateUniqueId(),
        userId: user.id
      };
      
      const updatedExpenses = [...vehicleExpenses, newExpense];
      setVehicleExpenses(updatedExpenses);
      
      // Save to storage
      const vehicleExpensesKey = `vehicle_expenses_${user.id}`;
      await storage.setItemAsync(vehicleExpensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error adding vehicle expense:', error);
    }
  };
  
  const updateVehicleExpense = async (id: string, expenseUpdate: Partial<VehicleExpense>) => {
    if (!user) return;
    
    try {
      const updatedExpenses = vehicleExpenses.map(expense => 
        expense.id === id ? { ...expense, ...expenseUpdate } : expense
      );
      
      setVehicleExpenses(updatedExpenses);
      
      // Save to storage
      const vehicleExpensesKey = `vehicle_expenses_${user.id}`;
      await storage.setItemAsync(vehicleExpensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error updating vehicle expense:', error);
    }
  };
  
  const deleteVehicleExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedExpenses = vehicleExpenses.filter(expense => expense.id !== id);
      setVehicleExpenses(updatedExpenses);
      
      // Save to storage
      const vehicleExpensesKey = `vehicle_expenses_${user.id}`;
      await storage.setItemAsync(vehicleExpensesKey, JSON.stringify(updatedExpenses));
    } catch (error) {
      console.error('Error deleting vehicle expense:', error);
    }
  };

  // Helper function to get expenses for a specific vehicle
  const getVehicleExpenses = (vehicleId: string): VehicleExpense[] => {
    return vehicleExpenses.filter(expense => expense.vehicleId === vehicleId);
  };

  return (
    <DataContext.Provider
      value={{
        expenses,
        activities,
        vehicles,
        vehicleExpenses,
        expenseSummary,
        activitySummary,
        addExpense,
        updateExpense,
        deleteExpense,
        addActivity,
        updateActivity,
        deleteActivity,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addVehicleExpense,
        updateVehicleExpense,
        deleteVehicleExpense,
        getVehicleExpenses,
        isLoading
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook for using the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};