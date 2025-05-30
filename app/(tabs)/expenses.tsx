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
  Pressable,
  Alert
} from 'react-native';
import { useData, Expense } from '@/context/DataContext';
import { Camera, DollarSign, Calendar, Receipt, Plus, ChevronDown, X } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

// Expense categories with their associated colors
const EXPENSE_CATEGORIES = [
  { label: 'Grocery', color: '#4CAF50' },
  { label: 'Café', color: '#795548' },
  { label: 'Restaurant', color: '#FF9800' },
  { label: 'Shopping', color: '#E91E63' },
  { label: 'Entertainment', color: '#673AB7' },
  { label: 'Other', color: '#607D8B' },
] as const;

// Date options for quick selection
const DATE_OPTIONS = ['Yesterday', 'Today', 'Tomorrow'];

const ExpensesScreen = () => {
  const { expenses, addExpense, deleteExpense, expenseSummary } = useData();
  
  // Form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [category, setCategory] = useState<Expense['category']>('Grocery');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayDate, setDisplayDate] = useState('Today');
  const [hasReceipt, setHasReceipt] = useState(false);
  
  // Entertainment specific fields
  const [entertainmentType, setEntertainmentType] = useState('');
  const [entertainmentCost, setEntertainmentCost] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [foodCost, setFoodCost] = useState('');
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showEntertainmentModal, setShowEntertainmentModal] = useState(false);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  
  const resetForm = () => {
    setCategory('Grocery');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDisplayDate('Today');
    setHasReceipt(false);
    setEntertainmentType('');
    setEntertainmentCost('');
    setTravelCost('');
    setFoodCost('');
  };
  
  const handleAddExpense = () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const newExpense: Omit<Expense, 'id' | 'userId'> = {
      category,
      amount: parsedAmount,
      date,
      hasReceipt,
    };
    
    // Add entertainment specific fields if applicable
    if (category === 'Entertainment') {
      if (!entertainmentType) {
        Alert.alert('Error', 'Please enter entertainment type');
        return;
      }
      
      newExpense.entertainmentType = entertainmentType;
      newExpense.entertainmentCost = entertainmentCost ? parseFloat(entertainmentCost) : undefined;
      newExpense.travelCost = travelCost ? parseFloat(travelCost) : undefined;
      newExpense.foodCost = foodCost ? parseFloat(foodCost) : undefined;
    }
    
    addExpense(newExpense);
    setIsAddingExpense(false);
    resetForm();
  };
  
  const handleSelectCategory = (selectedCategory: Expense['category']) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
    
    // Show entertainment details modal if Entertainment is selected
    if (selectedCategory === 'Entertainment') {
      setShowEntertainmentModal(true);
    }
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
  
  const handleEntertainmentSubmit = () => {
    setShowEntertainmentModal(false);
  };
  
  const handleScanReceipt = () => {
    // In a real app, this would open the camera or image picker
    // For demo purposes, we'll just toggle the receipt state
    setHasReceipt(!hasReceipt);
    Alert.alert('Success', 'Receipt scanned successfully');
  };
  
  // Filter expenses based on the active filter
  const getFilteredExpenses = () => {
    if (activeFilter === 'all') return expenses;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (activeFilter === 'daily') {
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getDate() === today.getDate() && 
               expenseDate.getMonth() === today.getMonth() &&
               expenseDate.getFullYear() === today.getFullYear();
      });
    } else if (activeFilter === 'weekly') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfWeek && expenseDate <= now;
      });
    } else if (activeFilter === 'monthly') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startOfMonth && expenseDate <= now;
      });
    }
    
    return expenses;
  };
  
  const filteredExpenses = getFilteredExpenses();
  
  // Get category color
  const getCategoryColor = (category: Expense['category']) => {
    return EXPENSE_CATEGORIES.find(c => c.label === category)?.color || '#607D8B';
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
  
  // Calculate total for the filtered expenses
  const calculateTotal = (expenses: Expense[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };
  
  // Render expense item
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <Animated.View 
      entering={FadeInUp.delay(100 * parseInt(item.id) % 10).duration(400)}
      style={[styles.expenseCard, { borderLeftColor: getCategoryColor(item.category) }]}
    >
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseCategory}>{item.category}</Text>
        <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
      </View>
      
      <View style={styles.expenseBody}>
        <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
        
        {item.hasReceipt && (
          <View style={styles.receiptIndicator}>
            <Receipt size={16} color="#008080" />
          </View>
        )}
      </View>
      
      {item.category === 'Entertainment' && item.entertainmentType && (
        <View style={styles.entertainmentDetails}>
          <Text style={styles.entertainmentType}>{item.entertainmentType}</Text>
          
          <View style={styles.entertainmentCosts}>
            {item.entertainmentCost && (
              <Text style={styles.entertainmentCostItem}>
                Event: ${item.entertainmentCost.toFixed(2)}
              </Text>
            )}
            
            {item.travelCost && (
              <Text style={styles.entertainmentCostItem}>
                Travel: ${item.travelCost.toFixed(2)}
              </Text>
            )}
            
            {item.foodCost && (
              <Text style={styles.entertainmentCostItem}>
                Food: ${item.foodCost.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      )}
      
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteExpense(item.id)}
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
      
      {/* Expenses List */}
      <View style={styles.listContainer}>
        {filteredExpenses.length > 0 ? (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            renderItem={renderExpenseItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Expenses</Text>
                <Text style={styles.totalAmount}>
                  ${calculateTotal(filteredExpenses).toFixed(2)}
                </Text>
              </View>
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses recorded yet</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add an expense</Text>
          </View>
        )}
      </View>
      
      {/* Add Expense Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddingExpense(true)}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
      
      {/* Add Expense Modal */}
      <Modal
        visible={isAddingExpense}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingExpense(false);
          resetForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Expense</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingExpense(false);
                  resetForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {/* Category Selector */}
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.selectorText}>{category}</Text>
                <ChevronDown size={18} color="#666666" />
              </TouchableOpacity>
              
              {/* Amount Input */}
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <DollarSign size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
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
              
              {/* Receipt Scan Button */}
              <TouchableOpacity
                style={[styles.scanButton, hasReceipt && styles.scannedButton]}
                onPress={handleScanReceipt}
              >
                <Camera size={18} color={hasReceipt ? "#FFFFFF" : "#008080"} />
                <Text style={[styles.scanButtonText, hasReceipt && styles.scannedButtonText]}>
                  {hasReceipt ? 'Receipt Scanned' : 'Scan Receipt'}
                </Text>
              </TouchableOpacity>
              
              {/* Entertainment Details (if applicable) */}
              {category === 'Entertainment' && (
                <View style={styles.entertainmentForm}>
                  <Text style={styles.sectionTitle}>Entertainment Details</Text>
                  
                  <Text style={styles.inputLabel}>Type</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Movie, Concert, etc."
                    value={entertainmentType}
                    onChangeText={setEntertainmentType}
                  />
                  
                  <Text style={styles.inputLabel}>Entertainment Cost</Text>
                  <View style={styles.amountInputContainer}>
                    <DollarSign size={18} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={entertainmentCost}
                      onChangeText={setEntertainmentCost}
                    />
                  </View>
                  
                  <Text style={styles.inputLabel}>Travel Cost</Text>
                  <View style={styles.amountInputContainer}>
                    <DollarSign size={18} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={travelCost}
                      onChangeText={setTravelCost}
                    />
                  </View>
                  
                  <Text style={styles.inputLabel}>Food Cost</Text>
                  <View style={styles.amountInputContainer}>
                    <DollarSign size={18} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      keyboardType="numeric"
                      value={foodCost}
                      onChangeText={setFoodCost}
                    />
                  </View>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddExpense}
              >
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.label}
                style={styles.pickerItem}
                onPress={() => handleSelectCategory(cat.label as Expense['category'])}
              >
                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                <Text style={styles.pickerItemText}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.pickerCloseButton}
              onPress={() => setShowCategoryModal(false)}
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
      
      {/* Entertainment Details Modal */}
      <Modal
        visible={showEntertainmentModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEntertainmentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEntertainmentModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Entertainment Details</Text>
            
            <Text style={styles.inputLabel}>Type</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Movie, Concert, etc."
              value={entertainmentType}
              onChangeText={setEntertainmentType}
            />
            
            <Text style={styles.inputLabel}>Entertainment Cost</Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={18} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={entertainmentCost}
                onChangeText={setEntertainmentCost}
              />
            </View>
            
            <Text style={styles.inputLabel}>Travel Cost</Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={18} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={travelCost}
                onChangeText={setTravelCost}
              />
            </View>
            
            <Text style={styles.inputLabel}>Food Cost</Text>
            <View style={styles.amountInputContainer}>
              <DollarSign size={18} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                keyboardType="numeric"
                value={foodCost}
                onChangeText={setFoodCost}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowEntertainmentModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleEntertainmentSubmit}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 4,
  },
  totalAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#008080',
  },
  expenseCard: {
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
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseCategory: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
  },
  expenseDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
  },
  expenseBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
  },
  receiptIndicator: {
    backgroundColor: '#E6F4F4',
    padding: 4,
    borderRadius: 4,
  },
  entertainmentDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  entertainmentType: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  entertainmentCosts: {
    marginTop: 4,
  },
  entertainmentCostItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
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
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginTop: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
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
  categoryDot: {
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
  amountInputContainer: {
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
  amountInput: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
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
    borderColor: '#008080',
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
  textInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  entertainmentForm: {
    marginTop: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666666',
  },
  confirmButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default ExpensesScreen;