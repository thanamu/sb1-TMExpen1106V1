import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Home, DollarSign, Activity, Calendar, Car, Plane } from 'lucide-react-native';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/context/AuthContext';

export default function TabLayout() {
  const { user } = useAuth();
  
  // If no user is logged in, we shouldn't render the tabs
  if (!user) {
    return null;
  }
  
  return (
    <>
      <TopBar />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#008080',
          tabBarInactiveTintColor: '#999999',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Expenses',
            tabBarIcon: ({ color, size }) => (
              <DollarSign size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="activities"
          options={{
            title: 'Activities',
            tabBarIcon: ({ color, size }) => (
              <Activity size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="vehicles"
          options={{
            title: 'Vehicles',
            tabBarIcon: ({ color, size }) => (
              <Car size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="homes"
          options={{
            title: 'Homes',
            tabBarIcon: ({ color, size }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="holidays"
          options={{
            title: 'Holidays',
            tabBarIcon: ({ color, size }) => (
              <Plane size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color, size }) => (
              <Calendar size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
});