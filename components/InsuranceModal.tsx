import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList
} from 'react-native';
import { useHome, Home, HomeInsurance, InsuranceType } from '@/context/HomeContext';
import { Shield, Plus, X, Calendar as CalendarIcon, DollarSign, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const INSURANCE_TYPES: InsuranceType[] = ['Home', 'Contents', 'Home & Contents', 'Landlord'];

interface InsuranceModalProps {
  visible: boolean;
  home: Home | null;
  onClose: () => void;
}

export const InsuranceModal: React.FC<InsuranceModalProps> = ({ visible, home, onClose }) => {
  const { getHomeInsurances, addHomeInsurance, deleteHomeInsurance } = useHome();
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>('Home');
  const [cost, setCost] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [provider, setProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  const resetForm = () => {
    setInsuranceType('Home');
    setCost('');
    setRenewalDate('');
    setProvider('');
    setPolicyNumber('');
  };
  
  const handleAdd = async () => {
    if (!home || !cost || !renewalDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost <= 0) {
      Alert.alert('Error', 'Please enter a valid cost');
      return;
    }
    
    await addHomeInsurance({
      homeId: home.id,
      type: insuranceType,
      cost: parsedCost,
      renewalDate,
      provider: provider.trim() || undefined,
      policyNumber: policyNumber.trim() || undefined,
    });
    
    setIsAdding(false);
    resetForm();
  };
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getInsuranceColor = (type: InsuranceType) => {
    const colors = {
      'Home': '#4CAF50',
      'Contents': '#2196F3',
      'Home & Contents': '#673AB7',
      'Landlord': '#FF9800'
    };
    return colors[type];
  };
  
  const renderInsuranceItem = ({ item }: { item: HomeInsurance }) => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.insuranceCard}>
      <View style={styles.insuranceHeader}>
        <View style={styles.insuranceInfo}>
          <View style={styles.typeRow}>
            <View style={[styles.typeDot, { backgroundColor: getInsuranceColor(item.type) }]} />
            <Text style={styles.insuranceType}>{item.type}</Text>
          </View>
          <Text style={styles.insuranceCost}>{formatCurrency(item.cost)}</Text>
          <Text style={styles.renewalDate}>Renewal: {formatDate(item.renewalDate)}</Text>
          {item.provider && <Text style={styles.provider}>Provider: {item.provider}</Text>}
          {item.policyNumber && <Text style={styles.policyNumber}>Policy: {item.policyNumber}</Text>}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteHomeInsurance(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  if (!home) return null;
  
  const insurances = getHomeInsurances(home.id);
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Insurance - {home.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Insurance</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {insurances.length > 0 ? (
              <FlatList
                data={insurances}
                renderItem={renderInsuranceItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Shield size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No insurance policies added</Text>
                <Text style={styles.emptySubtext}>Tap "Add Insurance" to get started</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Add Insurance Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Insurance</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setIsAdding(false);
                  resetForm();
                }}
              >
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Insurance Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTypeModal(true)}
              >
                <View style={[styles.typeDot, { backgroundColor: getInsuranceColor(insuranceType) }]} />
                <Text style={styles.selectorText}>{insuranceType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Annual Cost</Text>
              <View style={styles.inputContainer}>
                <DollarSign size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={cost}
                  onChangeText={setCost}
                  keyboardType="numeric"
                />
              </View>
              
              <Text style={styles.inputLabel}>Renewal Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={renewalDate}
                  onChangeText={setRenewalDate}
                />
              </View>
              
              <Text style={styles.inputLabel}>Provider (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Insurance company name"
                value={provider}
                onChangeText={setProvider}
              />
              
              <Text style={styles.inputLabel}>Policy Number (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Policy number"
                value={policyNumber}
                onChangeText={setPolicyNumber}
              />
              
              <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                <Text style={styles.submitButtonText}>Add Insurance</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Type Selection Modal */}
      <Modal visible={showTypeModal} animationType="fade" transparent={true}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTypeModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Insurance Type</Text>
            {INSURANCE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setInsuranceType(type);
                  setShowTypeModal(false);
                }}
              >
                <View style={[styles.typeDot, { backgroundColor: getInsuranceColor(type) }]} />
                <Text style={styles.pickerItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
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
  headerActions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#008080',
    borderRadius: 8,
    padding: 12,
  },
  addButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  insuranceCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  insuranceHeader: {
    marginBottom: 12,
  },
  insuranceInfo: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  insuranceType: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
  },
  insuranceCost: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#008080',
    marginBottom: 4,
  },
  renewalDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  provider: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  policyNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
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
    marginLeft: 8,
  },
});