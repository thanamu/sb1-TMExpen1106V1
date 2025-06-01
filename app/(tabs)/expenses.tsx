import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { useData } from '@/context/DataContext';
import { Car, Plus, X, Calendar, DollarSign, Receipt, ChevronDown, AlertCircle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function ExpensesScreen() {
  const { expenses, addExpense, vehicles, addVehicleExpense } = useData();
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showExpenseTypeModal, setShowExpenseTypeModal] = useState(false);
  const [expenseType, setExpenseType] = useState('');
  
  // Additional fields for vehicle expenses
  const [fuelType, setFuelType] = useState('');
  const [insuranceType, setInsuranceType] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [consumableType, setConsumableType] = useState('');
  const [showConsumableTypeModal, setShowConsumableTypeModal] = useState(false);
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);

  const categories = [
    'Grocery',
    'Café',
    'Restaurant',
    'Shopping',
    'Entertainment',
    'Vehicles',
    'Other'
  ];

  const vehicleExpenseTypes = [
    'Fuel',
    'Insurance',
    'Registration',
    'Service',
    'Consumable'
  ];

  const fuelTypes = ['ICE Fuel', 'EV'];
  
  const consumableTypes = [
    'Tyres',
    'Wiper Blades',
    'Engine Oil',
    'Other'
  ];

  const resetForm = () => {
    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setHasReceipt(false);
    setSelectedVehicle(null);
    setExpenseType('');
    setFuelType('');
    setInsuranceType('');
    setInspectionDate('');
    setRegistrationDate('');
    setServiceNotes('');
    setConsumableType('');
  };

  const validateDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleAddExpense = () => {
    if (category === 'Vehicles') {
      if (!selectedVehicle || !expenseType || !amount) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      // Validate dates based on expense type
      if (expenseType === 'Registration') {
        if (!validateDate(registrationDate)) {
          Alert.alert('Error', 'Please enter a valid registration date (YYYY-MM-DD)');
          return;
        }
        if (inspectionDate && !validateDate(inspectionDate)) {
          Alert.alert('Error', 'Please enter a valid inspection date (YYYY-MM-DD)');
          return;
        }
      }

      const vehicleExpense = {
        vehicleId: selectedVehicle.id,
        type: expenseType,
        date,
        amount: parsedAmount,
        hasReceipt,
      };

      // Add type-specific fields
      switch (expenseType) {
        case 'Fuel':
          if (!fuelType) {
            Alert.alert('Error', 'Please select a fuel type');
            return;
          }
          vehicleExpense.fuelType = fuelType;
          break;
        case 'Insurance':
          if (!insuranceType.trim()) {
            Alert.alert('Error', 'Please enter an insurance type');
            return;
          }
          vehicleExpense.insuranceType = insuranceType;
          break;
        case 'Registration':
          vehicleExpense.registrationDate = registrationDate;
          if (inspectionDate) {
            vehicleExpense.inspectionDate = inspectionDate;
          }
          break;
        case 'Service':
          if (!serviceNotes.trim()) {
            Alert.alert('Error', 'Please enter service notes');
            return;
          }
          vehicleExpense.serviceNotes = serviceNotes;
          break;
        case 'Consumable':
          if (!consumableType) {
            Alert.alert('Error', 'Please select a consumable type');
            return;
          }
          vehicleExpense.consumableType = consumableType;
          break;
      }

      addVehicleExpense(vehicleExpense);
    } else {
      if (!category || !amount) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Please enter a valid amount');
        return;
      }

      if (!validateDate(date)) {
        Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
        return;
      }

      const newExpense = {
        category,
        amount: parsedAmount,
        date,
        hasReceipt
      };

      addExpense(newExpense);
    }

    setIsAddingExpense(false);
    resetForm();
  };

  const handleScanReceipt = () => {
    setHasReceipt(!hasReceipt);
    Alert.alert('Success', 'Receipt scanned successfully');
  };

  const renderVehicleExpenseFields = () => {
    if (category !== 'Vehicles') return null;

    if (vehicles.length === 0) {
      return (
        <View style={styles.warningContainer}>
          <AlertCircle size={20} color="#FFA000" />
          <Text style={styles.warningText}>
            Please add a vehicle in the Vehicles tab before adding vehicle expenses
          </Text>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.inputLabel}>Vehicle</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowVehicleModal(true)}
        >
          <Car size={20} color="#666666" style={styles.inputIcon} />
          <Text style={styles.selectorText}>
            {selectedVehicle ? 
              `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : 
              'Select vehicle'}
          </Text>
          <ChevronDown size={20} color="#666666" />
        </TouchableOpacity>

        {selectedVehicle && (
          <>
            <Text style={styles.inputLabel}>Expense Type</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowExpenseTypeModal(true)}
            >
              <Text style={styles.selectorText}>
                {expenseType || 'Select expense type'}
              </Text>
              <ChevronDown size={20} color="#666666" />
            </TouchableOpacity>

            {expenseType === 'Fuel' && (
              <>
                <Text style={styles.inputLabel}>Fuel Type</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowFuelTypeModal(true)}
                >
                  <Text style={styles.selectorText}>
                    {fuelType || 'Select fuel type'}
                  </Text>
                  <ChevronDown size={20} color="#666666" />
                </TouchableOpacity>
              </>
            )}

            {expenseType === 'Insurance' && (
              <>
                <Text style={styles.inputLabel}>Insurance Type</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter insurance type"
                  value={insuranceType}
                  onChangeText={setInsuranceType}
                />
              </>
            )}

            {expenseType === 'Registration' && (
              <>
                <Text style={styles.inputLabel}>Registration Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={registrationDate}
                  onChangeText={setRegistrationDate}
                />
                <Text style={styles.inputLabel}>Inspection Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={inspectionDate}
                  onChangeText={setInspectionDate}
                />
              </>
            )}

            {expenseType === 'Service' && (
              <>
                <Text style={styles.inputLabel}>Service Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter service details"
                  value={serviceNotes}
                  onChangeText={setServiceNotes}
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            {expenseType === 'Consumable' && (
              <>
                <Text style={styles.inputLabel}>Consumable Type</Text>
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowConsumableTypeModal(true)}
                >
                  <Text style={styles.selectorText}>
                    {consumableType || 'Select consumable type'}
                  </Text>
                  <ChevronDown size={20} color="#666666" />
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Expenses</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color="#666" />
            <Text style={styles.emptyStateText}>No expenses recorded yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Track your expenses by adding your first record
            </Text>
          </View>
        ) : (
          expenses.map((expense, index) => (
            <Animated.View 
              key={expense.id} 
              entering={FadeInUp.delay(index * 100)}
              style={styles.expenseCard}
            >
              <View style={styles.expenseHeader}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseAmount}>
                  ${expense.amount.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.expenseDate}>
                {new Date(expense.date).toLocaleDateString()}
              </Text>
              {expense.hasReceipt && (
                <View style={styles.receiptIndicator}>
                  <Receipt size={14} color="#008080" />
                  <Text style={styles.receiptText}>Receipt attached</Text>
                </View>
              )}
            </Animated.View>
          ))
        )}
      </ScrollView>

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
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={styles.selectorText}>
                  {category || 'Select category'}
                </Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>

              {renderVehicleExpenseFields()}

              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputContainer}>
                <Calendar size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onChangeText={setDate}
                />
              </View>

              <TouchableOpacity
                style={[styles.scanButton, hasReceipt && styles.scannedButton]}
                onPress={handleScanReceipt}
              >
                <Receipt size={20} color={hasReceipt ? "#FFFFFF" : "#008080"} />
                <Text style={[styles.scanButtonText, hasReceipt && styles.scannedButtonText]}>
                  {hasReceipt ? 'Receipt Scanned' : 'Scan Receipt'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!category || !amount) && styles.submitButtonDisabled
                ]}
                onPress={handleAddExpense}
                disabled={!category || !amount}
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
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.pickerItem}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehicleModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Vehicle</Text>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedVehicle(vehicle);
                  setShowVehicleModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
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
            {vehicleExpenseTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setExpenseType(type);
                  setShowExpenseTypeModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fuel Type Selection Modal */}
      <Modal
        visible={showFuelTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFuelTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFuelTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Fuel Type</Text>
            {fuelTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setFuelType(type);
                  setShowFuelTypeModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Consumable Type Selection Modal */}
      <Modal
        visible={showConsumableTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowConsumableTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowConsumableTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Consumable Type</Text>
            {consumableTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setConsumableType(type);
                  setShowConsumableTypeModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333333',
  },
  expenseAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#008080',
  },
  expenseDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  receiptIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  receiptText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#008080',
    marginLeft: 4,
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
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#F57C00',
    marginLeft: 8,
    flex: 1,
  },
});