import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { ChartBar as BarChart, ChartPie as PieChart, Activity, DollarSign, Bike, Coffee, ShoppingBag, ShoppingCart, Film } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

const HomeScreen = () => {
  const { user } = useAuth();
  const { 
    expenses, 
    activities, 
    expenseSummary, 
    activitySummary 
  } = useData();
  
  // Get recent expenses (last 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Get recent activities (last 5)
  const recentActivities = [...activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Get expense categories with their total amounts
  const expenseCategories = expenses.reduce((acc, expense) => {
    const category = expense.category;
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Format categories for display
  const formattedCategories = Object.entries(expenseCategories)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: expenses.length > 0 
        ? Math.round((amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100) 
        : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Get activity types with their total durations
  const activityTypes = activities.reduce((acc, activity) => {
    const type = activity.type;
    acc[type] = (acc[type] || 0) + activity.duration;
    return acc;
  }, {} as Record<string, number>);
  
  // Format activity types for display
  const formattedActivityTypes = Object.entries(activityTypes)
    .map(([type, duration]) => ({
      type,
      duration,
      percentage: activities.length > 0 
        ? Math.round((duration / activities.reduce((sum, a) => sum + a.duration, 0)) * 100) 
        : 0
    }))
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 5);
  
  // Helper to get icon for expense category
  const getExpenseCategoryIcon = (category: string) => {
    switch (category) {
      case 'Grocery':
        return <ShoppingCart size={20} color="#4CAF50" />;
      case 'Café':
        return <Coffee size={20} color="#795548" />;
      case 'Restaurant':
        return <Coffee size={20} color="#FF9800" />;
      case 'Shopping':
        return <ShoppingBag size={20} color="#E91E63" />;
      case 'Entertainment':
        return <Film size={20} color="#673AB7" />;
      default:
        return <DollarSign size={20} color="#607D8B" />;
    }
  };
  
  // Helper to get icon for activity type
  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case 'Walking':
        return <Activity size={20} color="#4CAF50" />;
      case 'Running':
        return <Activity size={20} color="#FF9800" />;
      case 'Cycling':
        return <Bike size={20} color="#2196F3" />;
      case 'Swimming':
        return <Activity size={20} color="#00BCD4" />;
      case 'Gym':
        return <Activity size={20} color="#673AB7" />;
      case 'Yoga':
        return <Activity size={20} color="#E91E63" />;
      default:
        return <Activity size={20} color="#607D8B" />;
    }
  };
  
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Helper to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-AU', options);
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg' }}
          style={styles.bannerImage}
        />
        <View style={styles.bannerOverlay} />
        <View style={styles.bannerContent}>
          <Text style={styles.welcomeText}>
            Welcome back, {user?.user_metadata?.first_name || 'User'}
          </Text>
          <Text style={styles.welcomeSubtext}>
            Keep track of your expenses and stay active
          </Text>
        </View>
      </View>
      
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <Animated.View 
          entering={FadeInDown.delay(100).duration(500)}
          style={[styles.summaryCard, styles.expenseSummaryCard]}
        >
          <View style={styles.summaryHeader}>
            <DollarSign size={24} color="#008080" />
            <Text style={styles.summaryTitle}>Expenses</Text>
          </View>
          
          <View style={styles.summaryValues}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Today</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(expenseSummary.daily)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Week</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(expenseSummary.weekly)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>This Month</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(expenseSummary.monthly)}
              </Text>
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(200).duration(500)}
          style={[styles.summaryCard, styles.activitySummaryCard]}
        >
          <View style={styles.summaryHeader}>
            <Activity size={24} color="#008080" />
            <Text style={styles.summaryTitle}>Activities</Text>
          </View>
          
          <View style={styles.summaryValues}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Duration</Text>
              <Text style={styles.summaryValue}>
                {activitySummary.dailyDuration} mins
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Energy</Text>
              <Text style={styles.summaryValue}>
                {activitySummary.dailyKilojoules} kJ
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Steps</Text>
              <Text style={styles.summaryValue}>
                {activitySummary.dailySteps}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
      
      {/* Expense Breakdown */}
      <Animated.View 
        entering={FadeInRight.delay(300).duration(500)}
        style={styles.sectionContainer}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <BarChart size={20} color="#008080" />
            <Text style={styles.sectionTitle}>Expense Breakdown</Text>
          </View>
        </View>
        
        <View style={styles.breakdownContainer}>
          {formattedCategories.length > 0 ? (
            formattedCategories.map((cat, index) => (
              <View key={cat.category} style={styles.breakdownItem}>
                {getExpenseCategoryIcon(cat.category)}
                <View style={styles.breakdownContent}>
                  <View style={styles.breakdownDetails}>
                    <Text style={styles.breakdownCategory}>{cat.category}</Text>
                    <Text style={styles.breakdownAmount}>
                      {formatCurrency(cat.amount)}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${cat.percentage}%` },
                        { backgroundColor: index === 0 ? '#008080' : '#70C1C1' }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No expense data available</Text>
          )}
        </View>
      </Animated.View>
      
      {/* Activity Breakdown */}
      <Animated.View 
        entering={FadeInRight.delay(400).duration(500)}
        style={styles.sectionContainer}
      >
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <PieChart size={20} color="#008080" />
            <Text style={styles.sectionTitle}>Activity Breakdown</Text>
          </View>
        </View>
        
        <View style={styles.breakdownContainer}>
          {formattedActivityTypes.length > 0 ? (
            formattedActivityTypes.map((act, index) => (
              <View key={act.type} style={styles.breakdownItem}>
                {getActivityTypeIcon(act.type)}
                <View style={styles.breakdownContent}>
                  <View style={styles.breakdownDetails}>
                    <Text style={styles.breakdownCategory}>{act.type}</Text>
                    <Text style={styles.breakdownAmount}>
                      {act.duration} mins
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${act.percentage}%` },
                        { backgroundColor: index === 0 ? '#008080' : '#70C1C1' }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No activity data available</Text>
          )}
        </View>
      </Animated.View>
      
      {/* Recent Transactions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <DollarSign size={20} color="#008080" />
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
          </View>
        </View>
        
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense, index) => (
            <Animated.View 
              key={expense.id} 
              entering={FadeInDown.delay(500 + index * 100).duration(400)}
              style={styles.transactionItem}
            >
              <View style={styles.transactionIcon}>
                {getExpenseCategoryIcon(expense.category)}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{expense.category}</Text>
                <Text style={styles.transactionDate}>{formatDate(expense.date)}</Text>
              </View>
              <Text style={styles.transactionAmount}>
                ${expense.amount.toFixed(2)}
              </Text>
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent expenses</Text>
        )}
      </View>
      
      {/* Recent Activities */}
      <View style={[styles.sectionContainer, { marginBottom: 24 }]}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Activity size={20} color="#008080" />
            <Text style={styles.sectionTitle}>Recent Activities</Text>
          </View>
        </View>
        
        {recentActivities.length > 0 ? (
          recentActivities.map((activity, index) => (
            <Animated.View 
              key={activity.id} 
              entering={FadeInDown.delay(800 + index * 100).duration(400)}
              style={styles.transactionItem}
            >
              <View style={styles.transactionIcon}>
                {getActivityTypeIcon(activity.type)}
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{activity.type}</Text>
                <Text style={styles.transactionDate}>{formatDate(activity.date)}</Text>
              </View>
              <Text style={styles.transactionAmount}>
                {activity.duration} mins
              </Text>
            </Animated.View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent activities</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  welcomeBanner: {
    height: 150,
    position: 'relative',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 128, 128, 0.7)',
  },
  bannerContent: {
    padding: 24,
    height: '100%',
    justifyContent: 'center',
  },
  welcomeText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  summaryContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseSummaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  activitySummaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginLeft: 8,
  },
  summaryValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  breakdownContainer: {
    marginBottom: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownContent: {
    flex: 1,
    marginLeft: 12,
  },
  breakdownDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breakdownCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  breakdownAmount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#EEEEEE',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  transactionDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  transactionAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    padding: 16,
  },
});

export default HomeScreen;