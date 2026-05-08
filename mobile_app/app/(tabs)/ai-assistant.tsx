import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Modal, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { getToken } from '@/services/authService';
import { API_BASE_URL } from '@/config/api';

// 🌟 NEW: Enable Layout Animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  text: string;
  time: string;
}

interface ChatSession {
  id: number;
  title: string;
}

export default function AIAssistantScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  // --- Multi-Thread State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // --- Message State ---
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<any>(null);

  const quickActions = [
    { id: 1, label: 'Study Plan', icon: 'book', color: '#3B82F6' },
    { id: 2, label: 'Set Goals', icon: 'flag', color: '#10B981' },
    { id: 3, label: 'Schedule', icon: 'calendar', color: '#7C3AED' }, 
    { id: 4, label: 'Progress', icon: 'trending-up', color: '#F97316' },
  ];

  // 1. Load Sessions on Startup
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/ai/sessions/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeSessionId) {
          loadHistory(data[0].id);
        } else if (data.length === 0) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    }
  };

  // 2. Load a Specific Chat Thread
  const loadHistory = async (sessionId: number) => {
    setActiveSessionId(sessionId);
    setIsMenuVisible(false);
    setMessages([]); 
    
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/ai/sessions/${sessionId}/history/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // 3. Start a Blank Canvas
  const startNewChat = () => {
    setActiveSessionId(null); 
    setMessages([{
      id: 1,
      type: 'ai',
      text: "Hi! I'm your SAGE AI assistant. Let's start a new topic. How can I help?",
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    }]);
    setIsMenuVisible(false);
  };

  // 4. Send Message
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    // 🌟 Capture the file locally and clear state immediately
    const fileToProcess = attachedFile;
    setAttachedFile(null);
    setAttachedFileName(null);

    let extractedText = "";
    if (fileToProcess) {
      try {
        if (fileToProcess.mimeType === 'text/plain') {
          extractedText = await FileSystem.readAsStringAsync(fileToProcess.uri);
        } else {
          extractedText = `[FILE ATTACHED]\nName: ${fileToProcess.name}\nType: ${fileToProcess.mimeType}\nSize: ${fileToProcess.size} bytes`;
        }
      } catch (err) {
        console.error("Text extraction failed:", err);
      }
    }

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/ai/ask/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          message: textToSend.trim(),
          attachment_text: extractedText,
          session_id: activeSessionId 
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      
      // If this was a brand new chat, Django just created an ID for it. Save it!
      if (!activeSessionId && data.session_id) {
        setActiveSessionId(data.session_id);
        loadSessions(); 
      }

      // --- Simulated Typing Animation ---
      const aiMessageId = Date.now() + 1;
      const fullReply = data.reply;

      // 1. Add an empty AI message bubble first
      setMessages((prev) => [...prev, {
        id: aiMessageId,
        type: 'ai',
        text: '',
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);

      // 2. Animate the text filling in
      let charIndex = 0;
      const typingInterval = setInterval(() => {
        setMessages((prev) => prev.map(m => 
          m.id === aiMessageId ? { ...m, text: fullReply.substring(0, charIndex + 1) } : m
        ));
        charIndex++;
        
        if (charIndex >= fullReply.length) {
          clearInterval(typingInterval);
        }
        
        // Auto-scroll as the text grows to keep the latest lines visible
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 15); // 15ms per character creates a smooth typing feel

    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        text: "Sorry, I couldn't reach the server. Make sure your Django backend is running the latest code!",
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
      setAttachedFileName(null);
      setAttachedFile(null); // Clear the attachment after sending
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  // 5. Handle File Upload and Text Extraction
  const handleFileUpload = async () => {
    try {
      // Select the file from the device
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAttachedFile(file);
      setAttachedFileName(file.name);
    } catch (err) {
      console.error("File processing error:", err);
      Alert.alert("Error", "Could not process the selected file.");
    }
  };

  const clearAttachment = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAttachedFile(null);
    setAttachedFileName(null);
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setIsMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={28} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>SAGE Chat</Text>
            <Text style={styles.headerSubtitle}>
              {activeSessionId ? "Active Session" : "New Conversation"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={startNewChat} style={styles.newChatHeaderBtn}>
          <Ionicons name="create-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 🌟 NEW: Sidebar Modal */}
      <Modal visible={isMenuVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          
          {/* Drawer Content */}
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
            </View>

            <TouchableOpacity style={styles.newChatButton} onPress={startNewChat}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.newChatText}>Start New Chat</Text>
            </TouchableOpacity>

            <ScrollView style={styles.sessionList}>
              {sessions.map(session => (
                <TouchableOpacity 
                  key={session.id} 
                  style={[styles.sessionItem, activeSessionId === session.id && styles.activeSessionItem]}
                  onPress={() => loadHistory(session.id)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={activeSessionId === session.id ? "#7C3AED" : "#6B7280"} />
                  <Text style={[styles.sessionText, activeSessionId === session.id && styles.activeSessionText]} numberOfLines={1}>
                    {session.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Invisible tap area to close the sidebar */}
          <TouchableOpacity style={styles.modalCloseArea} onPress={() => setIsMenuVisible(false)} />
        </View>
      </Modal>

      {/* Messages Scroll Area */}
      <ScrollView ref={scrollViewRef} style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.messagesList}>
          {messages.map((message) => (
            <View key={message.id} style={[styles.messageWrapper, message.type === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper]}>
              <View style={[styles.messageBubble, message.type === 'user' ? [styles.userMessage, { backgroundColor: '#7C3AED' }] : [styles.aiMessage, { backgroundColor: 'white' }]]}>
                {message.type === 'ai' && (
                  <View style={styles.aiMessageHeader}>
                    <Ionicons name="sparkles" size={14} color="#7C3AED" />
                    <Text style={styles.aiLabel}>SAGE AI</Text>
                  </View>
                )}
                <Text style={[styles.messageText, message.type === 'user' ? { color: 'white' } : { color: '#1F2937' }]}>{message.text}</Text>
                <Text style={[styles.messageTime, message.type === 'user' ? { color: 'rgba(255,255,255,0.7)' } : { color: '#999' }]}>{message.time}</Text>
              </View>
            </View>
          ))}
          
          {isLoading && (
            <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
              <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={{ color: '#666', fontSize: 12, fontStyle: 'italic' }}>SAGE AI is thinking...</Text>
              </View>
            </View>
          )}

          {messages.length === 1 && !isLoading && (
            <View style={styles.quickActionsContainer}>
              <Text style={styles.quickActionsTitle}>Suggested Topics</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity 
                    key={action.id} 
                    style={styles.quickActionButton}
                    onPress={() => {
                      setTimeout(() => {
                        handleSend(`Help me with my ${action.label.toLowerCase()}`);
                      }, 250);
                    }}
                  >
                    <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* Attached File Preview - Now inside the input area container */}
        {attachedFileName && (
          <View style={styles.attachmentPreview}>
            <View style={styles.attachmentBadge}>
              <Ionicons name="document" size={16} color="#7C3AED" />
              <Text style={styles.attachmentName} numberOfLines={1}>{attachedFileName}</Text>
              <TouchableOpacity onPress={clearAttachment}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputBox}>
          <TouchableOpacity onPress={handleFileUpload} style={styles.attachButton}>
            <Ionicons name="attach" size={26} color="#7C3AED" />
          </TouchableOpacity>
          <View style={styles.inputField}>
            <TextInput style={styles.input} placeholder="Ask me anything..." placeholderTextColor="#999" value={inputValue} onChangeText={setInputValue} onSubmitEditing={() => handleSend()} editable={!isLoading} />
          </View>
          <TouchableOpacity style={[styles.sendButton, { backgroundColor: isLoading || !inputValue.trim() ? '#E5E7EB' : '#7C3AED' }]} onPress={() => handleSend()} disabled={isLoading || !inputValue.trim()}>
            <Ionicons name="send" size={18} color={isLoading || !inputValue.trim() ? '#999' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#7C3AED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerContent: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  menuButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: 'white' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  newChatHeaderBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 },
  
  // Sidebar Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row' },
  modalContent: { backgroundColor: 'white', width: '75%', height: '100%', borderTopRightRadius: 24, borderBottomRightRadius: 24, padding: 20, paddingTop: 60, elevation: 5, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
  modalCloseArea: { flex: 1 }, // Invisible area to tap and close
  modalHeader: { marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  newChatButton: { backgroundColor: '#7C3AED', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8, marginBottom: 20 },
  newChatText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  sessionList: { flex: 1 },
  sessionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  activeSessionItem: { backgroundColor: '#F3F0FF', borderRadius: 12, borderBottomWidth: 0 },
  sessionText: { fontSize: 15, color: '#4B5563', flex: 1 },
  activeSessionText: { color: '#7C3AED', fontWeight: 'bold' },

  messagesContainer: { flex: 1 },
  messagesList: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 40 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row' },
  userMessageWrapper: { justifyContent: 'flex-end' },
  aiMessageWrapper: { justifyContent: 'flex-start' },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, shadowColor: '#111', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  userMessage: { borderBottomRightRadius: 4 },
  aiMessage: { borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F3F4F6' },
  aiMessageHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  aiLabel: { fontSize: 10, color: '#7C3AED', fontWeight: '600' },
  messageText: { fontSize: 13, lineHeight: 18 },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  
  // Centered Quick Actions Styles
  quickActionsContainer: { marginTop: 40, alignItems: 'center' },
  quickActionsTitle: { fontSize: 14, color: '#6B7280', marginBottom: 16, fontWeight: '500' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 },
  quickActionButton: { alignItems: 'center', width: '42%', paddingVertical: 16, backgroundColor: 'white', borderRadius: 16, elevation: 2, shadowColor: '#111', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  quickActionIcon: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  quickActionLabel: { fontSize: 13, fontWeight: '600', color: '#1F2937' },

  inputContainer: { paddingHorizontal: 16, paddingBottom: 30, paddingTop: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  inputBox: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  inputField: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24, gap: 8, backgroundColor: '#F3F4F6' },
  attachButton: { padding: 4, marginBottom: 4 },
  input: { flex: 1, fontSize: 13, paddingVertical: 4, color: '#1F2937' },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  attachmentPreview: { marginBottom: 10, paddingLeft: 4 },
  attachmentBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F0FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', gap: 8, maxWidth: '90%' },
  attachmentName: { fontSize: 12, color: '#7C3AED', fontWeight: '500', flexShrink: 1 },
});