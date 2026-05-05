import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const placeholderData = {
    name: 'Jomar Melendrez',

    badges: [
      { id: 1, icon: '🏅' },
      { id: 2, icon: '🏆' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back,</Text>
          <Text style={styles.name}>{placeholderData.name}</Text>
        </View>

        <View style={styles.iconCircle}>
          <Ionicons name="star-outline" size={24} color="white" />
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={22} color="orange" />
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={22} color="gold" />
        </View>

        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={22} color="green" />
        </View>
      </View>

      {/* AI Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles-outline" size={18} color="#7C3AED" />
          <Text style={styles.sectionTitle}>AI Recommendations</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.recommendation}>Hello</Text>
        </View>
        <View style={styles.card} />
      </View>

      {/* Sessions */}
      <View style={styles.section}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>

      {/* Activities */}
      <View style={styles.section}>
        <View style={styles.card} />
        <View style={styles.card} />
      </View>

      {/* Badges */}
      <View style={styles.badgeRow}>
        {placeholderData.badges.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{badge.icon}</Text>
          </View>
        ))}
      </View>

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
  recommendation: {
    alignItems: 'center'
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
  },

  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
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
    height: 60,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },

  badgeCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  badgeIcon: {
    fontSize: 22,
  },
});