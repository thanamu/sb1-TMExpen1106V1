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
import { useHome, Home, UtilityBill } from '@/context/HomeContext';
import { Zap, Plus, X, Calendar as CalendarIcon, DollarSign, ChevronDown, Droplets, Wifi } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const UTILITY_TYPES: UtilityBill['type'][] = ['Water', 'Electricity', 'Gas', 'Internet', 'Other'];

interface UtilityBillsModalProps {
  visible: boolean;
  home: Home | null;
  onClose: () => void;
}

export const UtilityBillsModal: React.FC<UtilityBillsModalProps> = ({ visible, home, onClose }) => {
  const { getUtilityBills, addUtilityBill, deleteUtilityBill } = useHome();
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [billType, setBillType] = useState<UtilityBill['type']>('Electricity');
  const [provider, setProvider] = useState('');
  const [planName, setPlanName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [billingDate, setBillingDate] = useState('');
  const [amount, setAmount] = useState('');
  const [datePaid, setDatePaid] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  const resetForm = () => {
    setBillType('Electricity');
    setProvider('');
    setPlanName('');
    setServiceDescription('');
    setBillingDate('');
    setAmount('');
    setDatePaid('');
    setAccountNumber('');
    setNotes('');
  };
  
  const handleAdd = async () => {
    if (!home || !billingDate || !amount || !datePaid) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    await addUtilityBill({
      homeId: home.id,
      type: billType,
      provider: provider.trim() || undefined,
      planName: planName.trim() || undefined,
      serviceDescription: serviceDescription.trim() || undefined,
      billingDate,
      amount: parsedAmount,
      datePaid,
      accountNumber: accountNumber.trim() || undefined,
      notes: notes.trim() || undefined,
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
  
  const getUtilityIcon = (type: UtilityBill['type']) => {
    switch (type) {
      case 'Water':
        return <Droplets size={20} color="#2196F3" />;
      case 'Electricity':
        return <Zap size={20} color="#FF9800" />;
      case 'Gas':
        return <Zap size={20} color="#4CAF50" />;
      case 'Internet':
        return <Wifi size={20} color="#673AB7" />;
      default:
        return <Zap size={20} color="#666666" />;
    }
  };
  
  const getUtilityColor = (type: UtilityBill['type']) => {
    const colors = {
      'Water': '#2196F3',
      'Electricity': '#FF9800',
      'Gas': '#4CAF50',
      'Internet': '#673AB7',
      'Other': '#666666'
    };
    return colors[type];
  };
  
  const renderBillItem = ({ item }: { item: UtilityBill }) => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.billCard}>
      <View style={styles.billHeader}>
        <View style={styles.billInfo}>
          <View style={styles.typeRow}>
            {getUtilityIcon(item.type)}
            <Text style={styles.billType}>{item.type}</Text>
          </View>
          
          <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
          
          {item.provider && (
            <Text style={styles.provider}>Provider: {item.provider}</Text>
          )}
          
          {item.planName && (
            <Text style={styles.planName}>Plan: {item.planName}</Text>
          )}
          
          {item.serviceDescription && (
            <Text style={styles.serviceDescription}>{item.serviceDescription}</Text>
          )}
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Billing Date: {formatDate(item.billingDate)}</Text>
            <Text style={styles.dateLabel}>Date Paid: {formatDate(item.datePaid)}</Text>
          </View>
          
          {item.accountNumber && (
            <Text style={styles.accountNumber}>Account: {item.accountNumber}</Text>
          )}
          
          {item.notes && (
            <Text style={styles.billNotes}>{item.notes}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteUtilityBill(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  if (!home) return null;
  
  const bills = getUtilityBills(home.id);
  const totalMonthlyBills = bills.reduce((sum, bill) => sum + bill.amount, 0);
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Utility Bills - {home.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {bills.length > 0 && (
            <View style={styles.summaryBanner}>
              <Text style={styles.summaryText}>
                Total Bills: {formatCurrency(totalMonthlyBills)} ({bills.length} bill{bills.length > 1 ? 's' : ''})
              </Text>
            </View>
          )}
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Utility Bill</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {bills.length > 0 ? (
              <FlatList
                data={bills.sort((a, b) => new Date(b.billingDate).getTime() - new Date(a.billingDate).getTime())}
                renderItem={renderBillItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Zap size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No utility bills recorded</Text>
                <Text style={styles.emptySubtext}>Tap "Add Utility Bill" to get started</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Add Bill Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Utility Bill</Text>
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
              <Text style={styles.inputLabel}>Utility Type</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowTypeModal(true)}
              >
                {getUtilityIcon(billType)}
                <Text style={styles.selectorText}>{billType}</Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Provider (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., AGL, Origin Energy"
                value={provider}
                onChangeText={setProvider}
              />
              
              <Text style={styles.inputLabel}>Plan Name (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Residential Basic, NBN 50"
                value={planName}
                onChangeText={setPlanName}
              />
              
              <Text style={styles.inputLabel}>Service Description (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Brief description of service"
                value={serviceDescription}
                onChangeText={setServiceDescription}
              />
              
              <Text style={styles.inputLabel}>Billing Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={billingDate}
                  onChangeText={setBillingDate}
                />
              </View>
              
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
              
              <Text style={styles.inputLabel}>Date Paid</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={datePaid}
                  onChangeText={setDatePaid}
                />
              </View>
              
              <Text style={styles.inputLabel}>Account Number (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Account or reference number"
                value={accountNumber}
                onChangeText={setAccountNumber}
              />
              
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              
              <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                <Text style={styles.submitButtonText}>Add Utility Bill</Text>
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
            <Text style={styles.pickerTitle}>Select Utility Type</Text>
            {UTILITY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerItem}
                onPress={() => {
                  setBillType(type);
                  setShowTypeModal(false);
                }}
              >
                {getUtilityIcon(type)}
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
  summaryBanner: {
    backgroundColor: '#E6F4F4',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#008080',
  },
  summaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#008080',
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
  billCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#673AB7',
  },
  billHeader: {
    marginBottom: 12,
  },
  billInfo: {
    flex: 1,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  billType: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  billAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#008080',
    marginBottom: 8,
  },
  provider: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  planName: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  serviceDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  dateInfo: {
    marginBottom: 8,
  },
  dateLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  accountNumber: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  billNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
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