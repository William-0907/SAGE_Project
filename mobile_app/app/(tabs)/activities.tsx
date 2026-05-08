import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Lesson {
  id: number;
  title: string;
  subject: string;
  duration: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
  points: number;
  color: string;
}

interface Quiz {
  id: number;
  title: string;
  subject: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: string;
  bestScore: number | null;
  attempts: number;
  participants: number;
}

interface GroupTask {
  id: number;
  title: string;
  members: number;
  dueDate: string;
  progress: number;
  status: 'active' | 'pending';
}

export default function ActivitiesScreen() {
  const [selectedTab, setSelectedTab] = useState('lessons');

  const lessons: Lesson[] = [
    {
      id: 1,
      title: 'Introduction to Calculus',
      subject: 'Mathematics',
      duration: '45 min',
      progress: 100,
      status: 'completed',
      points: 250,
      color: '#3B82F6', // Blue
    },
    {
      id: 2,
      title: "Newton's Laws of Motion",
      subject: 'Physics',
      duration: '30 min',
      progress: 60,
      status: 'in-progress',
      points: 200,
      color: '#10B981', // Green
    },
    {
      id: 3,
      title: 'World War II Timeline',
      subject: 'History',
      duration: '50 min',
      progress: 0,
      status: 'not-started',
      points: 300,
      color: '#F97316', // Orange
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: 1,
      title: 'Calculus Integration Quiz',
      subject: 'Mathematics',
      questions: 20,
      difficulty: 'Hard',
      timeLimit: '30 min',
      bestScore: 85,
      attempts: 2,
      participants: 156,
    },
    {
      id: 2,
      title: 'Physics Fundamentals',
      subject: 'Physics',
      questions: 15,
      difficulty: 'Medium',
      timeLimit: '20 min',
      bestScore: 92,
      attempts: 1,
      participants: 203,
    },
    {
      id: 3,
      title: 'Historical Events Quiz',
      subject: 'History',
      questions: 25,
      difficulty: 'Easy',
      timeLimit: '25 min',
      bestScore: null,
      attempts: 0,
      participants: 89,
    },
  ];

  const groupTasks: GroupTask[] = [
    {
      id: 1,
      title: 'Math Study Group - Integration',
      members: 8,
      dueDate: 'Today, 3:00 PM',
      progress: 75,
      status: 'active',
    },
    {
      id: 2,
      title: 'Physics Lab Report',
      members: 4,
      dueDate: 'Tomorrow',
      progress: 40,
      status: 'active',
    },
    {
      id: 3,
      title: 'History Presentation Prep',
      members: 6,
      dueDate: 'Jan 26',
      progress: 20,
      status: 'pending',
    },
  ];

  return (
    <View style={styles.container}>
      
      {/* 🌟 FIGMA DESIGN: Purple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activities</Text>
        <Text style={styles.headerSubtitle}>Lessons, quizzes, and group tasks</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lessons' && styles.tabActive]}
          onPress={() => setSelectedTab('lessons')}
        >
          <Text style={[styles.tabText, selectedTab === 'lessons' && styles.tabTextActive]}>
            Lessons
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'quizzes' && styles.tabActive]}
          onPress={() => setSelectedTab('quizzes')}
        >
          <Text style={[styles.tabText, selectedTab === 'quizzes' && styles.tabTextActive]}>
            Quizzes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'groups' && styles.tabActive]}
          onPress={() => setSelectedTab('groups')}
        >
          <Text style={[styles.tabText, selectedTab === 'groups' && styles.tabTextActive]}>
            Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* LESSONS TAB */}
        {selectedTab === 'lessons' && (
          <View style={styles.itemsList}>
            {lessons.map((lesson) => (
              <View key={lesson.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.subjectBadge}>
                      <View style={[styles.colorDot, { backgroundColor: lesson.color }]} />
                      <Text style={styles.subjectText}>{lesson.subject}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{lesson.title}</Text>
                    
                    <View style={styles.metaInfo}>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{lesson.duration}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="trophy-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{lesson.points} pts</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.statusIcon}>
                    {lesson.status === 'completed' && <Ionicons name="checkmark-circle" size={28} color="#10B981" />}
                    {lesson.status === 'in-progress' && <Ionicons name="play-circle" size={28} color="#6D28D9" />}
                    {lesson.status === 'not-started' && <Ionicons name="book-outline" size={28} color="#D1D5DB" />}
                  </View>
                </View>

                {lesson.progress > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>Progress</Text>
                      <Text style={styles.progressPercent}>{lesson.progress}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${lesson.progress}%`, backgroundColor: '#6D28D9' }]} />
                    </View>
                  </View>
                )}

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {lesson.status === 'completed' ? 'Review Lesson' : lesson.status === 'in-progress' ? 'Continue Learning' : 'Start Lesson'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* QUIZZES TAB */}
        {selectedTab === 'quizzes' && (
          <View style={styles.itemsList}>
            {quizzes.map((quiz) => (
              <View key={quiz.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.badgesRow}>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgePillText}>{quiz.subject}</Text>
                      </View>
                      <View style={[
                        styles.badgePill, 
                        { borderColor: quiz.difficulty === 'Hard' ? '#EF4444' : quiz.difficulty === 'Medium' ? '#F59E0B' : '#10B981' }
                      ]}>
                        <Text style={[
                          styles.badgePillText, 
                          { color: quiz.difficulty === 'Hard' ? '#EF4444' : quiz.difficulty === 'Medium' ? '#F59E0B' : '#10B981' }
                        ]}>
                          {quiz.difficulty}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.cardTitle}>{quiz.title}</Text>
                    
                    <View style={styles.metaInfo}>
                      <View style={styles.metaItem}>
                        <Ionicons name="help-circle-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{quiz.questions} Qs</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{quiz.timeLimit}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{quiz.participants}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {quiz.bestScore !== null && (
                  <View style={styles.scoreBox}>
                    <View style={styles.scoreContent}>
                      <Ionicons name="star" size={24} color="#F59E0B" />
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.scoreLabel}>Best Score</Text>
                        <Text style={styles.scoreAttempts}>{quiz.attempts} attempts</Text>
                      </View>
                    </View>
                    <Text style={styles.scoreValue}>{quiz.bestScore}%</Text>
                  </View>
                )}

                <TouchableOpacity style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {quiz.bestScore !== null ? 'Retake Quiz' : 'Start Quiz'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* GROUPS TAB */}
        {selectedTab === 'groups' && (
          <View style={styles.itemsList}>
            {groupTasks.map((task) => (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{task.title}</Text>
                    
                    <View style={styles.metaInfo}>
                      <View style={styles.metaItem}>
                        <Ionicons name="people-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{task.members} members</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text style={styles.metaText}>{task.dueDate}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusBadgeText, { color: task.status === 'active' ? '#10B981' : '#6B7280' }]}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Group Progress</Text>
                    <Text style={styles.progressPercent}>{task.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${task.progress}%`, backgroundColor: '#6D28D9' }]} />
                  </View>
                </View>

                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>View Group</Text>
                  <Ionicons name="chevron-forward" size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // 🌟 FIGMA DESIGN Header Styles
  header: {
    backgroundColor: '#6D28D9',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#DDD6FE' },
  
  // Tabs
  tabsContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6D28D9' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#6D28D9', fontWeight: '700' },
  
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  itemsList: { paddingBottom: 20 },
  
  // 🌟 FIGMA DESIGN Soft Shadow Cards
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#111',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  subjectBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  subjectText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  
  metaInfo: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  statusIcon: { justifyContent: 'center', paddingLeft: 12 },
  
  // Progress Bars
  progressSection: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  progressPercent: { fontSize: 13, color: '#111827', fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  
  // Buttons
  primaryButton: { backgroundColor: '#6D28D9', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  secondaryButtonText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },
  
  // Badges & Scores
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badgePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: 'white' },
  badgePillText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  scoreBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFFBEB', borderRadius: 12, marginBottom: 16 },
  scoreContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  scoreLabel: { fontSize: 13, color: '#111827', fontWeight: '600' },
  scoreAttempts: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scoreValue: { fontSize: 24, fontWeight: '700', color: '#111827' },
  
  statusBadge: { borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, height: 26, justifyContent: 'center' },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
});