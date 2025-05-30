import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useWeather } from '@/context/WeatherContext';
import { useRouter } from 'expo-router';
import { Menu, X, RefreshCw, LogOut, PieChart, BarChart } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { expenseSummary, activitySummary } = useData();
  const { weather, refreshWeather, isLoading } = useWeather();
  const router = useRouter();
  
  const [menuVisible, setMenuVisible] = useState(false);
  const [statsType, setStatsType] = useState<'expense' | 'activity' | null>(null);
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AU', { 
      style: 'currency', 
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  const handleLogout = async () => {
    await logout();
    setMenuVisible(false);
    router.replace('/');
  };
  
  const toggleMenu = () => setMenuVisible(!menuVisible);
  
  const showExpenseStats = () => {
    setStatsType('expense');
  };
  
  const showActivityStats = () => {
    setStatsType('activity');
  };
  
  const closeStats = () => {
    setStatsType(null);
  };
  
  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-AU', options);
  };
  
  return (
    <>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <Text style={styles.greeting}>
            Hello, <Text style={styles.username}>{user?.firstName || 'User'}</Text>
          </Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.weatherContainer} 
          onPress={refreshWeather}
          disabled={isLoading}
        >
          {weather ? (
            <>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
              <View>
                <Text style={styles.temperature}>{weather.temperature}°C</Text>
                <Text style={styles.location}>{user?.suburb || 'Location'}</Text>
              </View>
            </>
          ) : (
            <RefreshCw size={20} color="#666" />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Menu size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>{formatCurrency(expenseSummary.daily)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Week</Text>
          <Text style={styles.statValue}>{formatCurrency(expenseSummary.weekly)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Month</Text>
          <Text style={styles.statValue}>{formatCurrency(expenseSummary.monthly)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Steps</Text>
          <Text style={styles.statValue}>{activitySummary.dailySteps}</Text>
        </View>
      </View>
      
      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View 
            entering={FadeInDown.duration(300)}
            style={styles.menuContainer}
          >
            <TouchableOpacity style={styles.menuItem} onPress={showExpenseStats}>
              <BarChart size={20} color="#008080" />
              <Text style={styles.menuItemText}>Expense Statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={showActivityStats}>
              <PieChart size={20} color="#008080" />
              <Text style={styles.menuItemText}>Activity Statistics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <LogOut size={20} color="#E53935" />
              <Text style={[styles.menuItemText, styles.logoutText]}>Log Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.closeButton} onPress={toggleMenu}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
      
      {/* Stats Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statsType !== null}
        onRequestClose={closeStats}
      >
        <View style={styles.statsModalContainer}>
          <View style={styles.statsModalContent}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>
                {statsType === 'expense' ? 'Expense Statistics' : 'Activity Statistics'}
              </Text>
              <TouchableOpacity style={styles.closeStatsButton} onPress={closeStats}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.statsScrollView}>
              {statsType === 'expense' ? (
                <>
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>Daily</Text>
                    <Text style={styles.statAmount}>{formatCurrency(expenseSummary.daily)}</Text>
                  </View>
                  
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>Weekly</Text>
                    <Text style={styles.statAmount}>{formatCurrency(expenseSummary.weekly)}</Text>
                  </View>
                  
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>Monthly</Text>
                    <Text style={styles.statAmount}>{formatCurrency(expenseSummary.monthly)}</Text>
                  </View>
                  
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>Yearly</Text>
                    <Text style={styles.statAmount}>{formatCurrency(expenseSummary.yearly)}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>Today's Activity</Text>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Duration:</Text>
                      <Text style={styles.activityValue}>{activitySummary.dailyDuration} mins</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Energy:</Text>
                      <Text style={styles.activityValue}>{activitySummary.dailyKilojoules} kJ</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Steps:</Text>
                      <Text style={styles.activityValue}>{activitySummary.dailySteps}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>This Week</Text>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Duration:</Text>
                      <Text style={styles.activityValue}>{activitySummary.weeklyDuration} mins</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Energy:</Text>
                      <Text style={styles.activityValue}>{activitySummary.weeklyKilojoules} kJ</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Steps:</Text>
                      <Text style={styles.activityValue}>{activitySummary.weeklySteps}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.statGroup}>
                    <Text style={styles.statGroupTitle}>This Month</Text>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Duration:</Text>
                      <Text style={styles.activityValue}>{activitySummary.monthlyDuration} mins</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Energy:</Text>
                      <Text style={styles.activityValue}>{activitySummary.monthlyKilojoules} kJ</Text>
                    </View>
                    <View style={styles.activityStat}>
                      <Text style={styles.activityLabel}>Steps:</Text>
                      <Text style={styles.activityValue}>{activitySummary.monthlySteps}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // Adjust for status bar
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  leftSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  username: {
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  date: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Inter-Regular',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  weatherIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  temperature: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#333333',
  },
  location: {
    fontSize: 12,
    color: '#888888',
    fontFamily: 'Inter-Regular',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#F6F8FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Inter-Regular',
  },
  statValue: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'Inter-Bold',
  },
  divider: {
    width: 1,
    backgroundColor: '#DDDDDD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  menuContainer: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
    marginLeft: 12,
  },
  logoutText: {
    color: '#E53935',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  statsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#333333',
  },
  closeStatsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsScrollView: {
    maxHeight: '100%',
  },
  statGroup: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F6F8FA',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  statGroupTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  statAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#008080',
  },
  activityStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  activityLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  activityValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
  },
});

export default TopBar;