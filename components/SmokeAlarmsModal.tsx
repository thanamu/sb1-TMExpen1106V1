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
import { useHome, Home, SmokeAlarm } from '@/context/HomeContext';
import { TriangleAlert as AlertTriangle, Plus, X, Calendar as CalendarIcon, MapPin } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SmokeAlarmsModalProps {
  visible: boolean;
  home: Home | null;
  onClose: () => void;
}

export const SmokeAlarmsModal: React.FC<SmokeAlarmsModalProps> = ({ visible, home, onClose }) => {
  const { getSmokeAlarms, addSmokeAlarm, deleteSmokeAlarm } = useHome();
  
  // Form state
  const [isAdding, setIsAdding] = useState(false);
  const [location, setLocation] = useState('');
  const [batteryReplacementDate, setBatteryReplacementDate] = useState('');
  const [nextReplacementDue, setNextReplacementDue] = useState('');
  const [notes, setNotes] = useState('');
  
  const resetForm = () => {
    setLocation('');
    setBatteryReplacementDate('');
    setNextReplacementDue('');
    setNotes('');
  };
  
  const handleAdd = async () => {
    if (!home || !location || !batteryReplacementDate || !nextReplacementDue) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await addSmokeAlarm({
      homeId: home.id,
      location: location.trim(),
      batteryReplacementDate,
      nextReplacementDue,
      notes: notes.trim() || undefined,
    });
    
    setIsAdding(false);
    resetForm();
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };
  
  const renderAlarmItem = ({ item }: { item: SmokeAlarm }) => (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.alarmCard}>
      <View style={styles.alarmHeader}>
        <View style={styles.alarmInfo}>
          <View style={styles.locationRow}>
            <MapPin size={16} color="#666666" />
            <Text style={styles.alarmLocation}>{item.location}</Text>
          </View>
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Last Replaced:</Text>
            <Text style={styles.dateValue}>{formatDate(item.batteryReplacementDate)}</Text>
          </View>
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>Next Due:</Text>
            <Text style={[
              styles.dateValue,
              isOverdue(item.nextReplacementDue) && styles.overdueDate
            ]}>
              {formatDate(item.nextReplacementDue)}
              {isOverdue(item.nextReplacementDue) && ' (OVERDUE)'}
            </Text>
          </View>
          
          {item.notes && (
            <Text style={styles.alarmNotes}>{item.notes}</Text>
          )}
        </View>
        
        {isOverdue(item.nextReplacementDue) && (
          <View style={styles.overdueIndicator}>
            <AlertTriangle size={20} color="#E53935" />
          </View>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteSmokeAlarm(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </Animated.View>
  );
  
  if (!home) return null;
  
  const alarms = getSmokeAlarms(home.id);
  const overdueAlarms = alarms.filter(alarm => isOverdue(alarm.nextReplacementDue));
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Smoke Alarms - {home.name}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          {overdueAlarms.length > 0 && (
            <View style={styles.alertBanner}>
              <AlertTriangle size={20} color="#E53935" />
              <Text style={styles.alertText}>
                {overdueAlarms.length} alarm{overdueAlarms.length > 1 ? 's' : ''} overdue for battery replacement
              </Text>
            </View>
          )}
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Smoke Alarm</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            {alarms.length > 0 ? (
              <FlatList
                data={alarms}
                renderItem={renderAlarmItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <AlertTriangle size={48} color="#CCCCCC" />
                <Text style={styles.emptyText}>No smoke alarms added</Text>
                <Text style={styles.emptySubtext}>Tap "Add Smoke Alarm" to get started</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      
      {/* Add Smoke Alarm Modal */}
      <Modal visible={isAdding} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Smoke Alarm</Text>
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
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Master Bedroom, Kitchen, Hallway"
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              
              <Text style={styles.inputLabel}>Last Battery Replacement Date</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={batteryReplacementDate}
                  onChangeText={setBatteryReplacementDate}
                />
              </View>
              
              <Text style={styles.inputLabel}>Next Replacement Due</Text>
              <View style={styles.inputContainer}>
                <CalendarIcon size={20} color="#666666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={nextReplacementDue}
                  onChangeText={setNextReplacementDue}
                />
              </View>
              
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Additional notes about this smoke alarm..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
              
              <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                <Text style={styles.submitButtonText}>Add Smoke Alarm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
  },
  alertText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#E53935',
    marginLeft: 8,
    flex: 1,
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
  alarmCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alarmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alarmInfo: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alarmLocation: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  overdueDate: {
    color: '#E53935',
    fontFamily: 'Inter-Bold',
  },
  alarmNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  overdueIndicator: {
    alignSelf: 'flex-start',
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
});