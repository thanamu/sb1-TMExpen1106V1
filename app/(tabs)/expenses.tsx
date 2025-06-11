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
  Alert,
  Image
} from 'react-native';
import { useData, Expense } from '@/context/DataContext';
import { DollarSign, Plus, ChevronDown, X, Calendar, Camera, ShoppingCart, Coffee, ShoppingBag, Film, Car, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';

// Expense categories with their associated colors and icons
const EXPENSE_CATEGORIES = [
  { label: 'Grocery', color: '#4CAF50', icon: 'shopping-cart' },
  { label: 'Café', color: '#795548', icon: 'coffee' },
  { label: 'Restaurant', color: '#FF9800', icon: 'coffee' },
  { label: 'Shopping', color: '#E91E63', icon: 'shopping-bag' },
  { label: 'Entertainment', color: '#673AB7', icon: 'film' },
  { label: 'Vehicles', color: '#2196F3', icon: 'car' },
  { label: 'Other', color: '#607D8B', icon: 'more-horizontal' },
] as const;

// Date options for quick selection
const DATE_OPTIONS = ['Yesterday', 'Today', 'Tomorrow'];

const ExpensesScreen = () => {
  const { expenses, addExpense, deleteExpense } = useData();
  
  // Form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [category, setCategory] = useState<string>('Grocery');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [displayDate, setDisplayDate] = useState('Today');
  const [hasReceipt, setHasReceipt] = useState(false);
  
  // Category-specific fields
  const [cafeName, setCafeName] = useState('');
  const [foodDescription, setFoodDescription] = useState('');
  const [numberOfPatrons, setNumberOfPatrons] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantFoodDescription, setRestaurantFoodDescription] = useState('');
  const [restaurantPatrons, setRestaurantPatrons] = useState('');
  const [shopName, setShopName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [entertainmentType, setEntertainmentType] = useState('');
  const [entertainmentCost, setEntertainmentCost] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [foodCost, setFoodCost] = useState('');
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  
  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  
  const resetForm = () => {
    setCategory('Grocery');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setDisplayDate('Today');
    setHasReceipt(false);
    setCafeName('');
    setFoodDescription('');
    setNumberOfPatrons('');
    setRestaurantName('');
    setRestaurantFoodDescription('');
    setRestaurantPatrons('');
    setShopName('');
    setItemDescription('');
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
      category: category as Expense['category'],
      amount: parsedAmount,
      date,
      hasReceipt
    };
    
    // Add category-specific fields
    if (category === 'Café') {
      newExpense.cafeName = cafeName;
      newExpense.foodDescription = foodDescription;
      newExpense.numberOfPatrons = numberOfPatrons ? parseInt(numberOfPatrons) : undefined;
    } else if (category === 'Restaurant') {
      newExpense.restaurantName = restaurantName;
      newExpense.restaurantFoodDescription = restaurantFoodDescription;
      newExpense.restaurantPatrons = restaurantPatrons ? parseInt(restaurantPatrons) : undefined;
    } else if (category === 'Shopping') {
      newExpense.shopName = shopName;
      newExpense.itemDescription = itemDescription;
    } else if (category === 'Entertainment') {
      newExpense.entertainmentType = entertainmentType;
      newExpense.entertainmentCost = entertainmentCost ? parseFloat(entertainmentCost) : undefined;
      newExpense.travelCost = travelCost ? parseFloat(travelCost) : undefined;
      newExpense.foodCost = foodCost ? parseFloat(foodCost) : undefined;
    }
    
    addExpense(newExpense);
    setIsAddingExpense(false);
    resetForm();
  };
  
  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
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
  
  const handleScanReceipt = () => {
    setHasReceipt(!hasReceipt);
    Alert.alert('Success', hasReceipt ? 'Receipt removed' : 'Receipt scanned successfully');
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
  
  // Get expense category color and icon
  const getCategoryInfo = (categoryName: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.label === categoryName) || EXPENSE_CATEGORIES[6];
  };
  
  const getCategoryIcon = (categoryName: string) => {
    const iconName = getCategoryInfo(categoryName).icon;
    const iconProps = { size: 20, color: getCategoryInfo(categoryName).color };
    
    switch (iconName) {
      case 'shopping-cart':
        return <ShoppingCart {...iconProps} />;
      case 'coffee':
        return <Coffee {...iconProps} />;
      case 'shopping-bag':
        return <ShoppingBag {...iconProps} />;
      case 'film':
        return <Film {...iconProps} />;
      case 'car':
        return <Car {...iconProps} />;
      default:
        return <MoreHorizontal {...iconProps} />;
    }
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
      style={[styles.expenseCard, { borderLeftColor: getCategoryInfo(item.category).color }]}
    >
      <View style={styles.expenseHeader}>
        <View style={styles.expenseInfo}>
          <View style={styles.categoryRow}>
            {getCategoryIcon(item.category)}
            <Text style={styles.expenseCategory}>{item.category}</Text>
          </View>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.expenseAmount}>${item.amount.toFixed(2)}</Text>
          {item.hasReceipt && (
            <View style={styles.receiptBadge}>
              <Camera size={12} color="#4CAF50" />
            </View>
          )}
        </View>
      </View>
      
      {/* Category-specific details */}
      {item.category === 'Café' && (item.cafeName || item.foodDescription) && (
        <View style={styles.detailsContainer}>
          {item.cafeName && <Text style={styles.detailText}>Café: {item.cafeName}</Text>}
          {item.foodDescription && <Text style={styles.detailText}>Food: {item.foodDescription}</Text>}
          {item.numberOfPatrons && <Text style={styles.detailText}>Patrons: {item.numberOfPatrons}</Text>}
        </View>
      )}
      
      {item.category === 'Restaurant' && (item.restaurantName || item.restaurantFoodDescription) && (
        <View style={styles.detailsContainer}>
          {item.restaurantName && <Text style={styles.detailText}>Restaurant: {item.restaurantName}</Text>}
          {item.restaurantFoodDescription && <Text style={styles.detailText}>Food: {item.restaurantFoodDescription}</Text>}
          {item.restaurantPatrons && <Text style={styles.detailText}>Patrons: {item.restaurantPatrons}</Text>}
        </View>
      )}
      
      {item.category === 'Shopping' && (item.shopName || item.itemDescription) && (
        <View style={styles.detailsContainer}>
          {item.shopName && <Text style={styles.detailText}>Shop: {item.shopName}</Text>}
          {item.itemDescription && <Text style={styles.detailText}>Item: {item.itemDescription}</Text>}
        </View>
      )}
      
      {item.category === 'Entertainment' && item.entertainmentType && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>Type: {item.entertainmentType}</Text>
          {item.entertainmentCost && <Text style={styles.detailText}>Entertainment: ${item.entertainmentCost.toFixed(2)}</Text>}
          {item.travelCost && <Text style={styles.detailText}>Travel: ${item.travelCost.toFixed(2)}</Text>}
          {item.foodCost && <Text style={styles.detailText}>Food: ${item.foodCost.toFixed(2)}</Text>}
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
      {/* Header with hero image */}
      <View style={styles.heroContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg' }}
          style={styles.heroImage}
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Expense Tracker</Text>
          <Text style={styles.heroSubtitle}>Keep track of your spending</Text>
        </View>
      </View>
      
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
            <DollarSign size={48} color="#CCCCCC" />
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
                <View style={[styles.categoryDot, { backgroundColor: getCategoryInfo(category).color }]} />
                <Text style={styles.selectorText}>{category}</Text>
                <ChevronDown size={18} color="#666666" />
              </TouchableOpacity>
              
              {/* Amount Input */}
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={18} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
              
              {/* Category-specific fields */}
              {category === 'Café' && (
                <>
                  <Text style={styles.inputLabel}>Café Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter café name"
                    value={cafeName}
                    onChangeText={setCafeName}
                  />
                  
                  <Text style={styles.inputLabel}>Food Description</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="What did you order?"
                    value={foodDescription}
                    onChangeText={setFoodDescription}
                  />
                  
                  <Text style={styles.inputLabel}>Number of Patrons</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="How many people?"
                    keyboardType="numeric"
                    value={numberOfPatrons}
                    onChangeText={setNumberOfPatrons}
                  />
                </>
              )}
              
              {category === 'Restaurant' && (
                <>
                  <Text style={styles.inputLabel}>Restaurant Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter restaurant name"
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                  />
                  
                  <Text style={styles.inputLabel}>Food Description</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="What did you order?"
                    value={restaurantFoodDescription}
                    onChangeText={setRestaurantFoodDescription}
                  />
                  
                  <Text style={styles.inputLabel}>Number of Patrons</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="How many people?"
                    keyboardType="numeric"
                    value={restaurantPatrons}
                    onChangeText={setRestaurantPatrons}
                  />
                </>
              )}
              
              {category === 'Shopping' && (
                <>
                  <Text style={styles.inputLabel}>Shop Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter shop name"
                    value={shopName}
                    onChangeText={setShopName}
                  />
                  
                  <Text style={styles.inputLabel}>Item Description</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="What did you buy?"
                    value={itemDescription}
                    onChangeText={setItemDescription}
                  />
                </>
              )}
              
              {category === 'Entertainment' && (
                <>
                  <Text style={styles.inputLabel}>Entertainment Type</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Movie, Concert, Sports"
                    value={entertainmentType}
                    onChangeText={setEntertainmentType}
                  />
                  
                  <Text style={styles.inputLabel}>Entertainment Cost</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={entertainmentCost}
                    onChangeText={setEntertainmentCost}
                  />
                  
                  <Text style={styles.inputLabel}>Travel Cost</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={travelCost}
                    onChangeText={setTravelCost}
                  />
                  
                  <Text style={styles.inputLabel}>Food Cost</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={foodCost}
                    onChangeText={setFoodCost}
                  />
                </>
              )}
              
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
              
              {/* Receipt Scanner */}
              <TouchableOpacity
                style={[styles.receiptButton, hasReceipt && styles.receiptButtonActive]}
                onPress={handleScanReceipt}
              >
                <Camera size={20} color={hasReceipt ? "#FFFFFF" : "#008080"} />
                <Text style={[styles.receiptButtonText, hasReceipt && styles.receiptButtonTextActive]}>
                  {hasReceipt ? 'Receipt Scanned' : 'Scan Receipt'}
                </Text>
              </TouchableOpacity>
              
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
                onPress={() => handleSelectCategory(cat.label)}
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
    alignItems: 'center',
  },
  totalLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseCategory: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
  },
  expenseDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
  },
  receiptBadge: {
    marginTop: 4,
    padding: 2,
    backgroundColor: '#E8F5E8',
    borderRadius: 4,
  },
  detailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  deleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    marginTop: 8,
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
    marginTop: 16,
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
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#008080',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  receiptButtonActive: {
    backgroundColor: '#008080',
  },
  receiptButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#008080',
    marginLeft: 8,
  },
  receiptButtonTextActive: {
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

export default ExpensesScreen;