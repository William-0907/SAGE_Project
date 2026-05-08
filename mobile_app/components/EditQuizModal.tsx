import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getQuizzes, createQuiz, Quiz } from '@/services/quizService';
import { getToken } from '@/services/authService';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  time: string;
  quiz?: Quiz;
}

interface QuickAction {
  id: number;
  label: string;
  icon: string;
  color: string;
}

export default function AIAssistantScreen() {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm your SAGE AI assistant.",
      time: '10:30 AM',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ uri: string; name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ✅ FIXED: proper edit state
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const latestQuizMessage = [...messages].reverse().find(m => m.quiz);

  const handleEditQuiz = (quiz: Quiz, messageId: number) => {
    setEditingQuiz(structuredClone(quiz));
    setEditingMessageId(messageId);
  };

  const handleUpdateQuestion = (
    qIndex: number,
    field: 'question' | 'options' | 'correctAnswer',
    value: any
  ) => {
    if (!editingQuiz) return;

    const updated = structuredClone(editingQuiz);

    if (field === 'question') {
      updated.questions[qIndex].question = value;
    }

    if (field === 'options') {
      updated.questions[qIndex].options = value;
    }

    if (field === 'correctAnswer') {
      updated.questions[qIndex].correctAnswer = value;
    }

    setEditingQuiz(updated);
  };

  const handleSaveEditedQuiz = () => {
    if (!editingQuiz || !editingMessageId) return;

    setMessages(prev =>
      prev.map(msg =>
        msg.id === editingMessageId
          ? { ...msg, quiz: editingQuiz }
          : msg
      )
    );

    setEditingQuiz(null);
    setEditingMessageId(null);

    Alert.alert('Success', 'Quiz updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setEditingMessageId(null);
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      await createQuiz(quiz.title, quiz.questions, quiz.subject);
      Alert.alert('Success', 'Quiz saved successfully!');
    } catch (e) {
      Alert.alert('Error', 'Failed to save quiz');
    }
  };

  const handleEditQuizPress = (quiz: Quiz) => {
    const msg = latestQuizMessage;
    if (!msg) return;

    handleEditQuiz(quiz, msg.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      
      {/* ================= EDIT MODAL ================= */}
      <Modal visible={!!editingQuiz} animationType="slide">
        <View style={{ flex: 1, backgroundColor: themeColors.background }}>

          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text style={{ color: 'white', fontSize: 16 }}>Edit Quiz</Text>

            <TouchableOpacity onPress={handleSaveEditedQuiz}>
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }}>
            {editingQuiz?.questions.map((q, qIndex) => (
              <View key={q.id ?? qIndex} style={styles.card}>

                <TextInput
                  value={q.question}
                  onChangeText={(t) =>
                    handleUpdateQuestion(qIndex, 'question', t)
                  }
                  style={styles.input}
                  placeholder="Question"
                />

                {q.options.map((opt, oIndex) => (
                  <View key={oIndex} style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      value={opt}
                      onChangeText={(t) => {
                        const updatedOptions = [...q.options];
                        updatedOptions[oIndex] = t;

                        handleUpdateQuestion(qIndex, 'options', updatedOptions);
                      }}
                      style={[styles.input, { flex: 1 }]}
                      placeholder={`Option ${oIndex + 1}`}
                    />

                    <TouchableOpacity
                      onPress={() =>
                        handleUpdateQuestion(qIndex, 'correctAnswer', oIndex)
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={q.correctAnswer === oIndex ? 'green' : 'gray'}
                      />
                    </TouchableOpacity>
                  </View>
                ))}

              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MESSAGES ================= */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {messages.map((msg) => (
          <View key={msg.id} style={{ marginBottom: 12 }}>

            <Text>{msg.text}</Text>

            {/* quiz UI */}
            {msg.quiz && (
              <View style={styles.card}>
                <Text style={{ fontWeight: 'bold' }}>{msg.quiz.title}</Text>

                <TouchableOpacity
                  onPress={() => handleSaveQuiz(msg.quiz!)}
                >
                  <Text>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleEditQuiz(msg.quiz!, msg.id)}
                >
                  <Text>Edit</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#6366F1',
  },

  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
});