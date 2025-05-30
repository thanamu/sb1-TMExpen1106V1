import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function Onboarding() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [suburb, setSuburb] = useState('');
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const goBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };
  
  const handleContinue = () => {
    if (step === 1) {
      if (!firstName || !lastName) {
        setError('Please fill in all fields');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      setError('');
      setStep(3);
    }
  };
  
  const handleRegister = async () => {
    if (!suburb || !postcode) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setError('');
      const userData = {
        firstName,
        lastName,
        email,
        suburb,
        postcode
      };
      
      const success = await register(email, password, userData);
      
      if (success) {
        router.replace('/(tabs)');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };
  
  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Step {step} of 3</Text>
        </View>
        
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, step >= 1 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 2 && styles.activeStepDot]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step >= 3 && styles.activeStepDot]} />
        </View>
        
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999999"
              value={firstName}
              onChangeText={setFirstName}
            />
            
            <TextInput 
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#999999"
              value={lastName}
              onChangeText={setLastName}
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Account Credentials</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput 
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput 
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {step === 3 && (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            
            <TextInput 
              style={styles.input}
              placeholder="Suburb"
              placeholderTextColor="#999999"
              value={suburb}
              onChangeText={setSuburb}
            />
            
            <TextInput 
              style={styles.input}
              placeholder="Postcode"
              placeholderTextColor="#999999"
              value={postcode}
              onChangeText={setPostcode}
              keyboardType="numeric"
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
            
            <Text style={styles.privacyText}>
              By signing up, you agree to our Terms of Service and Privacy Policy.
              Your data is securely stored on your device in accordance with GDPR 
              and local privacy laws.
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 28,
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666666',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  activeStepDot: {
    backgroundColor: '#008080',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  form: {
    width: '100%',
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 18,
    color: '#333333',
    marginBottom: 16,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#E53935',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  registerButton: {
    backgroundColor: '#008080',
    borderRadius: 8,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  privacyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});