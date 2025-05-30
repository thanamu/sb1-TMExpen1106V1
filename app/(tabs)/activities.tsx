import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { useData, Activity } from '@/context/DataContext';
import { Clock, Zap, Footprints as FootprintsIcon, Calendar, Plus, ChevronDown, X, Activity as ActivityIcon } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

// Activity types with their associated colors
const ACTIVITY_TYPES = [
  { label: 'Walking', color: '#4CAF50', icon: 'footprints' },
  { label: 'Running', color: '#FF9800', icon: 'activity' },
  { label: 'Cycling', color: '#2196F3', icon: 'bike' },
  { label: 'Swimming', color: '#00BCD4', icon: 'droplets' },
  { label: 'Gym', color: '#673AB7', icon: 'dumbbell' },
  { label: 'Yoga', color: '#E91E63', icon: 'heart' },
  { label: 'Other', color: '#607D8B', icon: 'more-horizontal' },
] as const;

// Date options for quick selection
const DATE_OPTIONS = ['Yesterday', 'Today', 'Tomorrow'];

const ActivitiesScreen = () => {
  const { activities, addActivity, deleteActivity, activitySummary } = useData();
  
  // Form state
  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [activityType, setActivityType] = useState<string>('Walking');
  const [duration, setDuration] = useState('');
  const [kilojoules, setKilojoules] = useState('');
  const [steps, setSteps] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayDate, setDisplayDate] = useState('Today');
  const [notes, setNotes] = useState('');
  
  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  
  const resetForm = () => {
    setActivityType('Walking');
    setDuration('');
    setKilojoules('');
    setSteps('');
    setDate(new Date().toISOString().split('T')[0]);
    setDisplayDate('Today');
    setNotes('');
  };
  
  const handleAddActivity = () => {
    if (!duration) {
      Alert.alert('Error', 'Please enter a duration');
      return;
    }
    
    const parsedDuration = parseInt(duration);
    const parsedKilojoules = kilojoules ? parseInt(kilojoules) : 0;
    const parsedSteps = steps ? parseInt(steps) : 0;
    
    if (isNaN(parsedDuration) || parsedDuration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }
    
    const newActivity: Omit<Activity, 'id' | 'userId'> = {
      type: activityType,
      duration: parsedDuration,
      kilojoules: parsedKilojoules,
      steps: parsedSteps,
      date,
      notes
    };
    
    addActivity(newActivity);
    setIsAddingActivity(false);
    resetForm();
  };
  
  const handleSelectType = (selectedType: string) => {
    setActivityType(selectedType);
    setShowTypeModal(false);
  };
  
  const handleSelectDate = (option: string) => {
    setDisplayDate(option);
    
    const today = new Date();
    let selectedDate = new Date();
    
    if (option === 'Yesterday') {
      selectedDate.setDate(today.getDate() - 1);
    } else if (option === 'Tomorrow') {
      selectedDate.setDate(today.getDate() + 1);
    }
    
    setDate(selectedDate.toISOString().split('T')[0]);
    setShowDateModal(false);
  };
  
  const handleCustomDateChange = (customDate: string) => {
    setDate(customDate);
    setDisplayDate(new Date(customDate).toLocaleDateString());
    setShowDateModal(false);
  };
  
  // Filter activities based on the active filter
  const getFilteredActivities = () => {
    if (activeFilter === 'all') return activities;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (activeFilter === 'daily') {
      return activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate.getDate() === today.getDate() && 
               activityDate.getMonth() === today.getMonth() &&
               activityDate.getFullYear() === today.getFullYear();
      });
    } else if (activeFilter === 'weekly') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      return activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startOfWeek && activityDate <= now;
      });
    } else if (activeFilter === 'monthly') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      return activities.filter(activity => {
        const activityDate = new Date(activity.date);
        return activityDate >= startOfMonth && activityDate <= now;
      });
    }
    
    return activities;
  };
  
  const filteredActivities = getFilteredActivities();
  
  // Get activity type color
  const getActivityTypeColor = (type: string) => {
    return ACTIVITY_TYPES.find(t => t.label === type)?.color || '#607D8B';
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-AU', options);
  };
  
  // Calculate total for the filtered activities
  const calculateTotalDuration = (activities: Activity[]) => {
    return activities.reduce((sum, activity) => sum + activity.duration, 0);
  };
  
  const calculateTotalKilojoules = (activities: Activity[]) => {
    return activities.reduce((sum, activity) => sum + activity.kilojoules, 0);
  };
  
  const calculateTotalSteps = (activities: Activity[]) => {
    return activities.reduce((sum, activity) => sum + activity.steps, 0);
  };
  
  // Render activity item
  const renderActivityItem = ({ item }: { item: Activity }) => (
    <Animated.View 
      entering={FadeInUp.delay(100 * parseInt(item.id) % 10).duration(400)}
      style={[styles.activityCard, { borderLeftColor: getActivityTypeColor(item.type) }]}
    >
      <View style={styles.activityHeader}>
        <Text style={styles.activityType}>{item.type}</Text>
        <Text style={styles.activityDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.activityMetrics}>
        <View style={styles.metricItem}>
          <Clock size={16} color="#666666" />
          <Text style={styles.metricValue}>{item.duration} mins</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Zap size={16} color="#666666" />
          <Text style={styles.metricValue}>{item.kilojoules} kJ</Text>
        </View>
        
        <View style={styles.metricItem}>
          <FootprintsIcon size={16} color="#666666" />
          <Text style={styles.metricValue}>{item.steps} steps</Text>
        </View>
      </View>
      
      {item.notes && (
        <Text style={styles.activityNotes}>{item.notes}</Text>
      )}
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteActivity(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'daily' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('daily')}
        >
          <Text style={[styles.filterText, activeFilter === 'daily' && styles.activeFilterText]}>
            Daily
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'weekly' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('weekly')}
        >
          <Text style={[styles.filterText, activeFilter === 'weekly' && styles.activeFilterText]}>
            Weekly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'monthly' && styles.activeFilterTab]}
          onPress={() => setActiveFilter('monthly')}
        >
          <Text style={[styles.filterText, activeFilter === 'monthly' && styles.activeFilterText]}>
            Monthly
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Activities List */}
      <View style={styles.listContainer}>
        {filteredActivities.length > 0 ? (
          <FlatList
            data={filteredActivities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivityItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Activity Summary</Text>
                
                <View style={styles.summaryMetrics}>
                  <View style={styles.summaryItem}>
                    <Clock size={18} color="#008080" />
                    <Text style={styles.summaryValue}>{calculateTotalDuration(filteredActivities)} mins</Text>
                    <Text style={styles.summaryLabel}>Duration</Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <Zap size={18} color="#008080" />
                    <Text style={styles.summaryValue}>{calculateTotalKilojoules(filteredActivities)} kJ</Text>
                    <Text style={styles.summaryLabel}>Energy</Text>
                  </View>
                  
                  <View style={styles.summaryItem}>
                    <FootprintsIcon size={18} color="#008080" />
                    <Text style={styles.summaryValue}>{calculateTotalSteps(filteredActivities)}</Text>
                    <Text style={styles.summaryLabel}>Steps</Text>
                  </View>
                </View>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities recorded yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add an activity</Text>
          </View>
        )}
      </View>
      
      {/* Add Activity Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddingActivity(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Add Activity Modal */}
      <Modal
        visible={isAddingActivity}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingActivity(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingActivity(false);
                  resetForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Activity Type Selector */}
              <Text style={styles.inputLabel}>Activity Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTypeModal(true)}
              >
                <View style={[styles.typeDot, { backgroundColor: getActivityTypeColor(activityType) }]} />
                <Text style={styles.selectorText}>{activityType}</Text>
                <ChevronDown size={18} color="#666666" />
              </TouchableOpacity>
              
              {/* Duration Input */}
              <Text style={styles.inputLabel}>Duration (minutes)</Text>
              <View style={styles.inputContainer}>
                <Clock size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={duration}
                  onChangeText={setDuration}
                />
              </View>
              
              {/* Energy Input */}
              <Text style={styles.inputLabel}>Energy (kilojoules)</Text>
              <View style={styles.inputContainer}>
                <Zap size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={kilojoules}
                  onChangeText={setKilojoules}
                />
              </View>
              
              {/* Steps Input */}
              <Text style={styles.inputLabel}>Steps</Text>
              <View style={styles.inputContainer}>
                <FootprintsIcon size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={steps}
                  onChangeText={setSteps}
                />
              </View>
              
              {/* Date Selector */}
              <Text style={styles.inputLabel}>Date</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowDateModal(true)}
              >
                <Calendar size={18} color="#666666" style={styles.inputIcon} />
                <Text style={styles.selectorText}>{displayDate}</Text>
                <ChevronDown size={18} color="#666666" />
              </TouchableOpacity>
              
              {/* Notes Input */}
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add any additional details..."
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddActivity}
              >
                <Text style={styles.submitButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Activity Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Activity Type</Text>
            
            {ACTIVITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.label}
                style={styles.pickerItem}
                onPress={() => handleSelectType(type.label)}
              >
                <View style={[styles.typeDot, { backgroundColor: type.color }]} />
                <Text style={styles.pickerItemText}>{type.label}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowTypeModal(false)}
            >
              <Text style={styles.pickerCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Date Selection Modal */}
      <Modal
        visible={showDateModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDateModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDateModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Date</Text>
            
            {DATE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerItem}
                onPress={() => handleSelectDate(option)}
              >
                <Text style={styles.pickerItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
            
            <Text style={styles.pickerSeparator}>or select specific date:</Text>
            
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              value={date}
              onChangeText={(text) => setDate(text)}
              onSubmitEditing={() => handleCustomDateChange(date)}
            />
            
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowDateModal(false)}
            >
              <Text style={styles.pickerCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#E6F4F4',
  },
  filterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  activeFilterText: {
    color: '#008080',
    fontFamily: 'Inter-Bold',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  totalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  summaryMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginTop: 4,
    marginBottom: 2,
  },
  summaryLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityType: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
  },
  activityDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
  },
  activityMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
    marginLeft: 4,
  },
  activityNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#DDDDDD',
    paddingLeft: 8,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  deleteButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#E53935',
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    padding: 16,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
    maxHeight: '100%',
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  typeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  selectorText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  submitButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  submitButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  pickerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  pickerSeparator: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  pickerCloseButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerCloseButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666666',
  },
});

export default ActivitiesScreen;