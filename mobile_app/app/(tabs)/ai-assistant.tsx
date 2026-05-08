import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
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
  editing?: boolean;
  fileUri?: string;
  fileName?: string;
}

interface QuickAction {
  id: number;
  label: string;
  icon: string;
  color: string;
}

export default function AIAssistantScreen() {
  const colorScheme = useColorScheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      text: "Hi! I'm your SAGE AI assistant. I can help you with personalized study plans, answer questions, suggest resources, and track your progress. How can I help you today?",
      time: '10:30 AM',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ uri: string; name: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  const quickActions: QuickAction[] = [
    { id: 1, label: 'Study Plan', icon: 'book', color: '#3B82F6' },
    { id: 2, label: 'Set Goals', icon: 'flag', color: '#10B981' },
    { id: 3, label: 'Schedule', icon: 'calendar', color: '#9333EA' },
    { id: 4, label: 'Progress', icon: 'trending-up', color: '#F97316' },
  ];

  const suggestions = [
    "What should I study today?",
    "Help me with calculus",
    "Create a quiz for me",
    "Show my weak areas",
  ];

  const colorSchemeValue = colorScheme ?? 'light';
  const themeColors = Colors[colorSchemeValue as keyof typeof Colors];

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setUploadedFile({
        uri: result.assets[0].uri,
        name: result.assets[0].name,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);

    try {
      const { API_BASE_URL } = require('@/config/api');
      const token = await getToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }

      // Check file type
      const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase();
      const supportedTypes = ['txt', 'pdf', 'docx'];
      
      if (!fileExtension || !supportedTypes.includes(fileExtension)) {
        throw new Error('Only .txt, .pdf, and .docx files are supported');
      }

      // Read the file content
      let fileContent = '';
      try {
        const response = await fetch(uploadedFile.uri);
        if (!response.ok) {
          throw new Error('Failed to read file');
        }
        
        // For text files
        if (fileExtension === 'txt') {
          fileContent = await response.text();
        } else {
          // For binary files (PDF, DOCX), we can't easily extract text on mobile
          // Send placeholder - backend will handle file extraction
          fileContent = `[File: ${uploadedFile.name}]\n[${fileExtension.toUpperCase()} file uploaded]\nPlease generate a quiz from this educational material.`;
        }
      } catch (err) {
        throw new Error('Failed to read file content');
      }

      if (!fileContent || fileContent.length === 0) {
        throw new Error('File is empty or could not be read');
      }

      // Limit content size to 5000 characters
      const limitedContent = fileContent.substring(0, 5000);

      console.log('[DEBUG] Sending file to quiz generation API...');
      console.log('[DEBUG] File name:', uploadedFile.name);
      console.log('[DEBUG] File type:', fileExtension);
      console.log('[DEBUG] Content length:', limitedContent.length);

      // Send to backend for quiz generation
      const response = await fetch(`${API_BASE_URL}/ai/generate-quiz/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: limitedContent,
          filename: uploadedFile.name,
          file_type: fileExtension,
        }),
      });

      console.log('[DEBUG] Quiz generation response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[ERROR] Quiz generation error:', errorText);
        throw new Error(`Failed to generate quiz: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Quiz data received:', data);

      // Parse the quiz from the response
      let quiz = null;
      if (data.quiz) {
        quiz = data.quiz;
      } else if (data.quizzes && data.quizzes[0]) {
        quiz = data.quizzes[0];
      }

      if (!quiz) {
        throw new Error('No quiz data in response');
      }

      const aiMessage: Message = {
        id: Date.now(),
        type: 'ai',
        text: `Quiz "${quiz.title}" created from ${uploadedFile.name}!`,
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        quiz: quiz,
      };

      setMessages((prev) => [...prev, aiMessage]);
      setUploadedFile(null);
    } catch (error) {
      console.log('[ERROR] Quiz generation failed:', error);
      Alert.alert('Error', `Failed to generate quiz: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      const savedQuiz = await createQuiz(quiz.title, quiz.questions, quiz.subject);
      Alert.alert('Success', 'Quiz saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save quiz');
    }
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(JSON.parse(JSON.stringify(quiz))); // Deep copy
    setEditingQuizId(Date.now());
  };

  const handleUpdateQuestion = (index: number, field: string, value: any) => {
    if (!editingQuiz) return;
    
    const updatedQuiz = JSON.parse(JSON.stringify(editingQuiz));
    if (field === 'question') {
      updatedQuiz.questions[index].question = value;
    } else if (field === 'option') {
      updatedQuiz.questions[index].options = value;
    } else if (field === 'correctAnswer') {
      updatedQuiz.questions[index].correctAnswer = value;
    }
    
    setEditingQuiz(updatedQuiz);
  };

  const handleSaveEditedQuiz = () => {
    if (!editingQuiz) return;

    // Update the quiz in messages
    setMessages((prev) =>
      prev.map((msg) => ({
        ...msg,
        quiz: msg.quiz && msg.id === editingQuizId ? editingQuiz : msg.quiz,
      }))
    );

    setEditingQuiz(null);
    setEditingQuizId(null);
    Alert.alert('Success', 'Quiz updated! You can now save it.');
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setEditingQuizId(null);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Add loading message
    const loadingId = Date.now() + 1;
    setMessages((prev) => [...prev, {
      id: loadingId,
      type: 'ai',
      text: 'Thinking...',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    }]);

    const prompt = inputValue;

    try {
      // Get API configuration - import the actual base URL
      const { API_BASE_URL } = require('@/config/api');
      
      // Get the JWT token
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }
      
      console.log('[DEBUG] API_BASE_URL:', API_BASE_URL);
      console.log('[DEBUG] Sending message to:', `${API_BASE_URL}/ai/`);
      console.log('[DEBUG] Message:', prompt);
      console.log('[DEBUG] Using token:', token.substring(0, 20) + '...');
      
      // Try to connect to backend AI chat endpoint
      const response = await fetch(`${API_BASE_URL}/ai/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: prompt,
        }),
      });

      console.log('[DEBUG] Response status:', response.status);
      console.log('[DEBUG] Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('[ERROR] HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const data = await response.json();
      console.log('[DEBUG] Response data:', data);

      // Remove loading message and add AI response
      setMessages((prev) => 
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: Date.now(),
            type: 'ai',
            text: data.sage_response || data.response || 'I apologize, but I couldn\'t generate a response. Please try again.',
            time: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          })
      );

    } catch (error) {
      console.log('[ERROR] Full error:', error);
      console.log('[ERROR] Error message:', (error as Error).message);
      console.log('[ERROR] Error code:', (error as Error).code);
      console.log('[ERROR] Error stack:', (error as Error).stack);
      
      // Remove loading message and add error message
      setMessages((prev) => 
        prev
          .filter((msg) => msg.id !== loadingId)
          .concat({
            id: Date.now(),
            type: 'ai',
            text: `Error: ${(error as Error).message || 'Unknown error occurred'}. Please check your connection and try again.`,
            time: new Date().toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            }),
          })
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Edit Quiz Modal */}
      <Modal
        visible={!!editingQuiz}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={[styles.modalOverlay, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: '#6366F1' }]}>
            <TouchableOpacity onPress={handleCancelEdit}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Quiz</Text>
            <TouchableOpacity onPress={handleSaveEditedQuiz}>
              <Ionicons name="checkmark" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {editingQuiz && (
              <>
                <View style={styles.editSection}>
                  <Text style={[styles.editLabel, { color: themeColors.text }]}>Quiz Title</Text>
                  <TextInput
                    style={[styles.editInput, { color: themeColors.text, borderColor: '#E5E7EB' }]}
                    placeholder="Quiz title"
                    placeholderTextColor="#9CA3AF"
                    value={editingQuiz.title}
                    onChangeText={(text) =>
                      setEditingQuiz({ ...editingQuiz, title: text })
                    }
                  />
                </View>

                <View style={styles.editSection}>
                  <Text style={[styles.editLabel, { color: themeColors.text }]}>Subject</Text>
                  <TextInput
                    style={[styles.editInput, { color: themeColors.text, borderColor: '#E5E7EB' }]}
                    placeholder="Subject"
                    placeholderTextColor="#9CA3AF"
                    value={editingQuiz.subject}
                    onChangeText={(text) =>
                      setEditingQuiz({ ...editingQuiz, subject: text })
                    }
                  />
                </View>

                <View style={styles.editSection}>
                  <Text style={[styles.editLabel, { color: themeColors.text }]}>Questions</Text>
                  {editingQuiz.questions?.map((question, qIndex) => (
                    <View key={qIndex} style={[styles.questionEditCard, { backgroundColor: '#F3F4F6' }]}>
                      <Text style={[styles.questionNumber, { color: '#6366F1' }]}>
                        Question {qIndex + 1}
                      </Text>

                      <Text style={[styles.editLabel, { color: themeColors.text, marginTop: 8 }]}>
                        Question Text
                      </Text>
                      <TextInput
                        style={[styles.editInput, { color: themeColors.text, borderColor: '#E5E7EB' }]}
                        placeholder="Question"
                        placeholderTextColor="#9CA3AF"
                        value={question.question}
                        onChangeText={(text) =>
                          handleUpdateQuestion(qIndex, 'question', text)
                        }
                        multiline
                      />

                      <Text style={[styles.editLabel, { color: themeColors.text, marginTop: 8 }]}>
                        Options
                      </Text>
                      {question.options.map((option, oIndex) => (
                        <View key={oIndex} style={styles.optionEditContainer}>
                          <TextInput
                            style={[styles.editInput, { color: themeColors.text, borderColor: '#E5E7EB', flex: 1 }]}
                            placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                            placeholderTextColor="#9CA3AF"
                            value={option}
                            onChangeText={(text) => {
                              const updatedOptions = [...question.options];
                              updatedOptions[oIndex] = text;
                              handleUpdateQuestion(qIndex, 'option', updatedOptions);
                            }}
                          />
                          <TouchableOpacity
                            style={[
                              styles.correctAnswerButton,
                              {
                                backgroundColor:
                                  question.correctAnswer === oIndex ? '#10B981' : '#E5E7EB',
                              },
                            ]}
                            onPress={() =>
                              handleUpdateQuestion(qIndex, 'correctAnswer', oIndex)
                            }
                          >
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color={
                                question.correctAnswer === oIndex ? 'white' : '#9CA3AF'
                              }
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Main Screen */}
      {/* Changed Background Color to #6366F1 to match Profile Screen */}
      <View style={[styles.header, { backgroundColor: '#6366F1' }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconBox}>
            <Ionicons name="sparkles" size={24} color="white" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Always here to help you learn</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActionsContainer, { backgroundColor: themeColors.background }]}>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.quickActionButton}>
              <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <Ionicons
                  name={action.icon as any}
                  size={20}
                  color="white"
                />
              </View>
              <Text style={[styles.quickActionLabel, { color: themeColors.text }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.messagesList}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.type === 'user'
                    ? [styles.userMessage, { backgroundColor: '#6366F1' }] // Match primary color
                    : [styles.aiMessage, { backgroundColor: themeColors.background }],
                ]}
              >
                {message.type === 'ai' && (
                  <View style={styles.aiMessageHeader}>
                    <Ionicons name="sparkles" size={14} color="#6366F1" />
                    <Text style={styles.aiLabel}>SAGE AI</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.messageText,
                    message.type === 'user'
                      ? { color: 'white' }
                      : { color: themeColors.text },
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.type === 'user'
                      ? { color: 'rgba(255,255,255,0.7)' }
                      : { color: '#9CA3AF' }, // Gray-400 from reference
                  ]}
                >
                  {message.time}
                </Text>
              </View>
            </View>
          ))}

          {/* Suggestions */}
          {messages.length === 1 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Ionicons name="bulb" size={16} color="#9CA3AF" />
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
              </View>
              <View style={styles.suggestionsGrid}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionButton, { backgroundColor: themeColors.background }]}
                    onPress={() => setInputValue(suggestion)}
                  >
                    <Text
                      style={[styles.suggestionText, { color: themeColors.text }]}
                      numberOfLines={2}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Generated Quiz Display */}
          {messages.slice().reverse().find((m) => m.quiz) && (
            <View style={styles.quizCard}>
              <View style={styles.quizHeader}>
                <Text style={[styles.quizTitle, { color: themeColors.text }]}>
                  {messages.slice().reverse().find((m) => m.quiz)?.quiz?.title}
                </Text>
                <Text style={[styles.quizSubject, { color: '#10B981' }]}>
                  {messages.slice().reverse().find((m) => m.quiz)?.quiz?.subject}
                </Text>
              </View>
              <Text style={[styles.quizQuestionCount, { color: '#9CA3AF' }]}>
                {messages.slice().reverse().find((m) => m.quiz)?.quiz?.questions?.length || 0} questions
              </Text>
              <View style={styles.quizQuestions}>
                {messages.slice().reverse().find((m) => m.quiz)?.quiz?.questions?.map((question, index) => (
                  <View key={index} style={styles.questionItem}>
                    <Text style={[styles.questionText, { color: themeColors.text }]}>
                      {index + 1}. {question.question}
                    </Text>
                    <View style={styles.questionOptions}>
                      {question.options.map((option, optIndex) => (
                        <Text
                          key={optIndex}
                          style={[
                            styles.optionText,
                            {
                              color: optIndex === question.correctAnswer ? '#10B981' : themeColors.text,
                              opacity: optIndex === question.correctAnswer ? 1 : 0.6,
                            },
                          ]}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.quizActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                  onPress={() => {
                    const quiz = messages.slice().reverse().find((m) => m.quiz)?.quiz;
                    if (quiz) handleSaveQuiz(quiz);
                  }}
                >
                  <Ionicons name="save" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Save Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
                  onPress={() => {
                    const quiz = messages.slice().reverse().find((m) => m.quiz)?.quiz;
                    if (quiz) handleEditQuiz(quiz);
                  }}
                >
                  <Ionicons name="create" size={16} color="white" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: themeColors.background }]}>
        <View style={styles.inputBox}>
          {/* Attachment Button */}
          {!uploadedFile && (
            <TouchableOpacity
              style={styles.attachmentButton}
              onPress={handleFileUpload}
            >
              <Ionicons name="document" size={20} color="#6366F1" />
            </TouchableOpacity>
          )}

          {/* File Upload Button */}
          {uploadedFile && (
            <TouchableOpacity
              style={[styles.uploadedFileBox, { backgroundColor: '#E0E7FF' }]}
              onPress={handleFileUpload}
            >
              <View style={styles.uploadedFileInfo}>
                <Ionicons name="document" size={18} color="#6366F1" />
                <Text style={[styles.uploadedFileName, { color: '#6366F1' }]} numberOfLines={1}>
                  {uploadedFile.name}
                </Text>
              </View>
              <Ionicons name="close" size={18} color="#6366F1" />
            </TouchableOpacity>
          )}

          {/* Generate Quiz Button */}
          {uploadedFile && (
            <TouchableOpacity
              style={[styles.generateButton, { backgroundColor: '#10B981' }]}
              onPress={handleGenerateQuiz}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Ionicons name="refresh" size={18} color="white" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="white" />
                  <Text style={styles.generateButtonText}>Generate Quiz</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={[styles.inputField, { backgroundColor: '#F3F4F6' }]}>
            <TextInput
              style={[styles.input, { color: themeColors.text }]} // Fixed color prop
              placeholder="Ask me anything..."
              placeholderTextColor="#9CA3AF"
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity>
              <Ionicons name="mic" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: '#6366F1' }]}
            onPress={handleSend}
            disabled={!inputValue.trim()}
          >
            <Ionicons name="send" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  quickActionsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  aiMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1, // Added to ensure consistency
    borderColor: 'transparent', // Default transparent, overwritten by styles
  },
  userMessage: {
    borderBottomRightRadius: 2,
    borderColor: '#6366F1', // Match color
  },
  aiMessage: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Gray-200 from reference
  },
  aiMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiLabel: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#9CA3AF', // Gray-400 from reference
    fontWeight: '500',
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 11,
    lineHeight: 15,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  inputField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
  },
  uploadedFileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 200,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quizSubject: {
    fontSize: 12,
    fontWeight: '600',
  },
  quizQuestionCount: {
    fontSize: 11,
    marginBottom: 8,
  },
  quizQuestions: {
    gap: 12,
  },
  questionItem: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  questionOptions: {
    gap: 4,
  },
  optionText: {
    fontSize: 11,
  },
  quizActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editSection: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 8,
  },
  questionEditCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  correctAnswerButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});