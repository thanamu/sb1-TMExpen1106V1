import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

// Define types
export type Expense = {
  id: string;
  user_id: string;
  category: 'Grocery' | 'Café' | 'Restaurant' | 'Shopping' | 'Entertainment' | 'Vehicles' | 'Other';
  amount: number;
  date: string;
  has_receipt: boolean;
  receipt_uri?: string;
  
  // Entertainment specific fields
  entertainment_type?: string;
  entertainment_cost?: number;
  travel_cost?: number;
  food_cost?: number;

  // Café specific fields
  cafe_name?: string;
  food_description?: string;
  number_of_patrons?: number;

  // Restaurant specific fields
  restaurant_name?: string;
  restaurant_food_description?: string;
  restaurant_patrons?: number;

  // Shopping specific fields
  shop_name?: string;
  item_description?: string;
  
  created_at?: string;
  updated_at?: string;
};

export type Activity = {
  id: string;
  user_id: string;
  type: string;
  duration: number; // in minutes
  kilojoules: number;
  steps: number;
  date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type Vehicle = {
  id: string;
  user_id: string;
  type: 'Car' | 'SUV' | 'UTE' | 'Pickup Truck' | 'Caravan' | 'Boat';
  make: string;
  model: string;
  year: string;
  registration_number: string;
  registration_due_date?: string;
  insurance_due_date?: string;
  service_due_date?: string;
  fuel_type: 'Petrol' | 'Diesel' | 'LPG' | 'EV';
  created_at?: string;
  updated_at?: string;
};

export type VehicleExpense = {
  id: string;
  user_id: string;
  vehicle_id: string;
  type: 'Insurance' | 'Registration' | 'Service' | 'Inspection' | 'Consumable' | 'Fuel';
  date: string;
  amount: number;
  has_receipt: boolean;
  receipt_uri?: string;
  
  // Type-specific fields
  insurance_type?: string;
  registration_date?: string;
  inspection_date?: string;
  service_type?: string;
  service_notes?: string;
  consumable_type?: string;
  fuel_type?: string;
  liters?: number;
  kilometers?: number;
  
  created_at?: string;
  updated_at?: string;
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
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addVehicleExpense: (expense: Omit<VehicleExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVehicleExpense: (id: string, expense: Partial<VehicleExpense>) => Promise<void>;
  deleteVehicleExpense: (id: string) => Promise<void>;
  getVehicleExpenses: (vehicleId: string) => VehicleExpense[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
};

// Helper functions for date calculations
const isToday = (date: Date) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const isThisWeek = (date: Date) => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return date >= startOfWeek && date < endOfWeek;
};

const isThisMonth = (date: Date) => {
  const now = new Date();
  return date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
};

const isThisYear = (date: Date) => {
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
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
  const refreshData = async () => {
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
      
      // Load all data in parallel
      const [expensesResult, activitiesResult, vehiclesResult, vehicleExpensesResult] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('activities').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('vehicles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('vehicle_expenses').select('*').eq('user_id', user.id).order('date', { ascending: false })
      ]);
      
      if (expensesResult.error) throw expensesResult.error;
      if (activitiesResult.error) throw activitiesResult.error;
      if (vehiclesResult.error) throw vehiclesResult.error;
      if (vehicleExpensesResult.error) throw vehicleExpensesResult.error;
      
      setExpenses(expensesResult.data || []);
      setActivities(activitiesResult.data || []);
      setVehicles(vehiclesResult.data || []);
      setVehicleExpenses(vehicleExpensesResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
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
  const addExpense = async (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setExpenses(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };
  
  const updateExpense = async (id: string, expenseUpdate: Partial<Expense>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({ ...expenseUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setExpenses(prev => prev.map(expense => expense.id === id ? data : expense));
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };
  
  const deleteExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };
  
  // CRUD operations for activities
  const addActivity = async (activity: Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert([{ ...activity, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding activity:', error);
      throw error;
    }
  };
  
  const updateActivity = async (id: string, activityUpdate: Partial<Activity>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('activities')
        .update({ ...activityUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setActivities(prev => prev.map(activity => activity.id === id ? data : activity));
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  };
  
  const deleteActivity = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setActivities(prev => prev.filter(activity => activity.id !== id));
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  };

  // Vehicle CRUD operations
  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicle, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setVehicles(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      throw error;
    }
  };
  
  const updateVehicle = async (id: string, vehicleUpdate: Partial<Vehicle>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update({ ...vehicleUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setVehicles(prev => prev.map(vehicle => vehicle.id === id ? data : vehicle));
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  };
  
  const deleteVehicle = async (id: string) => {
    if (!user) return;
    
    try {
      // Delete vehicle and related expenses in a transaction
      const { error } = await supabase.rpc('delete_vehicle_with_expenses', { vehicle_id: id, user_id: user.id });
      
      if (error) throw error;
      
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      setVehicleExpenses(prev => prev.filter(expense => expense.vehicle_id !== id));
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  };
  
  // Vehicle Expense CRUD operations
  const addVehicleExpense = async (expense: Omit<VehicleExpense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .insert([{ ...expense, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      setVehicleExpenses(prev => [data, ...prev]);
    } catch (error) {
      console.error('Error adding vehicle expense:', error);
      throw error;
    }
  };
  
  const updateVehicleExpense = async (id: string, expenseUpdate: Partial<VehicleExpense>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('vehicle_expenses')
        .update({ ...expenseUpdate, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      setVehicleExpenses(prev => prev.map(expense => expense.id === id ? data : expense));
    } catch (error) {
      console.error('Error updating vehicle expense:', error);
      throw error;
    }
  };
  
  const deleteVehicleExpense = async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('vehicle_expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setVehicleExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting vehicle expense:', error);
      throw error;
    }
  };

  // Helper function to get expenses for a specific vehicle
  const getVehicleExpenses = (vehicleId: string): VehicleExpense[] => {
    return vehicleExpenses.filter(expense => expense.vehicle_id === vehicleId);
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
        isLoading,
        refreshData
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