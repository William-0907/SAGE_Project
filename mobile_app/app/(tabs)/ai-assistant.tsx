import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  time: string;
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

  const quickActions: QuickAction[] = [
    { id: 1, label: 'Study Plan', icon: 'book', color: '#3B82F6' },
    { id: 2, label: 'Set Goals', icon: 'target', color: '#10B981' },
    { id: 3, label: 'Schedule', icon: 'calendar', color: '#9333EA' },
    { id: 4, label: 'Progress', icon: 'trending-up', color: '#F97316' },
  ];

  const suggestions = [
    "What should I study today?",
    "Help me with calculus",
    "Create a quiz for me",
    "Show my weak areas",
  ];

  const colors = Colors[colorScheme ?? 'light'];

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        type: 'ai',
        text: "I understand you need help with that. Based on your learning history, I recommend focusing on practice problems. Would you like me to generate a personalized quiz?",
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#9333EA' }]}>
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
      <View style={[styles.quickActionsContainer, { backgroundColor: colors.surface }]}>
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
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>
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
                    ? [styles.userMessage, { backgroundColor: '#6366F1' }]
                    : [styles.aiMessage, { backgroundColor: colors.surface }],
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
                      : { color: colors.text },
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.type === 'user'
                      ? { color: 'rgba(255,255,255,0.7)' }
                      : { color: '#999' },
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
                <Ionicons name="lightbulb" size={16} color="#666" />
                <Text style={styles.suggestionsTitle}>Try asking:</Text>
              </View>
              <View style={styles.suggestionsGrid}>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionButton, { backgroundColor: colors.surface }]}
                    onPress={() => setInputValue(suggestion)}
                  >
                    <Text
                      style={[styles.suggestionText, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {suggestion}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.inputBox}>
          <View style={[styles.inputField, { backgroundColor: '#F3F4F6' }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ask me anything..."
              placeholderTextColor="#999"
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity>
              <Ionicons name="mic" size={20} color="#999" />
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
  },
  userMessage: {
    borderBottomRightRadius: 2,
  },
  aiMessage: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#666',
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
});
