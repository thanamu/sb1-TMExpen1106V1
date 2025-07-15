import { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, autoLogin } = useAuth();
  
  useEffect(() => {
    // Attempt auto-login when the app starts
    const attemptAutoLogin = async () => {
      if (!isAuthenticated && !isLoading) {
        await autoLogin();
      }
    };
    
    attemptAutoLogin();
  }, [isLoading]);

  useEffect(() => {
    // If already authenticated, redirect to main app
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLoginPress = () => {
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(1000)} style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/5483071/pexels-photo-5483071.jpeg' }} 
          style={styles.logoBackground}
        />
        <View style={styles.overlay} />
        <Text style={styles.appName}>Expense Diary</Text>
        <Text style={styles.tagline}>Track expenses & activities seamlessly</Text>
      </Animated.View>
      
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLoginPress}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        
        <Text style={styles.privacyText}>
          Your data is securely stored on your device.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loginButton: {
    backgroundColor: '#008080',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginBottom: 24,
    width: '80%',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  privacyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});