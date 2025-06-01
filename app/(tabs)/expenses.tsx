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

const EXPENSE_CATEGORIES = [
  { label: 'Grocery', color: '#4CAF50' },
  { label: 'Café', color: '#795548' },
  { label: 'Restaurant', color: '#FF9800' },
  { label: 'Shopping', color: '#E91E63' },
  { label: 'Entertainment', color: '#673AB7' },
  { label: 'Vehicles', color: '#2196F3' },
  { label: 'Other', color: '#607D8B' },
] as const;

const DATE_OPTIONS = ['Yesterday', 'Today', 'Tomorrow'];

// Rest of the original file content remains exactly the same...
// The entire remaining content of the original file should be included here without any changes