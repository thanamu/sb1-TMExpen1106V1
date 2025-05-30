import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  ScrollView
} from 'react-native';
import { useData, Expense, Activity } from '@/context/DataContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, DollarSign, Zap, Footprints as FootprintsIcon } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type CalendarItem = {
  id: string;
  type: 'expense' | 'activity';
  date: string;
  title: string;
  amount?: number;
  category?: string;
  duration?: number;
  kilojoules?: number;
  steps?: number;
  color: string;
};

// Helper function to generate calendar days
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay(); // 0-6, where 0 is Sunday
  
  // Create array for days in month
  const days = [];
  
  // Add empty slots for days before the 1st of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ date: null, day: '', isCurrentMonth: false });
  }
  
  // Add days of the month
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const currentDate = isCurrentMonth ? today.getDate() : -1;
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      day: i.toString(),
      isCurrentMonth: true,
      isToday: i === currentDate && isCurrentMonth
    });
  }
  
  return days;
};

// Helper function to format date as YYYY-MM-DD
const formatYYYYMMDD = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper function to format date for display
const formatMonthYear = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long'
  };
  return date.toLocaleDateString('en-AU', options);
};

const CalendarScreen = () => {
  const { expenses, activities } = useData();
  
  // State for current month/year
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  
  // Set up the calendar days whenever the current date changes
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = generateCalendarDays(year, month);
    setCalendarDays(days);
  }, [currentDate]);
  
  // Update items whenever selected date or data changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const selectedDateStr = formatYYYYMMDD(selectedDate);
    const items: CalendarItem[] = [];
    
    // Add expenses for the selected date
    expenses
      .filter(expense => expense.date === selectedDateStr)
      .forEach(expense => {
        const expenseTypeColor = getExpenseColor(expense.category);
        
        items.push({
          id: `expense-${expense.id}`,
          type: 'expense',
          date: expense.date,
          title: expense.category,
          amount: expense.amount,
          category: expense.category,
          color: expenseTypeColor
        });
      });
    
    // Add activities for the selected date
    activities
      .filter(activity => activity.date === selectedDateStr)
      .forEach(activity => {
        const activityTypeColor = getActivityColor(activity.type);
        
        items.push({
          id: `activity-${activity.id}`,
          type: 'activity',
          date: activity.date,
          title: activity.type,
          duration: activity.duration,
          kilojoules: activity.kilojoules,
          steps: activity.steps,
          color: activityTypeColor
        });
      });
    
    // Sort by type and then title
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'expense' ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    });
    
    setCalendarItems(items);
  }, [selectedDate, expenses, activities]);
  
  // Get color for expense category
  const getExpenseColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Grocery': '#4CAF50',
      'Café': '#795548',
      'Restaurant': '#FF9800',
      'Shopping': '#E91E63',
      'Entertainment': '#673AB7',
      'Other': '#607D8B'
    };
    
    return categoryColors[category] || '#607D8B';
  };
  
  // Get color for activity type
  const getActivityColor = (type: string) => {
    const activityColors: Record<string, string> = {
      'Walking': '#4CAF50',
      'Running': '#FF9800',
      'Cycling': '#2196F3',
      'Swimming': '#00BCD4',
      'Gym': '#673AB7',
      'Yoga': '#E91E63',
      'Other': '#607D8B'
    };
    
    return activityColors[type] || '#607D8B';
  };
  
  // Navigation to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  // Navigation to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Go to today's date
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };
  
  // Select a date
  const handleSelectDate = (day: any) => {
    if (day.date) {
      setSelectedDate(day.date);
    }
  };
  
  // Get data for a specific date
  const getDateData = (date: Date | null) => {
    if (!date) return { hasExpense: false, hasActivity: false };
    
    const dateStr = formatYYYYMMDD(date);
    const hasExpense = expenses.some(expense => expense.date === dateStr);
    const hasActivity = activities.some(activity => activity.date === dateStr);
    
    return { hasExpense, hasActivity };
  };
  
  // Format date for display in the details section
  const formatSelectedDate = (date: Date | null) => {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-AU', options);
  };
  
  // Render a calendar day
  const renderDay = (day: any, index: number) => {
    if (!day.date) {
      return <View key={`empty-${index}`} style={styles.emptyDay} />;
    }
    
    const { hasExpense, hasActivity } = getDateData(day.date);
    const isSelected = selectedDate && 
      day.date.getDate() === selectedDate.getDate() && 
      day.date.getMonth() === selectedDate.getMonth() &&
      day.date.getFullYear() === selectedDate.getFullYear();
    
    return (
      <TouchableOpacity
        key={`day-${day.day}`}
        style={[
          styles.day,
          day.isToday && styles.today,
          isSelected && styles.selectedDay
        ]}
        onPress={() => handleSelectDate(day)}
      >
        <Text style={[
          styles.dayText,
          day.isToday && styles.todayText,
          isSelected && styles.selectedDayText
        ]}>
          {day.day}
        </Text>
        
        <View style={styles.indicators}>
          {hasExpense && <View style={[styles.indicator, styles.expenseIndicator]} />}
          {hasActivity && <View style={[styles.indicator, styles.activityIndicator]} />}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render calendar item
  const renderCalendarItem = ({ item }: { item: CalendarItem }) => (
    <Animated.View 
      entering={FadeInUp.delay(100).duration(300)}
      style={[styles.itemCard, { borderLeftColor: item.color }]}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
      
      {item.type === 'expense' && (
        <View style={styles.expenseDetails}>
          <DollarSign size={16} color="#666666" />
          <Text style={styles.expenseAmount}>${item.amount?.toFixed(2)}</Text>
        </View>
      )}
      
      {item.type === 'activity' && (
        <View style={styles.activityDetails}>
          <View style={styles.activityMetric}>
            <Clock size={16} color="#666666" />
            <Text style={styles.metricText}>{item.duration} mins</Text>
          </View>
          
          <View style={styles.activityMetric}>
            <Zap size={16} color="#666666" />
            <Text style={styles.metricText}>{item.kilojoules} kJ</Text>
          </View>
          
          <View style={styles.activityMetric}>
            <FootprintsIcon size={16} color="#666666" />
            <Text style={styles.metricText}>{item.steps}</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <ChevronLeft size={24} color="#333333" />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthTitle}>{formatMonthYear(currentDate)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <ChevronRight size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      
      {/* Day of Week Headers */}
      <View style={styles.daysOfWeek}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.dayOfWeekText}>{day}</Text>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => renderDay(day, index))}
      </View>
      
      {/* Today Button */}
      <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
        <CalendarIcon size={16} color="#FFFFFF" />
        <Text style={styles.todayButtonText}>Today</Text>
      </TouchableOpacity>
      
      {/* Selected Date Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.selectedDateText}>
          {selectedDate ? formatSelectedDate(selectedDate) : 'Select a date'}
        </Text>
        
        {calendarItems.length > 0 ? (
          <FlatList
            data={calendarItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCalendarItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No expenses or activities recorded for this date
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
  },
  daysOfWeek: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666666',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333333',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  today: {
    backgroundColor: '#E6F4F4',
    borderRadius: 20,
  },
  todayText: {
    fontFamily: 'Inter-Bold',
    color: '#008080',
  },
  selectedDay: {
    backgroundColor: '#008080',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
  },
  indicators: {
    flexDirection: 'row',
    marginTop: 2,
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  expenseIndicator: {
    backgroundColor: '#E53935',
  },
  activityIndicator: {
    backgroundColor: '#4CAF50',
  },
  todayButton: {
    position: 'absolute',
    right: 16,
    top: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#008080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  todayButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  selectedDateText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  itemsList: {
    paddingBottom: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  expenseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  activityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  activityMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metricText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default CalendarScreen;