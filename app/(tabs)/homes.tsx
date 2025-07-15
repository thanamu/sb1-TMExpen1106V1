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
import { useHome, Home, HomeType, OwnershipType, InsuranceType } from '@/context/HomeContext';
import { Chrome as HomeIcon, Plus, ChevronDown, X, Calendar as CalendarIcon, DollarSign, ChevronRight, Shield, Zap, Droplets, Wifi, Wrench, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const HOME_TYPES: HomeType[] = ['House', 'Town house', 'Unit / Apartment'];
const OWNERSHIP_TYPES: OwnershipType[] = ['Owner/Occupier', 'Paying off home loan', 'Renter', 'Investor'];
const INSURANCE_TYPES: InsuranceType[] = ['Home', 'Contents', 'Home & Contents', 'Landlord'];

const HomesScreen = () => {
  const { 
    homes, 
    addHome, 
    deleteHome, 
    getHomeInsurances,
    getSmokeAlarms,
    getRepairMaintenances,
    getUtilityBills
  } = useHome();
  
  // Home form state
  const [isAddingHome, setIsAddingHome] = useState(false);
  const [homeName, setHomeName] = useState('');
  const [homeType, setHomeType] = useState<HomeType>('House');
  const [ownershipType, setOwnershipType] = useState<OwnershipType>('Owner/Occupier');
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [rent, setRent] = useState('');
  const [councilRates, setCouncilRates] = useState('');
  const [strataFees, setStrataFees] = useState('');
  const [address, setAddress] = useState('');
  
  // Home details view
  const [viewingHome, setViewingHome] = useState<Home | null>(null);
  
  // Modal states
  const [showHomeTypeModal, setShowHomeTypeModal] = useState(false);
  const [showOwnershipModal, setShowOwnershipModal] = useState(false);
  
  const resetHomeForm = () => {
    setHomeName('');
    setHomeType('House');
    setOwnershipType('Owner/Occupier');
    setRepaymentAmount('');
    setRent('');
    setCouncilRates('');
    setStrataFees('');
    setAddress('');
  };
  
  const handleAddHome = () => {
    if (!homeName.trim()) {
      Alert.alert('Error', 'Please enter a home name');
      return;
    }
    
    const newHome = {
      name: homeName.trim(),
      type: homeType,
      ownershipType,
      repaymentAmount: repaymentAmount ? parseFloat(repaymentAmount) : undefined,
      rent: rent ? parseFloat(rent) : undefined,
      councilRates: councilRates ? parseFloat(councilRates) : undefined,
      strataFees: strataFees ? parseFloat(strataFees) : undefined,
      address: address.trim() || undefined,
    };
    
    addHome(newHome);
    setIsAddingHome(false);
    resetHomeForm();
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return 'Not set';
    return amount.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  const getHomeIcon = (type: HomeType) => {
    return <HomeIcon size={20} color="#008080" />;
  };
  
  const renderHomeItem = ({ item }: { item: Home }) => {
    const insurances = getHomeInsurances(item.id);
    const smokeAlarms = getSmokeAlarms(item.id);
    const repairs = getRepairMaintenances(item.id);
    const bills = getUtilityBills(item.id);
    
    const totalMonthlyExpenses = (item.repaymentAmount || 0) + 
                                (item.rent || 0) + 
                                (item.councilRates || 0) + 
                                (item.strataFees || 0);
    
    return (
      <Animated.View
        entering={FadeInUp.delay(100).duration(400)}
        style={styles.homeCard}
      >
        <TouchableOpacity
          style={styles.homeContent}
          onPress={() => setViewingHome(item)}
        >
          <View style={styles.homeHeader}>
            <View style={styles.homeInfo}>
              <View style={styles.homeTitleRow}>
                {getHomeIcon(item.type)}
                <Text style={styles.homeTitle}>{item.name}</Text>
              </View>
              <Text style={styles.homeSubtitle}>
                {item.type} • {item.ownershipType}
              </Text>
              {item.address && (
                <Text style={styles.homeAddress}>{item.address}</Text>
              )}
              <Text style={styles.homeExpenseTotal}>
                Monthly: {formatCurrency(totalMonthlyExpenses)}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.viewButton}>
              <ChevronRight size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.homeStats}>
            <View style={styles.statItem}>
              <Shield size={16} color="#4CAF50" />
              <Text style={styles.statText}>{insurances.length} Insurance{insurances.length !== 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.statItem}>
              <AlertTriangle size={16} color="#FF9800" />
              <Text style={styles.statText}>{smokeAlarms.length} Alarm{smokeAlarms.length !== 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Wrench size={16} color="#2196F3" />
              <Text style={styles.statText}>{repairs.length} Repair{repairs.length !== 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Zap size={16} color="#673AB7" />
              <Text style={styles.statText}>{bills.length} Bill{bills.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteHome(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete Home</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Homes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingHome(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {homes.length > 0 ? (
        <FlatList
          data={homes}
          renderItem={renderHomeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <HomeIcon size={48} color="#CCCCCC" />
          <Text style={styles.emptyStateText}>No homes added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap the + button to add your first home
          </Text>
        </View>
      )}
      
      {/* Home Details Modal */}
      <Modal
        visible={viewingHome !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewingHome(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {viewingHome?.name}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewingHome(null)}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {viewingHome && (
              <ScrollView style={styles.homeDetailsContainer}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Home Details</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{viewingHome.type}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Ownership:</Text>
                    <Text style={styles.detailValue}>{viewingHome.ownershipType}</Text>
                  </View>
                  {viewingHome.address && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Address:</Text>
                      <Text style={styles.detailValue}>{viewingHome.address}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Financial Details</Text>
                  {viewingHome.repaymentAmount && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Repayment:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(viewingHome.repaymentAmount)}</Text>
                    </View>
                  )}
                  {viewingHome.rent && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Rent:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(viewingHome.rent)}</Text>
                    </View>
                  )}
                  {viewingHome.councilRates && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Council Rates:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(viewingHome.councilRates)}</Text>
                    </View>
                  )}
                  {viewingHome.strataFees && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Strata Fees:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(viewingHome.strataFees)}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setViewingHome(null);
                      // TODO: Navigate to insurance management
                      Alert.alert('Insurance Management', 'Insurance management feature coming soon!');
                    }}
                  >
                    <Shield size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Manage Insurance</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setViewingHome(null);
                      // TODO: Navigate to smoke alarms management
                      Alert.alert('Smoke Alarms', 'Smoke alarm management feature coming soon!');
                    }}
                  >
                    <AlertTriangle size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Smoke Alarms</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setViewingHome(null);
                      // TODO: Navigate to repairs & maintenance
                      Alert.alert('Repairs & Maintenance', 'Repairs & maintenance management feature coming soon!');
                    }}
                  >
                    <Wrench size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Repairs & Maintenance</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => {
                      setViewingHome(null);
                      // TODO: Navigate to utility bills management
                      Alert.alert('Utility Bills', 'Utility bills management feature coming soon!');
                    }}
                  >
                    <Zap size={20} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Utility Bills</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Add Home Modal */}
      <Modal
        visible={isAddingHome}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setIsAddingHome(false);
          resetHomeForm();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Home</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingHome(false);
                  resetHomeForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Home Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Main Residence, Investment Property"
                value={homeName}
                onChangeText={setHomeName}
              />
              
              <Text style={styles.inputLabel}>Home Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowHomeTypeModal(true)}
              >
                <HomeIcon size={20} color="#666666" />
                <Text style={styles.selectorText}>{homeType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Ownership Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowOwnershipModal(true)}
              >
                <Text style={styles.selectorText}>{ownershipType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Address (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter property address"
                value={address}
                onChangeText={setAddress}
                multiline
              />
              
              {(ownershipType === 'Paying off home loan') && (
                <>
                  <Text style={styles.inputLabel}>Monthly Repayment Amount</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={repaymentAmount}
                      onChangeText={setRepaymentAmount}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
              
              {ownershipType === 'Renter' && (
                <>
                  <Text style={styles.inputLabel}>Monthly Rent</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={rent}
                      onChangeText={setRent}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
              
              {(ownershipType === 'Owner/Occupier' || ownershipType === 'Paying off home loan' || ownershipType === 'Investor') && (
                <>
                  <Text style={styles.inputLabel}>Council Rates (Annual)</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={councilRates}
                      onChangeText={setCouncilRates}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
              
              {(homeType === 'Town house' || homeType === 'Unit / Apartment') && 
               (ownershipType === 'Owner/Occupier' || ownershipType === 'Paying off home loan' || ownershipType === 'Investor') && (
                <>
                  <Text style={styles.inputLabel}>Strata Fees (Quarterly)</Text>
                  <View style={styles.inputContainer}>
                    <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="0.00"
                      value={strataFees}
                      onChangeText={setStrataFees}
                      keyboardType="numeric"
                    />
                  </View>
                </>
              )}
              
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddHome}
              >
                <Text style={styles.submitButtonText}>Add Home</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Home Type Selection Modal */}
      <Modal
        visible={showHomeTypeModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowHomeTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHomeTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Home Type</Text>
            {HOME_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setHomeType(type);
                  setShowHomeTypeModal(false);
                }}
              >
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Ownership Type Selection Modal */}
      <Modal
        visible={showOwnershipModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowOwnershipModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOwnershipModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Ownership Type</Text>
            {OWNERSHIP_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setOwnershipType(type);
                  setShowOwnershipModal(false);
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
  homeCard: {
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
  homeContent: {
    marginBottom: 12,
  },
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  homeInfo: {
    flex: 1,
  },
  homeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  homeTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  homeSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  homeAddress: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#888888',
    marginBottom: 8,
  },
  homeExpenseTotal: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#008080',
  },
  viewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
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
  homeDetailsContainer: {
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  actionButtons: {
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
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
});

export default HomesScreen;