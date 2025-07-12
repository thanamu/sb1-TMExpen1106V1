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
export type HomeType = 'House' | 'Town house' | 'Unit / Apartment';
export type OwnershipType = 'Owner/Occupier' | 'Paying off home loan' | 'Renter' | 'Investor';
export type InsuranceType = 'Home' | 'Contents' | 'Home & Contents' | 'Landlord';

export type Home = {
  id: string;
  userId: string;
  name: string;
  type: HomeType;
  ownershipType: OwnershipType;
  repaymentAmount?: number;
  rent?: number;
  councilRates?: number;
  strataFees?: number;
  address?: string;
  createdAt: string;
};

export type HomeInsurance = {
  id: string;
  userId: string;
  homeId: string;
  type: InsuranceType;
  cost: number;
  renewalDate: string;
  provider?: string;
  policyNumber?: string;
  createdAt: string;
};

export type SmokeAlarm = {
  id: string;
  userId: string;
  homeId: string;
  location: string;
  batteryReplacementDate: string;
  nextReplacementDue: string;
  notes?: string;
  createdAt: string;
};

export type RepairMaintenance = {
  id: string;
  userId: string;
  homeId: string;
  description: string;
  repairerName: string;
  repairerCompany?: string;
  workDate: string;
  paidDate: string;
  amount: number;
  category: string;
  notes?: string;
  createdAt: string;
};

export type UtilityBill = {
  id: string;
  userId: string;
  homeId: string;
  type: 'Water' | 'Electricity' | 'Gas' | 'Internet' | 'Other';
  provider?: string;
  planName?: string;
  serviceDescription?: string;
  billingDate: string;
  amount: number;
  datePaid: string;
  accountNumber?: string;
  notes?: string;
  createdAt: string;
};

