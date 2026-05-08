import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  fetchUserProfile,
  fetchUserBadges,
  fetchUserActivities,
  getDisplayName,
  UserProfile,
  UserBadge,
  UserActivity,
} from '@/services/userProfileService';

interface ProfileStats {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [selectedSection, setSelectedSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  const colors = Colors[(colorScheme ?? 'light') as keyof typeof Colors];

  // Fetch user profile data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUserProfile(profile);
      
      // Fetch badges and activities in parallel
      const [badgesData, activitiesData] = await Promise.all([
        fetchUserBadges(profile.id),
        fetchUserActivities(profile.id),
      ]);
      
      setBadges(badgesData);
      setActivities(activitiesData.slice(0, 3)); // Get last 3 activities
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const profileStats: ProfileStats[] = [
    { label: 'Streak', value: userProfile?.streak || 0, icon: 'flame', color: '#F97316' },
    { label: 'Total Points', value: userProfile?.total_points || 0, icon: 'star', color: '#FBBF24' },
    { label: 'Lessons', value: userProfile?.courses_completed || 0, icon: 'book', color: '#3B82F6' },
    { label: 'Quizzes', value: userProfile?.quizzes_taken || 0, icon: 'help-circle', color: '#10B981' },
  ];

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'achievements', label: 'Achievements', icon: 'trophy' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
        <View style={styles.profileImageBox}>
          <Text style={styles.profileInitials}>
            {getDisplayName(userProfile || { username: 'U', first_name: '', last_name: '' }).substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{getDisplayName(userProfile || { username: 'User', first_name: '', last_name: '' })}</Text>
          <Text style={styles.profileEmail}>{userProfile?.email || 'user@example.com'}</Text>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Menu Tabs */}
      <View style={[styles.menuTabs, { backgroundColor: colors.surface }]}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuTab,
              selectedSection === item.id && styles.menuTabActive,
            ]}
            onPress={() => setSelectedSection(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={selectedSection === item.id ? '#6366F1' : '#999'}
            />
            <Text
              style={[
                styles.menuTabText,
                selectedSection === item.id && { color: '#6366F1', fontWeight: '600' },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview */}
        {selectedSection === 'overview' && (
          <View style={styles.section}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              {profileStats.map((stat) => (
                <View
                  key={stat.label}
                  style={[styles.statCard, { backgroundColor: colors.surface }]}
                >
                  <View
                    style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}
                  >
                    <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {stat.value}
                  </Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recent Activity
                </Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.activityItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    Completed Calculus Lesson
                  </Text>
                  <Text style={styles.activityTime}>Today at 2:30 PM</Text>
                </View>
                <Text style={styles.activityPoints}>+250 pts</Text>
              </View>

              <View
                style={[
                  styles.activityItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name="star" size={20} color="#FBBF24" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    Earned 12-Day Streak
                  </Text>
                  <Text style={styles.activityTime}>Yesterday</Text>
                </View>
                <Text style={styles.activityBadge}>New!</Text>
              </View>

              <View
                style={[
                  styles.activityItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.activityIcon}>
                  <Ionicons name="school" size={20} color="#3B82F6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    Joined Study Group
                  </Text>
                  <Text style={styles.activityTime}>2 days ago</Text>
                </View>
                <Text style={styles.activityPoints}>+50 pts</Text>
              </View>
            </View>

            {/* Goals */}
            <View style={styles.goalsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Current Goals
              </Text>

              <View
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>
                    Study 30 Days Straight
                  </Text>
                  <Text style={styles.goalProgress}>12/30</Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: '40%' }]} />
                </View>
              </View>

              <View
                style={[
                  styles.goalCard,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.goalHeader}>
                  <Text style={[styles.goalTitle, { color: colors.text }]}>
                    Complete 50 Lessons
                  </Text>
                  <Text style={styles.goalProgress}>24/50</Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: '48%' }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Achievements */}
        {selectedSection === 'achievements' && (
          <View style={styles.section}>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    {
                      backgroundColor: colors.surface,
                      opacity: achievement.unlocked ? 1 : 0.6,
                    },
                  ]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text
                    style={[
                      styles.achievementName,
                      { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {achievement.name}
                  </Text>
                  <Text
                    style={styles.achievementDescription}
                    numberOfLines={2}
                  >
                    {achievement.description}
                  </Text>
                  {!achievement.unlocked && (
                    <View style={styles.lockBadge}>
                      <Ionicons name="lock-closed" size={12} color="white" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        {selectedSection === 'settings' && (
          <View style={styles.section}>
            <View style={styles.settingsSection}>
              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons name="notifications" size={20} color="#6366F1" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Notifications
                    </Text>
                    <Text style={styles.settingDescription}>
                      Manage notification preferences
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons name="moon" size={20} color="#6366F1" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Theme
                    </Text>
                    <Text style={styles.settingDescription}>
                      Light, dark, or auto
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons name="lock-closed" size={20} color="#6366F1" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Privacy & Security
                    </Text>
                    <Text style={styles.settingDescription}>
                      Manage account security
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons name="help-circle" size={20} color="#6366F1" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                      Help & Support
                    </Text>
                    <Text style={styles.settingDescription}>
                      Get help or report issues
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.settingItem,
                  styles.dangerItem,
                  { backgroundColor: '#FEE2E2', borderColor: '#FECACA' },
                ]}
              >
                <View style={styles.settingContent}>
                  <Ionicons name="log-out" size={20} color="#EF4444" />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: '#EF4444' }]}>
                      Logout
                    </Text>
                    <Text style={styles.settingDescription}>
                      Sign out of your account
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  profileImageBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  menuTabActive: {},
  menuTabText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  activitySection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99,102,241,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  activityPoints: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  activityBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6366F1',
  },
  goalsSection: {
    marginBottom: 16,
  },
  goalCard: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalProgress: {
    fontSize: 12,
    color: '#999',
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '31%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
    gap: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 11,
    color: '#999',
  },
  dangerItem: {},
});
