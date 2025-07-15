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
import { useHome, Home, RepairMaintenance } from '@/context/HomeContext';
import { Wrench, Plus, X, Calendar as CalendarIcon, DollarSign, User } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const REPAIR_CATEGORIES = [
  'Plumbing', 'Electrical', 'HVAC', 'Roofing', 'Flooring', 
  'Painting', 'Carpentry', 'Appliances', 'Landscaping', 'Other'
];

interface RepairsModalProps {
  visible: boolean;
  home: Home | null;
  onClose: () => void;
}

export const RepairsModal: React.FC<RepairsModalProps> = ({ visible, home, onClose }) => {
  const { getRepairMaintenances, addRepairMaintenance, deleteRepairMaintenance } = useHome();
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [description, setDescription] = useState('');
  const [repairerName, setRepairerName] = useState('');
  const [repairerCompany, setRepairerCompany] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [notes, setNotes] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  const resetForm = () => {
    setDescription('');
    setRepairerName('');
    setRepairerCompany('');
    setWorkDate('');
    setPaidDate('');
    setAmount('');
    setCategory('Other');
    setNotes('');
  };
  
  const handleAdd = async () => {
    if (!home || !description || !repairerName || !workDate || !paidDate || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    
    await addRepairMaintenance({
      homeId: home.id,
      description: description.trim(),
      repairerName: repairerName.trim(),
      repairerCompany: repairerCompany.trim() || undefined,
      workDate,
      paidDate,
      amount: parsedAmount,
      category,
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
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Plumbing': '#2196F3',
      'Electrical': '#FF9800',
      'HVAC': '#4CAF50',
      'Roofing': '#795548',
      'Flooring': '#9C27B0',
      'Painting': '#E91E63',
      'Carpentry': '#8BC34A',
      'Appliances': '#607D8B',
      'Landscaping': '#4CAF50',
      'Other': '#666666'
    };
    return colors[category] || '#666666';
  };
  
  const renderRepairItem = ({ item }: { item: RepairMaintenance }) => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.repairCard}>
      <View style={styles.repairHeader}>
        <View style={styles.repairInfo}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
            <Text style={styles.repairCategory}>{item.category}</Text>
          </View>
          
          <Text style={styles.repairDescription}>{item.description}</Text>
          <Text style={styles.repairAmount}>{formatCurrency(item.amount)}</Text>
          
          <View style={styles.repairerInfo}>
            <Text style={styles.repairerName}>{item.repairerName}</Text>
            {item.repairerCompany && (
              <Text style={styles.repairerCompany}>{item.repairerCompany}</Text>
            )}
          </View>
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Work Date: {formatDate(item.workDate)}</Text>
            <Text style={styles.dateLabel}>Paid: {formatDate(item.paidDate)}</Text>
          </View>
          
          {item.notes && (
            <Text style={styles.repairNotes}>{item.notes}</Text>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteRepairMaintenance(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  if (!home) return null;
  
  const repairs = getRepairMaintenances(home.id);
  const totalSpent = repairs.reduce((sum, repair) => sum + repair.amount, 0);
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Repairs & Maintenance - {home.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {repairs.length > 0 && (
            <View style={styles.summaryBanner}>
              <Text style={styles.summaryText}>
                Total Spent: {formatCurrency(totalSpent)} ({repairs.length} repair{repairs.length > 1 ? 's' : ''})
              </Text>
            </View>
          )}
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Repair/Maintenance</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {repairs.length > 0 ? (
              <FlatList
                data={repairs.sort((a, b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime())}
                renderItem={renderRepairItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Wrench size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No repairs or maintenance recorded</Text>
                <Text style={styles.emptySubtext}>Tap "Add Repair/Maintenance" to get started</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Add Repair Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Repair/Maintenance</Text>
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
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the work performed..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setShowCategoryModal(true)}
              >
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(category) }]} />
                <Text style={styles.selectorText}>{category}</Text>
                <X size={20} color="#666666" />
              </TouchableOpacity>
              
              <Text style={styles.inputLabel}>Repairer Name</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name of person/company"
                  value={repairerName}
                  onChangeText={setRepairerName}
                />
              </View>
              
              <Text style={styles.inputLabel}>Company (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Company name"
                value={repairerCompany}
                onChangeText={setRepairerCompany}
              />
              
              <Text style={styles.inputLabel}>Work Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={workDate}
                  onChangeText={setWorkDate}
                />
              </View>
              
              <Text style={styles.inputLabel}>Date Paid</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={paidDate}
                  onChangeText={setPaidDate}
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
                <Text style={styles.submitButtonText}>Add Repair/Maintenance</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} animationType="fade" transparent={true}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerTitle}>Select Category</Text>
            {REPAIR_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.pickerItem}
                onPress={() => {
                  setCategory(cat);
                  setShowCategoryModal(false);
                }}
              >
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(cat) }]} />
                <Text style={styles.pickerItemText}>{cat}</Text>
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
  repairCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  repairHeader: {
    marginBottom: 12,
  },
  repairInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  repairCategory: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666666',
  },
  repairDescription: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  repairAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#008080',
    marginBottom: 8,
  },
  repairerInfo: {
    marginBottom: 8,
  },
  repairerName: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#333333',
  },
  repairerCompany: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
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
  repairNotes: {
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
    maxHeight: '70%',
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