type HomeContextType = {
  homes: Home[];
  homeInsurances: HomeInsurance[];
  smokeAlarms: SmokeAlarm[];
  repairMaintenances: RepairMaintenance[];
  utilityBills: UtilityBill[];
  
  // Home CRUD
  addHome: (home: Omit<Home, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateHome: (id: string, home: Partial<Home>) => Promise<void>;
  deleteHome: (id: string) => Promise<void>;
  
  // Insurance CRUD
  addHomeInsurance: (insurance: Omit<HomeInsurance, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateHomeInsurance: (id: string, insurance: Partial<HomeInsurance>) => Promise<void>;
  deleteHomeInsurance: (id: string) => Promise<void>;
  getHomeInsurances: (homeId: string) => HomeInsurance[];
  
  // Smoke Alarm CRUD
  addSmokeAlarm: (alarm: Omit<SmokeAlarm, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateSmokeAlarm: (id: string, alarm: Partial<SmokeAlarm>) => Promise<void>;
  deleteSmokeAlarm: (id: string) => Promise<void>;
  getSmokeAlarms: (homeId: string) => SmokeAlarm[];
  
  // Repair & Maintenance CRUD
  addRepairMaintenance: (repair: Omit<RepairMaintenance, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateRepairMaintenance: (id: string, repair: Partial<RepairMaintenance>) => Promise<void>;
  deleteRepairMaintenance: (id: string) => Promise<void>;
  getRepairMaintenances: (homeId: string) => RepairMaintenance[];
  
  // Utility Bills CRUD
  addUtilityBill: (bill: Omit<UtilityBill, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateUtilityBill: (id: string, bill: Partial<UtilityBill>) => Promise<void>;
  deleteUtilityBill: (id: string) => Promise<void>;
  getUtilityBills: (homeId: string) => UtilityBill[];
  
  isLoading: boolean;
};

// Helper function to generate unique IDs
let idCounter = 0;
const generateUniqueId = () => {
  const timestamp = Date.now();
  const counter = ++idCounter;
  return `home-${timestamp}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
};

// Create context
const HomeContext = createContext<HomeContextType | undefined>(undefined);

// Provider component
export const HomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [homes, setHomes] = useState<Home[]>([]);
  const [homeInsurances, setHomeInsurances] = useState<HomeInsurance[]>([]);
  const [smokeAlarms, setSmokeAlarms] = useState<SmokeAlarm[]>([]);
  const [repairMaintenances, setRepairMaintenances] = useState<RepairMaintenance[]>([]);
  const [utilityBills, setUtilityBills] = useState<UtilityBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data when user changes
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setHomes([]);
        setHomeInsurances([]);
        setSmokeAlarms([]);
        setRepairMaintenances([]);
        setUtilityBills([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Load homes
        const homesKey = `homes_${user.id}`;
        const homesJson = await storage.getItemAsync(homesKey);
        const loadedHomes = homesJson ? JSON.parse(homesJson) : [];
        setHomes(loadedHomes);
        
        // Load home insurances
        const insurancesKey = `home_insurances_${user.id}`;
        const insurancesJson = await storage.getItemAsync(insurancesKey);
        const loadedInsurances = insurancesJson ? JSON.parse(insurancesJson) : [];
        setHomeInsurances(loadedInsurances);
        
        // Load smoke alarms
        const alarmsKey = `smoke_alarms_${user.id}`;
        const alarmsJson = await storage.getItemAsync(alarmsKey);
        const loadedAlarms = alarmsJson ? JSON.parse(alarmsJson) : [];
        setSmokeAlarms(loadedAlarms);
        
        // Load repair maintenances
        const repairsKey = `repair_maintenances_${user.id}`;
        const repairsJson = await storage.getItemAsync(repairsKey);
        const loadedRepairs = repairsJson ? JSON.parse(repairsJson) : [];
        setRepairMaintenances(loadedRepairs);
        
        // Load utility bills
        const billsKey = `utility_bills_${user.id}`;
        const billsJson = await storage.getItemAsync(billsKey);
        const loadedBills = billsJson ? JSON.parse(billsJson) : [];
        setUtilityBills(loadedBills);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Home CRUD operations
  const addHome = async (home: Omit<Home, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newHome: Home = {
        ...home,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedHomes = [...homes, newHome];
      setHomes(updatedHomes);
      
      const homesKey = `homes_${user.id}`;
      await storage.setItemAsync(homesKey, JSON.stringify(updatedHomes));
    } catch (error) {
      console.error('Error adding home:', error);
    }
  };
  
  const updateHome = async (id: string, homeUpdate: Partial<Home>) => {
    if (!user) return;
    
    try {
      const updatedHomes = homes.map(home => 
        home.id === id ? { ...home, ...homeUpdate } : home
      );
      
      setHomes(updatedHomes);
      
      const homesKey = `homes_${user.id}`;
      await storage.setItemAsync(homesKey, JSON.stringify(updatedHomes));
    } catch (error) {
      console.error('Error updating home:', error);
    }
  };
  
  const deleteHome = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedHomes = homes.filter(home => home.id !== id);
      setHomes(updatedHomes);
      
      // Also delete related data
      const updatedInsurances = homeInsurances.filter(ins => ins.homeId !== id);
      const updatedAlarms = smokeAlarms.filter(alarm => alarm.homeId !== id);
      const updatedRepairs = repairMaintenances.filter(repair => repair.homeId !== id);
      const updatedBills = utilityBills.filter(bill => bill.homeId !== id);
      
      setHomeInsurances(updatedInsurances);
      setSmokeAlarms(updatedAlarms);
      setRepairMaintenances(updatedRepairs);
      setUtilityBills(updatedBills);
      
      // Save all updated data
      const homesKey = `homes_${user.id}`;
      const insurancesKey = `home_insurances_${user.id}`;
      const alarmsKey = `smoke_alarms_${user.id}`;
      const repairsKey = `repair_maintenances_${user.id}`;
      const billsKey = `utility_bills_${user.id}`;
      
      await Promise.all([
        storage.setItemAsync(homesKey, JSON.stringify(updatedHomes)),
        storage.setItemAsync(insurancesKey, JSON.stringify(updatedInsurances)),
        storage.setItemAsync(alarmsKey, JSON.stringify(updatedAlarms)),
        storage.setItemAsync(repairsKey, JSON.stringify(updatedRepairs)),
        storage.setItemAsync(billsKey, JSON.stringify(updatedBills))
      ]);
    } catch (error) {
      console.error('Error deleting home:', error);
    }
  };

  // Insurance CRUD operations
  const addHomeInsurance = async (insurance: Omit<HomeInsurance, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newInsurance: HomeInsurance = {
        ...insurance,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedInsurances = [...homeInsurances, newInsurance];
      setHomeInsurances(updatedInsurances);
      
      const insurancesKey = `home_insurances_${user.id}`;
      await storage.setItemAsync(insurancesKey, JSON.stringify(updatedInsurances));
    } catch (error) {
      console.error('Error adding home insurance:', error);
    }
  };
  
  const updateHomeInsurance = async (id: string, insuranceUpdate: Partial<HomeInsurance>) => {
    if (!user) return;
    
    try {
      const updatedInsurances = homeInsurances.map(insurance => 
        insurance.id === id ? { ...insurance, ...insuranceUpdate } : insurance
      );
      
      setHomeInsurances(updatedInsurances);
      
      const insurancesKey = `home_insurances_${user.id}`;
      await storage.setItemAsync(insurancesKey, JSON.stringify(updatedInsurances));
    } catch (error) {
      console.error('Error updating home insurance:', error);
    }
  };
  
  const deleteHomeInsurance = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedInsurances = homeInsurances.filter(insurance => insurance.id !== id);
      setHomeInsurances(updatedInsurances);
      
      const insurancesKey = `home_insurances_${user.id}`;
      await storage.setItemAsync(insurancesKey, JSON.stringify(updatedInsurances));
    } catch (error) {
      console.error('Error deleting home insurance:', error);
    }
  };
  
  const getHomeInsurances = (homeId: string): HomeInsurance[] => {
    return homeInsurances.filter(insurance => insurance.homeId === homeId);
  };

  // Smoke Alarm CRUD operations
  const addSmokeAlarm = async (alarm: Omit<SmokeAlarm, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newAlarm: SmokeAlarm = {
        ...alarm,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedAlarms = [...smokeAlarms, newAlarm];
      setSmokeAlarms(updatedAlarms);
      
      const alarmsKey = `smoke_alarms_${user.id}`;
      await storage.setItemAsync(alarmsKey, JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error adding smoke alarm:', error);
    }
  };
  
  const updateSmokeAlarm = async (id: string, alarmUpdate: Partial<SmokeAlarm>) => {
    if (!user) return;
    
    try {
      const updatedAlarms = smokeAlarms.map(alarm => 
        alarm.id === id ? { ...alarm, ...alarmUpdate } : alarm
      );
      
      setSmokeAlarms(updatedAlarms);
      
      const alarmsKey = `smoke_alarms_${user.id}`;
      await storage.setItemAsync(alarmsKey, JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error updating smoke alarm:', error);
    }
  };
  
  const deleteSmokeAlarm = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedAlarms = smokeAlarms.filter(alarm => alarm.id !== id);
      setSmokeAlarms(updatedAlarms);
      
      const alarmsKey = `smoke_alarms_${user.id}`;
      await storage.setItemAsync(alarmsKey, JSON.stringify(updatedAlarms));
    } catch (error) {
      console.error('Error deleting smoke alarm:', error);
    }
  };
  
  const getSmokeAlarms = (homeId: string): SmokeAlarm[] => {
    return smokeAlarms.filter(alarm => alarm.homeId === homeId);
  };

  // Repair & Maintenance CRUD operations
  const addRepairMaintenance = async (repair: Omit<RepairMaintenance, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newRepair: RepairMaintenance = {
        ...repair,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedRepairs = [...repairMaintenances, newRepair];
      setRepairMaintenances(updatedRepairs);
      
      const repairsKey = `repair_maintenances_${user.id}`;
      await storage.setItemAsync(repairsKey, JSON.stringify(updatedRepairs));
    } catch (error) {
      console.error('Error adding repair maintenance:', error);
    }
  };
  
  const updateRepairMaintenance = async (id: string, repairUpdate: Partial<RepairMaintenance>) => {
    if (!user) return;
    
    try {
      const updatedRepairs = repairMaintenances.map(repair => 
        repair.id === id ? { ...repair, ...repairUpdate } : repair
      );
      
      setRepairMaintenances(updatedRepairs);
      
      const repairsKey = `repair_maintenances_${user.id}`;
      await storage.setItemAsync(repairsKey, JSON.stringify(updatedRepairs));
    } catch (error) {
      console.error('Error updating repair maintenance:', error);
    }
  };
  
  const deleteRepairMaintenance = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedRepairs = repairMaintenances.filter(repair => repair.id !== id);
      setRepairMaintenances(updatedRepairs);
      
      const repairsKey = `repair_maintenances_${user.id}`;
      await storage.setItemAsync(repairsKey, JSON.stringify(updatedRepairs));
    } catch (error) {
      console.error('Error deleting repair maintenance:', error);
    }
  };
  
  const getRepairMaintenances = (homeId: string): RepairMaintenance[] => {
    return repairMaintenances.filter(repair => repair.homeId === homeId);
  };

  // Utility Bills CRUD operations
  const addUtilityBill = async (bill: Omit<UtilityBill, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      const newBill: UtilityBill = {
        ...bill,
        id: generateUniqueId(),
        userId: user.id,
        createdAt: new Date().toISOString()
      };
      
      const updatedBills = [...utilityBills, newBill];
      setUtilityBills(updatedBills);
      
      const billsKey = `utility_bills_${user.id}`;
      await storage.setItemAsync(billsKey, JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Error adding utility bill:', error);
    }
  };
  
  const updateUtilityBill = async (id: string, billUpdate: Partial<UtilityBill>) => {
    if (!user) return;
    
    try {
      const updatedBills = utilityBills.map(bill => 
        bill.id === id ? { ...bill, ...billUpdate } : bill
      );
      
      setUtilityBills(updatedBills);
      
      const billsKey = `utility_bills_${user.id}`;
      await storage.setItemAsync(billsKey, JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Error updating utility bill:', error);
    }
  };
  
  const deleteUtilityBill = async (id: string) => {
    if (!user) return;
    
    try {
      const updatedBills = utilityBills.filter(bill => bill.id !== id);
      setUtilityBills(updatedBills);
      
      const billsKey = `utility_bills_${user.id}`;
      await storage.setItemAsync(billsKey, JSON.stringify(updatedBills));
    } catch (error) {
      console.error('Error deleting utility bill:', error);
    }
  };
  
  const getUtilityBills = (homeId: string): UtilityBill[] => {
    return utilityBills.filter(bill => bill.homeId === homeId);
  };

  return (
    <HomeContext.Provider
      value={{
        homes,
        homeInsurances,
        smokeAlarms,
        repairMaintenances,
        utilityBills,
        addHome,
        updateHome,
        deleteHome,
        addHomeInsurance,
        updateHomeInsurance,
        deleteHomeInsurance,
        getHomeInsurances,
        addSmokeAlarm,
        updateSmokeAlarm,
        deleteSmokeAlarm,
        getSmokeAlarms,
        addRepairMaintenance,
        updateRepairMaintenance,
        deleteRepairMaintenance,
        getRepairMaintenances,
        addUtilityBill,
        updateUtilityBill,
        deleteUtilityBill,
        getUtilityBills,
        isLoading
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

// Custom hook for using the home context
export const useHome = () => {
  const context = useContext(HomeContext);
  if (context === undefined) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};