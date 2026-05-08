import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/authService';

// Interfaces
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

interface StudyGroup {
  id: number;
  name: string;
  description: string;
  members_count: number;
  join_code: string;
}

export default function ActivitiesScreen() {
  const [selectedTab, setSelectedTab] = useState('groups'); // Defaulting to groups so you can see it!
  
  // Real API State
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  // Form States
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- API CALLS ---
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/users/groups/mine/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (error) {
      console.error("Error fetching groups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return Alert.alert("Error", "Group name is required");
    
    try {
      setIsSubmitting(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/users/groups/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc })
      });
      
      if (res.ok) {
        setNewGroupName('');
        setNewGroupDesc('');
        setIsCreateModalOpen(false);
        fetchGroups(); // Refresh the list!
      } else {
        Alert.alert("Error", "Could not create group");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!joinCodeInput.trim()) return Alert.alert("Error", "Join code is required");

    try {
      setIsSubmitting(true);
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/users/groups/join/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ join_code: joinCodeInput.toUpperCase() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setJoinCodeInput('');
        setIsJoinModalOpen(false);
        fetchGroups(); // Refresh the list!
      } else {
        Alert.alert("Error", data.error || "Could not join group");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Static Fallback Data for Lessons/Quizzes
  const lessons: Lesson[] = [
    { id: 1, title: 'Introduction to Calculus', subject: 'Mathematics', duration: '45 min', progress: 100, status: 'completed', points: 250, color: '#3B82F6' },
    { id: 2, title: "Newton's Laws of Motion", subject: 'Physics', duration: '30 min', progress: 60, status: 'in-progress', points: 200, color: '#10B981' },
  ];

  const quizzes: Quiz[] = [
    { id: 1, title: 'Calculus Integration Quiz', subject: 'Mathematics', questions: 20, difficulty: 'Hard', timeLimit: '30 min', bestScore: 85, attempts: 2, participants: 156 },
  ];

  return (
    <View style={styles.container}>
      
      {/* Premium Purple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activities</Text>
        <Text style={styles.headerSubtitle}>Lessons, quizzes, and group tasks</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity style={[styles.tab, selectedTab === 'lessons' && styles.tabActive]} onPress={() => setSelectedTab('lessons')}>
          <Text style={[styles.tabText, selectedTab === 'lessons' && styles.tabTextActive]}>Lessons</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'quizzes' && styles.tabActive]} onPress={() => setSelectedTab('quizzes')}>
          <Text style={[styles.tabText, selectedTab === 'quizzes' && styles.tabTextActive]}>Quizzes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedTab === 'groups' && styles.tabActive]} onPress={() => setSelectedTab('groups')}>
          <Text style={[styles.tabText, selectedTab === 'groups' && styles.tabTextActive]}>Groups</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {selectedTab === 'lessons' && (
          <View style={styles.itemsList}>
            {lessons.map((lesson) => (
              <View key={lesson.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{lesson.title}</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={28} color="#10B981" />
                </View>
              </View>
            ))}
          </View>
        )}

        {selectedTab === 'quizzes' && (
           <View style={styles.itemsList}>
             {quizzes.map((quiz) => (
               <View key={quiz.id} style={styles.card}>
                 <Text style={styles.cardTitle}>{quiz.title}</Text>
               </View>
             ))}
           </View>
        )}

        {/* 🌟 REAL API: GROUPS TAB */}
        {selectedTab === 'groups' && (
          <View style={styles.itemsList}>
            
            {/* Group Action Buttons */}
            <View style={styles.groupActionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setIsCreateModalOpen(true)}>
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Create Group</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#10B981' }]} onPress={() => setIsJoinModalOpen(true)}>
                <Ionicons name="enter" size={20} color="white" />
                <Text style={styles.actionButtonText}>Join Group</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#6D28D9" style={{ marginTop: 40 }} />
            ) : groups.length > 0 ? (
              groups.map((group) => (
                <View key={group.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{group.name}</Text>
                      <Text style={styles.metaText}>{group.description}</Text>
                      
                      <View style={styles.metaInfo}>
                        <View style={styles.metaItem}>
                          <Ionicons name="people-outline" size={14} color="#6B7280" />
                          <Text style={styles.metaText}>{group.members_count} members</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="key-outline" size={14} color="#6D28D9" />
                          <Text style={[styles.metaText, { color: '#6D28D9', fontWeight: 'bold' }]}>Code: {group.join_code}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Enter Chat Room</Text>
                    <Ionicons name="chatbubbles" size={18} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="people" size={48} color="#D1D5DB" />
                <Text style={{ color: '#6B7280', marginTop: 10 }}>You haven't joined any groups yet.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* --- CREATE GROUP MODAL --- */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create a Study Group</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Group Name (e.g., AP Physics)"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Description (Optional)"
              multiline
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
            />

            <TouchableOpacity 
              style={[styles.primaryButton, { marginTop: 10, opacity: isSubmitting ? 0.7 : 1 }]} 
              onPress={handleCreateGroup}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Create Group</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- JOIN GROUP MODAL --- */}
      <Modal visible={isJoinModalOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join a Group</Text>
              <TouchableOpacity onPress={() => setIsJoinModalOpen(false)}>
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: '#6B7280', marginBottom: 12 }}>Enter the 6-character code provided by the group creator.</Text>

            <TextInput
              style={[styles.input, { fontSize: 24, textAlign: 'center', letterSpacing: 5 }]}
              placeholder="ABC123"
              autoCapitalize="characters"
              maxLength={6}
              value={joinCodeInput}
              onChangeText={setJoinCodeInput}
            />

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#10B981', marginTop: 10, opacity: isSubmitting ? 0.7 : 1 }]} 
              onPress={handleJoinGroup}
              disabled={isSubmitting}
            >
              {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Join Now</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#6D28D9', paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 4 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: 'white', marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: '#DDD6FE' },
  tabsContainer: { flexDirection: 'row', backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#6D28D9' },
  tabText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#6D28D9', fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  itemsList: { paddingBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  metaInfo: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6B7280' },
  
  // Group Buttons
  groupActionsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#6D28D9', paddingVertical: 12, borderRadius: 12, gap: 6 },
  actionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
  
  primaryButton: { backgroundColor: '#6D28D9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12 },
  secondaryButtonText: { color: '#4B5563', fontSize: 14, fontWeight: '600' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: '40%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, color: '#1F2937' },
});