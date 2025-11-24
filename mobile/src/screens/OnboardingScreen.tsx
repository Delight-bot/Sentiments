import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [recording, setRecording] = useState(false);

  const handleSkip = () => {
    navigation.navigate('Feed');
  };

  const handleContinue = () => {
    Alert.alert('Coming Soon', 'Voice recording feature will be implemented soon');
    navigation.navigate('Feed');
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tell Us Your Story</Text>
        <Text style={styles.subtitle}>
          Record a short message about yourself, your goals, and what motivates you.
          This helps us create personalized content just for you.
        </Text>

        <View style={styles.recordButton}>
          <Text style={styles.recordButtonText}>Voice Recording Coming Soon</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 48,
  },
  recordButton: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  recordButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#fff',
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#fff',
  },
  continueButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen;
