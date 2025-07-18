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
  Alert
} from 'react-native';
import { useData, Vehicle, VehicleExpense, VehicleType, FuelType, ConsumableType } from '@/context/DataContext';
import {
  Car,
  Plus,
  ChevronDown,
  X,
  Calendar as CalendarIcon,
  Receipt,
  Camera,
  DollarSign,
  ChevronRight
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const VEHICLE_TYPES: VehicleType[] = ['Car', 'SUV', 'UTE', 'Pickup Truck', 'Caravan', 'Boat'];
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'LPG', 'EV'];
const CONSUMABLE_TYPES: ConsumableType[] = ['Tyres', 'Wiper Blades', 'Engine Oil', 'Other'];

const VehiclesScreen = () => {
  const { vehicles, addVehicle, deleteVehicle, addVehicleExpense, getVehicleExpenses } = useData();
  
  // Vehicle form state
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationDueDate, setRegistrationDueDate] = useState('');
  const [insuranceDueDate, setInsuranceDueDate] = useState('');
  const [serviceDueDate, setServiceDueDate] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  
  // Expense form state
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [expenseType, setExpenseType] = useState<VehicleExpense['type']>('Fuel');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [hasReceipt, setHasReceipt] = useState(false);
  
  // Additional expense details
  const [insuranceType, setInsuranceType] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [consumableType, setConsumableType] = useState<ConsumableType>('Tyres');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelKilometers, setFuelKilometers] = useState('');
  
  // Vehicle details view
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  
  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);
  const [showConsumableTypeModal, setShowConsumableTypeModal] = useState(false);
  
  const resetVehicleForm = () => {
    setVehicleType('Car');
    setMake('');
    setModel('');
    setYear('');
    setRegistrationNumber('');
    setRegistrationDueDate('');
    setInsuranceDueDate('');
    setServiceDueDate('');
    setFuelType('Petrol');
  };
  
  const resetExpenseForm = () => {
    setExpenseType('Fuel');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setExpenseAmount('');
    setHasReceipt(false);
    setInsuranceType('');
    setInspectionDate('');
    setServiceNotes('');
    setConsumableType('Tyres');
    setFuelLiters('');
    setFuelKilometers('');
  };
  
  const handleAddVehicle = () => {
    if (!make || !model || !year || !registrationNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const newVehicle = {
      type: vehicleType,
      make,
      model,
      year,
      registrationNumber,
      registrationDueDate,
      insuranceDueDate,
      serviceDueDate,
      fuelType,
    };
    
    addVehicle(newVehicle);
    setIsAddingVehicle(false);
    resetVehicleForm();
  };
  
  const handleAddExpense = () => {
    if (!selectedVehicle || !expenseAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    const newExpense: Omit<VehicleExpense, 'id' | 'userId'> = {
      vehicleId: selectedVehicle.id,
      type: expenseType,
      date: expenseDate,
      amount: parsedAmount,
      hasReceipt,
    };
    
    // Add type-specific fields
    if (expenseType === 'Insurance') {
      newExpense.insuranceType = insuranceType;
    } else if (expenseType === 'Inspection') {
      newExpense.inspectionDate = inspectionDate;
    } else if (expenseType === 'Service') {
      newExpense.serviceNotes = serviceNotes;
    } else if (expenseType === 'Consumable') {
      newExpense.consumableType = consumableType;
    } else if (expenseType === 'Fuel') {
      newExpense.fuelType = selectedVehicle.fuelType;
      if (fuelLiters) newExpense.liters = parseFloat(fuelLiters);
      if (fuelKilometers) newExpense.kilometers = parseFloat(fuelKilometers);
    }
    
    addVehicleExpense(newExpense);
    setIsAddingExpense(false);
    setSelectedVehicle(null);
    resetExpenseForm();
  };
  
  const handleScanReceipt = () => {
    setHasReceipt(!hasReceipt);
    Alert.alert('Success', hasReceipt ? 'Receipt removed' : 'Receipt scanned successfully');
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString || dateString.trim() === '') {
      return 'Not set';
    }
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Not set';
      }
      
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Not set';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  const renderVehicleItem = ({ item }: { item: Vehicle }) => {
    const vehicleExpenses = getVehicleExpenses(item.id);
    const totalExpenses = vehicleExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return (
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.vehicleCard}
      >
        <TouchableOpacity
          style={styles.vehicleContent}
          onPress={() => setViewingVehicle(item)}
        >
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleTitle}>
                {item.year} {item.make} {item.model}
              </Text>
              <Text style={styles.vehicleSubtitle}>
                {item.type} • {item.registrationNumber}
              </Text>
              <Text style={styles.vehicleExpenseTotal}>
                Total Expenses: {formatCurrency(totalExpenses)}
              </Text>
              <Text style={styles.vehicleExpenseCount}>
                {vehicleExpenses.length} expense{vehicleExpenses.length !== 1 ? 's' : ''} recorded
              </Text>
            </View>
            
            <View style={styles.vehicleActions}>
              <TouchableOpacity
                style={styles.addExpenseButton}
                onPress={() => {
                  setSelectedVehicle(item);
                  setIsAddingExpense(true);
                }}
              >
                <Plus size={20} color="#008080" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.viewButton}>
                <ChevronRight size={20} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.vehicleDates}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Registration Due:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.registrationDueDate)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Insurance Due:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.insuranceDueDate)}
              </Text>
            </View>
            
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Service Due:</Text>
              <Text style={styles.dateValue}>
                {formatDate(item.serviceDueDate)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteVehicle(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete Vehicle</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  const renderExpenseItem = ({ item }: { item: VehicleExpense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseType}>{item.type}</Text>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
      </View>
      <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
      {item.hasReceipt && (
        <View style={styles.receiptIndicator}>
          <Receipt size={12} color="#4CAF50" />
          <Text style={styles.receiptText}>Receipt attached</Text>
        </View>
      )}
      
      {/* Type-specific details */}
      {item.type === 'Fuel' && (item.liters || item.kilometers) && (
        <View style={styles.expenseDetails}>
          {item.liters && <Text style={styles.detailText}>Liters: {item.liters}</Text>}
          {item.kilometers && <Text style={styles.detailText}>Odometer: {item.kilometers} km</Text>}
        </View>
      )}
      
      {item.type === 'Insurance' && item.insuranceType && (
        <View style={styles.expenseDetails}>
          <Text style={styles.detailText}>Type: {item.insuranceType}</Text>
        </View>
      )}
      
      {item.type === 'Service' && item.serviceNotes && (
        <View style={styles.expenseDetails}>
          <Text style={styles.detailText}>Notes: {item.serviceNotes}</Text>
        </View>
      )}
      
      {item.type === 'Consumable' && item.consumableType && (
        <View style={styles.expenseDetails}>
          <Text style={styles.detailText}>Type: {item.consumableType}</Text>
        </View>
      )}
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingVehicle(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {vehicles.length > 0 ? (
        <FlatList
          data={vehicles}
          renderItem={renderVehicleItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Car size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>No vehicles added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the + button to add your first vehicle
          </Text>
        </View>
      )}
      
      {/* Vehicle Details Modal */}
      <Modal
        visible={viewingVehicle !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewingVehicle(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {viewingVehicle ? `${viewingVehicle.year} ${viewingVehicle.make} ${viewingVehicle.model}` : ''}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewingVehicle(null)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {viewingVehicle && (
              <ScrollView style={styles.vehicleDetailsContainer}>
                <Text style={styles.sectionTitle}>Expense History</Text>
                
                {getVehicleExpenses(viewingVehicle.id).length > 0 ? (
                  <FlatList
                    data={getVehicleExpenses(viewingVehicle.id).sort((a, b) => 
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                    )}
                    renderItem={renderExpenseItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.noExpensesText}>No expenses recorded yet</Text>
                )}
                
                <TouchableOpacity
                  style={styles.addExpenseFromDetailsButton}
                  onPress={() => {
                    setSelectedVehicle(viewingVehicle);
                    setViewingVehicle(null);
                    setIsAddingExpense(true);
                  }}
                >
                  <Plus size={20} color="#FFFFFF" />
                  <Text style={styles.addExpenseFromDetailsText}>Add Expense</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Add Vehicle Modal */}
      <Modal
        visible={isAddingVehicle}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingVehicle(false);
          resetVehicleForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vehicle</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingVehicle(false);
                  resetVehicleForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Vehicle Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTypeModal(true)}
              >
                <Car size={20} color="#666666" />
                <Text style={styles.selectorText}>{vehicleType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Make</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Toyota"
                value={make}
                onChangeText={setMake}
              />
              
              <Text style={styles.inputLabel}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Camry"
                value={model}
                onChangeText={setModel}
              />
              
              <Text style={styles.inputLabel}>Year</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2020"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
              />
              
              <Text style={styles.inputLabel}>Registration Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., ABC123"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                autoCapitalize="characters"
              />
              
              <Text style={styles.inputLabel}>Registration Due Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={registrationDueDate}
                onChangeText={setRegistrationDueDate}
              />
              
              <Text style={styles.inputLabel}>Insurance Due Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={insuranceDueDate}
                onChangeText={setInsuranceDueDate}
              />
              
              <Text style={styles.inputLabel}>Service Due Date (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={serviceDueDate}
                onChangeText={setServiceDueDate}
              />
              
              <Text style={styles.inputLabel}>Fuel Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowFuelTypeModal(true)}
              >
                <Text style={styles.selectorText}>{fuelType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddVehicle}
              >
                <Text style={styles.submitButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Add Expense Modal */}
      <Modal
        visible={isAddingExpense}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingExpense(false);
          setSelectedVehicle(null);
          resetExpenseForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vehicle Expense</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingExpense(false);
                  setSelectedVehicle(null);
                  resetExpenseForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              {selectedVehicle && (
                <View style={styles.selectedVehicleInfo}>
                  <Text style={styles.selectedVehicleText}>
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </Text>
                </View>
              )}
              
              <Text style={styles.inputLabel}>Expense Type</Text>
              <View style={styles.expenseTypeContainer}>
                {['Fuel', 'Insurance', 'Registration', 'Service', 'Inspection', 'Consumable'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.expenseTypeButton,
                      expenseType === type && styles.expenseTypeButtonActive
                    ]}
                    onPress={() => setExpenseType(type as VehicleExpense['type'])}
                  >
                    <Text
                      style={[
                        styles.expenseTypeText,
                        expenseType === type && styles.expenseTypeTextActive
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.inputLabel}>Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={expenseDate}
                  onChangeText={setExpenseDate}
                />
              </View>
              
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
              
              {expenseType === 'Insurance' && (
                <>
                  <Text style={styles.inputLabel}>Insurance Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Comprehensive"
                    value={insuranceType}
                    onChangeText={setInsuranceType}
                  />
                </>
              )}
              
              {expenseType === 'Inspection' && (
                <>
                  <Text style={styles.inputLabel}>Inspection Date</Text>
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
                    placeholder="Enter service details..."
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
                    <Text style={styles.selectorText}>{consumableType}</Text>
                    <ChevronDown size={20} color="#666666" />
                  </TouchableOpacity>
                </>
              )}
              
              {expenseType === 'Fuel' && (
                <>
                  <Text style={styles.inputLabel}>Liters/kWh</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={fuelLiters}
                    onChangeText={setFuelLiters}
                    keyboardType="numeric"
                  />
                  
                  <Text style={styles.inputLabel}>Odometer Reading (km)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={fuelKilometers}
                    onChangeText={setFuelKilometers}
                    keyboardType="numeric"
                  />
                </>
              )}
              
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
                onPress={handleAddExpense}
              >
                <Text style={styles.submitButtonText}>Add Expense</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Vehicle Type Selection Modal */}
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
            <Text style={styles.pickerTitle}>Select Vehicle Type</Text>
            {VEHICLE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setVehicleType(type);
                  setShowTypeModal(false);
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
            {FUEL_TYPES.map((type) => (
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
            {CONSUMABLE_TYPES.map((type) => (
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
  vehicleCard: {
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
  vehicleContent: {
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  vehicleExpenseTotal: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#008080',
    marginBottom: 2,
  },
  vehicleExpenseCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
  },
  vehicleActions: {
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
  vehicleDates: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  dateValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
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
  vehicleDetailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
  },
  selectedVehicleInfo: {
    backgroundColor: '#E6F4F4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedVehicleText: {
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
    minHeight: 100,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  pickerItemText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
  },
  expenseTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  expenseTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    margin: 4,
  },
  expenseTypeButtonActive: {
    backgroundColor: '#008080',
  },
  expenseTypeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  expenseTypeTextActive: {
    color: '#FFFFFF',
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
  expenseItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
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
  expenseDate: {
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
  expenseDetails: {
    marginTop: 4,
  },
  detailText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
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
});

export default VehiclesScreen;