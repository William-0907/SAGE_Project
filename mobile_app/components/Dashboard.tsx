import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/config/api';
import { useAuth } from '../hooks/useAuth';

// --- Interfaces (Unchanged) ---
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  streak: number;
  total_points: number;
}

interface Badge {
  id: number;
  icon: string;
  name: string;
}

interface Recommendation {
  id: number;
  title: string;
  description: string;
}

interface Session {
  id: number;
  title: string;
  description: string;
  participants: number;
}

interface Activity {
  id: number;
  title: string;
  description: string;
  activity_type: string;
}

export default function Dashboard() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  // --- Data Fetching (Unchanged) ---
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const userResponse = await fetch(`${API_BASE_URL}/users/me/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`Failed to fetch user: ${userResponse.status} - ${errorText}`);
      }
      const userData = await userResponse.json();
      setUser(userData);

      const badgesResponse = await fetch(`${API_BASE_URL}/users/me/badges/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (badgesResponse.ok) setBadges(await badgesResponse.json());

      const recsResponse = await fetch(`${API_BASE_URL}/users/me/recommendations/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (recsResponse.ok) setRecommendations(await recsResponse.json());

      const sessionsResponse = await fetch(`${API_BASE_URL}/users/me/sessions/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (sessionsResponse.ok) setSessions(await sessionsResponse.json());

      const activitiesResponse = await fetch(`${API_BASE_URL}/users/me/activities/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (activitiesResponse.ok) setActivities(await activitiesResponse.json());

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.log('Error fetching data:', errorMessage);
      console.log('API_BASE_URL:', API_BASE_URL);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const getToken = async (): Promise<string | null> => {
    const { getToken: authServiceGetToken } = require('../services/authService');
    return await authServiceGetToken();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={{ marginTop: 10, color: '#EF4444', fontSize: 16, textAlign: 'center' }}>
          {error}
        </Text>
        <Text style={{ marginTop: 20, color: '#666', textAlign: 'center' }}>
          Make sure the Django server is running and ngrok is forwarding traffic
        </Text>
      </View>
    );
  }

  // --- Original Layout with New Color Scheme ---
  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back,</Text>
          <Text style={styles.name}>{user?.username}</Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="star-outline" size={24} color="white" />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          {/* Changed icon color to match reference */}
          <Ionicons name="flame-outline" size={22} color="#F97316" />
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{user?.streak || 0}</Text>
        </View>

        <View style={styles.statCard}>
          {/* Changed icon color to match reference */}
          <Ionicons name="trophy-outline" size={22} color="#FBBF24" />
          <Text style={styles.statLabel}>Points</Text>
          <Text style={styles.statValue}>{user?.total_points || 0}</Text>
        </View>

        <View style={styles.statCard}>
          {/* Changed icon color to match reference */}
          <Ionicons name="trending-up-outline" size={22} color="#3B82F6" />
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={styles.statValue}>88%</Text>
        </View>
      </View>

      {/* AI Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          {/* Changed icon color */}
          <Ionicons name="sparkles-outline" size={18} color="#6366F1" />
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
        </View>

        {recommendations.length > 0 ? (
          recommendations.slice(0, 2).map((rec) => (
            <View key={rec.id} style={styles.card}>
              <Text style={styles.cardTitle}>{rec.title}</Text>
              <Text style={styles.cardDescription}>{rec.description}</Text>
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No recommendations yet</Text>
            <Text style={styles.cardDescription}>Come back soon for personalized AI recommendations</Text>
          </View>
        )}
      </View>

      {/* Sessions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people-outline" size={18} color="#6366F1" />
          <Text style={styles.sectionTitle}>Group Sessions</Text>
        </View>

        {sessions.length > 0 ? (
          sessions.slice(0, 2).map((session) => (
            <View key={session.id} style={styles.card}>
              <Text style={styles.cardTitle}>{session.title}</Text>
              <Text style={styles.cardDescription}>{session.participants} participants</Text>
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No sessions yet</Text>
            <Text style={styles.cardDescription}>Create or join a group session</Text>
          </View>
        )}
      </View>

      {/* Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={18} color="#6366F1" />
          <Text style={styles.sectionTitle}>Recent Activities</Text>
        </View>

        {activities.length > 0 ? (
          activities.slice(0, 2).map((activity) => (
            <View key={activity.id} style={styles.card}>
              <Text style={styles.cardTitle}>{activity.title}</Text>
              <Text style={styles.cardDescription}>{activity.description}</Text>
            </View>
          ))
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No activities yet</Text>
            <Text style={styles.cardDescription}>Your activities will appear here</Text>
          </View>
        )}
      </View>

      {/* Badges */}
      {badges.length > 0 && (
        <View>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="ribbon-outline" size={18} color="#6366F1" />
              <Text style={styles.sectionTitle}>Badges</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={styles.badgeLabel}>{badge.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

    </ScrollView>
  );
}

// --- Updated Stylesheet to match ProfileScreen Colors ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Gray-50 from reference
  },

  header: {
    backgroundColor: '#6366F1', // Indigo-500 from reference (was #7C3AED)
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    color: 'rgba(255,255,255,0.8)', // Softer white from reference
    fontSize: 14,
  },

  name: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },

  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)', // Same as reference
    padding: 10,
    borderRadius: 50,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
  },

  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    // Removed elevation, added border to match reference
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },

  statLabel: {
    fontSize: 12,
    color: '#9CA3AF', // Gray-400 from reference
    marginTop: 5,
  },

  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // Gray-800 from reference (was #7C3AED)
    marginTop: 2,
  },

  section: {
    padding: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937', // Gray-800 from reference
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    // Removed elevation, added border to match reference
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937', // Gray-800 from reference
  },

  cardDescription: {
    fontSize: 12,
    color: '#9CA3AF', // Gray-400 from reference
    marginTop: 4,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  badgeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    // Added border to match reference
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },

  badgeIcon: {
    fontSize: 28,
  },

  badgeLabel: {
    fontSize: 10,
    color: '#9CA3AF', // Gray-400 from reference
    marginTop: 5,
  },
});