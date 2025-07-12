import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  Image
} from 'react-native';
import { useHoliday, Holiday, ModeOfTravel, DailyExpenseType, DailyExpense } from '@/context/HolidayContext';
import {
  Plane,
  Plus,
  ChevronDown,
  X,
  Calendar as CalendarIcon,
  DollarSign,
  ChevronRight,
  Camera,
  MapPin,
  Clock,
  Receipt
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const TRAVEL_MODES: ModeOfTravel[] = ['Car', 'Plane', 'Train', 'Bus', 'Cruise', 'Other'];
const EXPENSE_TYPES: DailyExpenseType[] = ['Meals', 'Transport', 'Attraction', 'Other'];

const HolidaysScreen = () => {
  const { 
    holidays, 
    addHoliday, 
    deleteHoliday, 
    getDailyExpenses,
    getDailyExpensesByDay,
    addDailyExpense,
    deleteDailyExpense,
    getHolidayTotalCost,
    getHolidayDailyCosts
  } = useHoliday();
  
  // Holiday form state
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);
  const [description, setDescription] = useState('');
  const [modeOfTravel, setModeOfTravel] = useState<ModeOfTravel>('Plane');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
  const [numberOfDays, setNumberOfDays] = useState('');
  const [travelTransportCost, setTravelTransportCost] = useState('');
  const [accommodationCost, setAccommodationCost] = useState('');
  const [travelInsuranceCost, setTravelInsuranceCost] = useState('');
  
  // Daily expense form state
  const [isAddingDailyExpense, setIsAddingDailyExpense] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [expenseType, setExpenseType] = useState<DailyExpenseType>('Meals');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  
  // Holiday details view
  const [viewingHoliday, setViewingHoliday] = useState<Holiday | null>(null);
  const [selectedDayView, setSelectedDayView] = useState(1);
  
  // Modal states
  const [showTravelModeModal, setShowTravelModeModal] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  
  const resetHolidayForm = () => {
    setDescription('');
    setModeOfTravel('Plane');
    setDepartureDate(new Date().toISOString().split('T')[0]);
    setNumberOfDays('');
    setTravelTransportCost('');
    setAccommodationCost('');
    setTravelInsuranceCost('');
  };
  
  const resetExpenseForm = () => {
    setSelectedDay(1);
    setExpenseType('Meals');
    setExpenseAmount('');
    setExpenseDescription('');
    setHasReceipt(false);
  };
  
  const handleAddHoliday = () => {
    if (!description.trim() || !numberOfDays) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedDays = parseInt(numberOfDays);
    const parsedTransportCost = parseFloat(travelTransportCost) || 0;
    const parsedAccommodationCost = parseFloat(accommodationCost) || 0;
    const parsedInsuranceCost = parseFloat(travelInsuranceCost) || 0;
    
    if (isNaN(parsedDays) || parsedDays <= 0) {
      Alert.alert('Error', 'Please enter a valid number of days');
      return;
    }
    
    const newHoliday = {
      description: description.trim(),
      modeOfTravel,
      departureDate,
      numberOfDays: parsedDays,
      travelTransportCost: parsedTransportCost,
      accommodationCost: parsedAccommodationCost,
      travelInsuranceCost: parsedInsuranceCost,
    };
    
    addHoliday(newHoliday);
    setIsAddingHoliday(false);
    resetHolidayForm();
  };
  
  const handleAddDailyExpense = () => {
    if (!selectedHoliday || !expenseAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const newExpense = {
      holidayId: selectedHoliday.id,
      dayNumber: selectedDay,
      type: expenseType,
      amount: parsedAmount,
      description: expenseDescription.trim() || undefined,
      hasReceipt,
    };
    
    addDailyExpense(newExpense);
    setIsAddingDailyExpense(false);
    setSelectedHoliday(null);
    resetExpenseForm();
  };
  
  const handleScanReceipt = () => {
    setHasReceipt(!hasReceipt);
    Alert.alert('Success', hasReceipt ? 'Receipt removed' : 'Receipt scanned successfully');
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTravelModeIcon = (mode: ModeOfTravel) => {
    return <Plane size={20} color="#008080" />;
  };
  
  const getExpenseTypeColor = (type: DailyExpenseType) => {
    const colors = {
      'Meals': '#4CAF50',
      'Transport': '#2196F3',
      'Attraction': '#673AB7',
      'Other': '#607D8B'
    };
    return colors[type];
  };
  
  const renderHolidayItem = ({ item }: { item: Holiday }) => {
    const dailyExpenses = getDailyExpenses(item.id);
    const totalCost = getHolidayTotalCost(item.id);
    const dailyCosts = getHolidayDailyCosts(item.id);
    
    return (
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.holidayCard}
      >
        <TouchableOpacity
          style={styles.holidayContent}
          onPress={() => {
            setViewingHoliday(item);
            setSelectedDayView(1);
          }}
        >
          <View style={styles.holidayHeader}>
            <View style={styles.holidayInfo}>
              <View style={styles.holidayTitleRow}>
                {getTravelModeIcon(item.modeOfTravel)}
                <Text style={styles.holidayTitle}>{item.description}</Text>
              </View>
              <Text style={styles.holidaySubtitle}>
                {item.modeOfTravel} • {item.numberOfDays} days
              </Text>
              <Text style={styles.holidayDate}>
                Departure: {formatDate(item.departureDate)}
              </Text>
              <Text style={styles.holidayTotalCost}>
                Total Cost: {formatCurrency(totalCost)}
              </Text>
            </View>
            
            <View style={styles.holidayActions}>
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => {
                  setSelectedHoliday(item);
                  setIsAddingDailyExpense(true);
                }}
              >
                <Plus size={20} color="#008080" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.viewButton}>
                <ChevronRight size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.holidayCosts}>
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Transport:</Text>
              <Text style={styles.costValue}>{formatCurrency(item.travelTransportCost)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Accommodation:</Text>
              <Text style={styles.costValue}>{formatCurrency(item.accommodationCost)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Insurance:</Text>
              <Text style={styles.costValue}>{formatCurrency(item.travelInsuranceCost)}</Text>
            </View>
            
            <View style={styles.costItem}>
              <Text style={styles.costLabel}>Daily Expenses:</Text>
              <Text style={styles.costValue}>{formatCurrency(dailyCosts)}</Text>
            </View>
          </View>
          
          <View style={styles.holidayStats}>
            <Text style={styles.statsText}>
              {dailyExpenses.length} daily expense{dailyExpenses.length !== 1 ? 's' : ''} recorded
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteHoliday(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete Holiday</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderDailyExpenseItem = ({ item }: { item: DailyExpense }) => (
    <View style={[styles.expenseItem, { borderLeftColor: getExpenseTypeColor(item.type) }]}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseType}>{item.type}</Text>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      {item.description && (
        <Text style={styles.expenseDescription}>{item.description}</Text>
      )}
      {item.hasReceipt && (
        <View style={styles.receiptIndicator}>
          <Receipt size={12} color="#4CAF50" />
          <Text style={styles.receiptText}>Receipt attached</Text>
        </View>
      )}
      <TouchableOpacity
        style={styles.deleteExpenseButton}
        onPress={() => deleteDailyExpense(item.id)}
      >
        <Text style={styles.deleteExpenseButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
  
  const generateDayOptions = (numberOfDays: number) => {
    return Array.from({ length: numberOfDays }, (_, i) => i + 1);
  };
  
  return (
    <View style={styles.container}>
      {/* Header with hero image */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Holiday Expenses</Text>
          <Text style={styles.heroSubtitle}>Track your travel costs and memories</Text>
        </View>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Holidays</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingHoliday(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {holidays.length > 0 ? (
        <FlatList
          data={holidays}
          renderItem={renderHolidayItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Plane size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>No holidays added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the + button to add your first holiday
          </Text>
        </View>
      )}
      
      {/* Holiday Details Modal */}
      <Modal
        visible={viewingHoliday !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewingHoliday(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {viewingHoliday?.description}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewingHoliday(null)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {viewingHoliday && (
              <ScrollView style={styles.holidayDetailsContainer}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Holiday Overview</Text>
                  <Text style={styles.overviewText}>
                    {viewingHoliday.numberOfDays} day trip by {viewingHoliday.modeOfTravel}
                  </Text>
                  <Text style={styles.overviewText}>
                    Departure: {formatDate(viewingHoliday.departureDate)}
                  </Text>
                  <Text style={styles.overviewText}>
                    Total Cost: {formatCurrency(getHolidayTotalCost(viewingHoliday.id))}
                  </Text>
                </View>
                
                <View style={styles.daySelector}>
                  <Text style={styles.sectionTitle}>Daily Expenses</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {generateDayOptions(viewingHoliday.numberOfDays).map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          selectedDayView === day && styles.selectedDayButton
                        ]}
                        onPress={() => setSelectedDayView(day)}
                      >
                        <Text style={[
                          styles.dayButtonText,
                          selectedDayView === day && styles.selectedDayButtonText
                        ]}>
                          Day {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.dailyExpensesSection}>
                  {getDailyExpensesByDay(viewingHoliday.id, selectedDayView).length > 0 ? (
                    <FlatList
                      data={getDailyExpensesByDay(viewingHoliday.id, selectedDayView)}
                      renderItem={renderDailyExpenseItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  ) : (
                    <Text style={styles.noExpensesText}>
                      No expenses recorded for Day {selectedDayView}
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.addExpenseFromDetailsButton}
                  onPress={() => {
                    setSelectedHoliday(viewingHoliday);
                    setSelectedDay(selectedDayView);
                    setViewingHoliday(null);
                    setIsAddingDailyExpense(true);
                  }}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.addExpenseFromDetailsText}>Add Expense for Day {selectedDayView}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Add Holiday Modal */}
      <Modal
        visible={isAddingHoliday}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingHoliday(false);
          resetHolidayForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Holiday</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingHoliday(false);
                  resetHolidayForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Holiday Description</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Summer vacation to Bali"
                value={description}
                onChangeText={setDescription}
              />
              
              <Text style={styles.inputLabel}>Mode of Travel</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTravelModeModal(true)}
              >
                <Plane size={20} color="#666666" />
                <Text style={styles.selectorText}>{modeOfTravel}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Departure Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={departureDate}
                  onChangeText={setDepartureDate}
                />
              </View>
              
              <Text style={styles.inputLabel}>Number of Days</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={numberOfDays}
                  onChangeText={setNumberOfDays}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Travel Transport Cost</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={travelTransportCost}
                  onChangeText={setTravelTransportCost}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Accommodation Cost</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={accommodationCost}
                  onChangeText={setAccommodationCost}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Travel Insurance Cost</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={travelInsuranceCost}
                  onChangeText={setTravelInsuranceCost}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddHoliday}
              >
                <Text style={styles.submitButtonText}>Add Holiday</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add Daily Expense Modal */}
      <Modal
        visible={isAddingDailyExpense}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingDailyExpense(false);
          setSelectedHoliday(null);
          resetExpenseForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Daily Expense</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingDailyExpense(false);
                  setSelectedHoliday(null);
                  resetExpenseForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {selectedHoliday && (
                <View style={styles.selectedHolidayInfo}>
                  <Text style={styles.selectedHolidayText}>
                    {selectedHoliday.description}
                  </Text>
                </View>
              )}
              
              <Text style={styles.inputLabel}>Day</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowDayModal(true)}
              >
                <CalendarIcon size={20} color="#666666" />
                <Text style={styles.selectorText}>Day {selectedDay}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Expense Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowExpenseTypeModal(true)}
              >
                <View style={[styles.expenseTypeDot, { backgroundColor: getExpenseTypeColor(expenseType) }]} />
                <Text style={styles.selectorText}>{expenseType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={expenseAmount}
                  onChangeText={setExpenseAmount}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter expense details..."
                value={expenseDescription}
                onChangeText={setExpenseDescription}
                multiline
                numberOfLines={3}
              />
              
              <TouchableOpacity
                style={[styles.scanButton, hasReceipt && styles.scannedButton]}
                onPress={handleScanReceipt}
              >
                <Camera size={20} color={hasReceipt ? "#FFFFFF" : "#008080"} />
                <Text style={[styles.scanButtonText, hasReceipt && styles.scannedButtonText]}>
                  {hasReceipt ? 'Receipt Scanned' : 'Scan Receipt'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddDailyExpense}
              >
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Travel Mode Selection Modal */}
      <Modal
        visible={showTravelModeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTravelModeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTravelModeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Travel Mode</Text>
            {TRAVEL_MODES.map((mode) => (
              <TouchableOpacity
                key={mode}
                style={styles.pickerItem}
                onPress={() => {
                  setModeOfTravel(mode);
                  setShowTravelModeModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Expense Type Selection Modal */}
      <Modal
        visible={showExpenseTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowExpenseTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowExpenseTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Expense Type</Text>
            {EXPENSE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setExpenseType(type);
                  setShowExpenseTypeModal(false);
                }}
              >
                <View style={[styles.expenseTypeDot, { backgroundColor: getExpenseTypeColor(type) }]} />
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Day Selection Modal */}
      <Modal
        visible={showDayModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDayModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Day</Text>
            {selectedHoliday && generateDayOptions(selectedHoliday.numberOfDays).map((day) => (
              <TouchableOpacity
                key={day}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedDay(day);
                  setShowDayModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>Day {day}</Text>
              </TouchableOpacity>
            ))}
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
  heroContainer: {
    height: 120,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 128, 128, 0.8)',
  },
  heroContent: {
    padding: 20,
    height: '100%',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#333333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#008080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  holidayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  holidayContent: {
    marginBottom: 12,
  },
  holidayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  holidayInfo: {
    flex: 1,
  },
  holidayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  holidayTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  holidaySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  holidayDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  holidayTotalCost: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#008080',
  },
  holidayActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addExpenseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E6F4F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  holidayCosts: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
    marginBottom: 16,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  costValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  holidayStats: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  statsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 16,
  },
  holidayDetailsContainer: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
  },
  overviewText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  daySelector: {
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  selectedDayButton: {
    backgroundColor: '#008080',
  },
  dayButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  selectedDayButtonText: {
    color: '#FFFFFF',
  },
  dailyExpensesSection: {
    marginBottom: 16,
  },
  expenseItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseType: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#008080',
  },
  expenseDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  receiptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  deleteExpenseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
  },
  deleteExpenseButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: '#E53935',
  },
  noExpensesText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    padding: 24,
  },
  addExpenseFromDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  addExpenseFromDetailsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  selectedHolidayInfo: {
    backgroundColor: '#E6F4F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedHolidayText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#008080',
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
  },
  selectorText: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  expenseTypeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  scannedButton: {
    backgroundColor: '#008080',
  },
  scanButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#008080',
    marginLeft: 8,
  },
  scannedButtonText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
});

export default HolidaysScreen;