import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [name, setName] = useState('');
  const [wake, setWake] = useState('08:00');
  const [lunch, setLunch] = useState('12:00');
  const [bed, setBed] = useState('21:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const profile = response.data.user;
      setName(profile.name || '');
      if (profile.notificationTimes) {
        setWake(profile.notificationTimes.wake || '08:00');
        setLunch(profile.notificationTimes.lunch || '12:00');
        setBed(profile.notificationTimes.bed || '21:00');
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', { name });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await api.put('/users/notification-times', { wake, lunch, bed });
      Alert.alert('Success', 'Notification times updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update notification times');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ''}
              editable={false}
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Schedule</Text>
          <Text style={styles.sectionDescription}>
            Choose when you want to receive your daily motivational videos
          </Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Morning (Wake Up)</Text>
            <TextInput
              style={styles.input}
              value={wake}
              onChangeText={setWake}
              placeholder="08:00"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Afternoon (Lunch)</Text>
            <TextInput
              style={styles.input}
              value={lunch}
              onChangeText={setLunch}
              placeholder="12:00"
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Evening (Before Bed)</Text>
            <TextInput
              style={styles.input}
              value={bed}
              onChangeText={setBed}
              placeholder="21:00"
            />
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSaveNotifications}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save Notification Times'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  button: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
