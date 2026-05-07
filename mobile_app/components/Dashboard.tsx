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

interface User {
  id: number;
  name: string;
  email: string;
  streak_count: number;
  total_achievements: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const USER_ID = 1; // Testing with user ID 1

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user profile
      const userResponse = await fetch(`${API_BASE_URL}/users/${USER_ID}/`);
      console.log('User response status:', userResponse.status);
      console.log('User response:', userResponse);
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        throw new Error(`Failed to fetch user: ${userResponse.status} - ${errorText}`);
      }
      const userData = await userResponse.json();
      setUser(userData);

      // Fetch badges
      const badgesResponse = await fetch(`${API_BASE_URL}/users/${USER_ID}/badges/`);
      if (badgesResponse.ok) {
        const badgesData = await badgesResponse.json();
        setBadges(badgesData);
      }

      // Fetch recommendations
      const recsResponse = await fetch(`${API_BASE_URL}/users/${USER_ID}/recommendations/`);
      if (recsResponse.ok) {
        const recsData = await recsResponse.json();
        setRecommendations(recsData);
      }

      // Fetch sessions
      const sessionsResponse = await fetch(`${API_BASE_URL}/users/${USER_ID}/sessions/`);
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      // Fetch activities
      const activitiesResponse = await fetch(`${API_BASE_URL}/users/${USER_ID}/activities/`);
      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData);
      }

      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      console.log('Error fetching data:', errorMessage);
      console.log('API_BASE_URL:', API_BASE_URL);
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#7C3AED" />
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

  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back,</Text>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="star-outline" size={24} color="white" />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={22} color="orange" />
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{user?.streak_count || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={22} color="gold" />
          <Text style={styles.statLabel}>Achievements</Text>
          <Text style={styles.statValue}>{user?.total_achievements || 0}</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={22} color="green" />
          <Text style={styles.statLabel}>Progress</Text>
          <Text style={styles.statValue}>88%</Text>
        </View>
      </View>

      {/* AI Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
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
          <Ionicons name="people-outline" size={18} color="#7C3AED" />
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
          <Ionicons name="history-outline" size={18} color="#7C3AED" />
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
              <Ionicons name="ribbon-outline" size={18} color="#7C3AED" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    backgroundColor: '#7C3AED',
    padding: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    color: '#E9D5FF',
    fontSize: 14,
  },

  name: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },

  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    elevation: 3,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },

  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
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
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    padding: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },

  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
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
    elevation: 2,
    alignItems: 'center',
  },

  badgeIcon: {
    fontSize: 28,
  },

  badgeLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 5,
  },
});