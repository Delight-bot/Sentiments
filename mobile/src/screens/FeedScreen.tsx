import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;

interface Video {
  id: string;
  title: string;
  content: string;
  videoUrl: string;
  duration: number;
  viewed: boolean;
  createdAt: string;
}

const FeedScreen = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user, logout } = useAuth();
  const navigation = useNavigation<FeedScreenNavigationProp>();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/videos/feed');
      setVideos(response.data.videos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewVideo = async () => {
    setGenerating(true);
    try {
      await api.post('/videos/generate');
      await fetchVideos();
      Alert.alert('Success', 'New motivational video generated!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to generate video');
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
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
        <Text style={styles.headerTitle}>Sentiments</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.headerButtonText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Text style={styles.headerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Your Feed</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateNewVideo}
            disabled={generating}
          >
            <Text style={styles.generateButtonText}>
              {generating ? 'Generating...' : 'Generate'}
            </Text>
          </TouchableOpacity>
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No videos yet. Generate your first motivational video!
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={generateNewVideo}
              disabled={generating}
            >
              <Text style={styles.primaryButtonText}>
                {generating ? 'Generating...' : 'Generate Video'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={videos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.videoCard}>
                <View style={styles.videoHeader}>
                  <Text style={styles.videoTitle}>{item.title}</Text>
                  {item.viewed && (
                    <View style={styles.viewedBadge}>
                      <Text style={styles.viewedBadgeText}>Viewed</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.videoContent}>{item.content}</Text>
                <View style={styles.videoFooter}>
                  <Text style={styles.videoDuration}>{item.duration}s</Text>
                  <Text style={styles.videoDate}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            )}
          />
        )}
      </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  viewedBadge: {
    backgroundColor: '#4ade80',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  viewedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoContent: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  videoDuration: {
    fontSize: 14,
    color: '#999',
  },
  videoDate: {
    fontSize: 14,
    color: '#999',
  },
});

export default FeedScreen;
