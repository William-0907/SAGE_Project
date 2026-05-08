import { useState } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, TextInput, ScrollView, Platform, Alert, FlatList } from 'react-native';
import LoginScreen from '../../components/LoginScreen';
import Dashboard from '../../components/Dashboard';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';


export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState('10');
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [isQuestionTypeDropdownVisible, setIsQuestionTypeDropdownVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      setSelectedFile(result.assets[0]);
    } catch (err) {
      console.error("File picker error:", err);
      Alert.alert("Error", "Failed to select file.");
    }
  };

  const handleGenerateQuiz = () => {
    if (!selectedFile) {
      Alert.alert("Material Required", "Please select a study material (PDF or Text) before generating a quiz.");
      return;
    }
    
    // Logic for actual quiz generation will be implemented here
    Alert.alert("Quiz Generator", `Success! Preparing to generate ${questionCount} ${difficulty} ${questionType} questions from "${selectedFile.name}".`);
    setIsModalVisible(false);
  };

  const questionTypeOptions = ['Multiple Choice', 'True/False', 'Short Answer', 'Fill-in-the-Blank'];
  const handleQuestionTypeSelect = (type: string) => {
    setQuestionType(type);
    setIsQuestionTypeDropdownVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Dashboard onGenerateQuiz={() => setIsModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quiz Generator</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              {/* Material Preview */}
              <Text style={styles.label}>Selected Material</Text>
              <View style={styles.materialPreview}>
                <View style={styles.materialIconBg}>
                  <Ionicons name={selectedFile ? "document-text" : "cloud-upload-outline"} size={24} color="#7C3AED" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.materialName} numberOfLines={1}>
                    {selectedFile ? selectedFile.name : "No file selected"}
                  </Text>
                  <Text style={styles.materialMeta}>
                    {selectedFile 
                      ? `${selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'} • ${selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown size'}` 
                      : "Select a PDF or text file"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.changeBtn} onPress={handleSelectFile}>
                  <Text style={styles.changeBtnText}>{selectedFile ? "Change" : "Select"}</Text>
                </TouchableOpacity>
              </View>

              {/* Difficulty Selection */}
              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyRow}>
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <TouchableOpacity 
                    key={d} 
                    style={[styles.chip, difficulty === d && styles.chipActive]}
                    onPress={() => setDifficulty(d)}
                  >
                    <Text style={[styles.chipText, difficulty === d && styles.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Question Config */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Questions</Text>
                  <TextInput 
                    style={styles.input} 
                    value={questionCount} 
                    onChangeText={setQuestionCount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ width: 16 }} />
                <View style={{ flex: 2 }}>
                  <Text style={styles.label}>Question Type</Text>
                  <TouchableOpacity 
                    style={styles.selector} 
                    onPress={() => setIsQuestionTypeDropdownVisible(!isQuestionTypeDropdownVisible)}
                  >
                    <Text style={styles.selectorText}>{questionType}</Text>
                    <Ionicons name="chevron-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  {isQuestionTypeDropdownVisible && ( // Render the dropdown
                    <ScrollView style={styles.dropdown} nestedScrollEnabled={true}>
                      {questionTypeOptions.map((type) => (
                        <TouchableOpacity key={type} style={styles.dropdownItem} onPress={() => handleQuestionTypeSelect(type)} activeOpacity={0.7}>
                          <Text style={styles.dropdownItemText}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              {/* Focus Area */}
              <Text style={styles.label}>Focus Area (Optional)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="e.g. Focus on Newton's Second Law"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.generateButton} onPress={handleGenerateQuiz}>
                <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.generateButtonText}>Generate Quiz</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    width: '100%',
    maxHeight: '90%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  modalForm: { marginBottom: 10 },
  label: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8, marginTop: 16 },
  materialPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  materialIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  materialMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  changeBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  changeBtnText: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  difficultyRow: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'white',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { fontSize: 14, fontWeight: '500', color: '#4B5563' },
  chipTextActive: { color: 'white', fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  selectorText: { fontSize: 15, color: '#1F2937' },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  dropdown: {
    position: 'absolute',
    top: 52, // Position below the selector (selector height 48 + some spacing)
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000, // Ensure it's above other elements
    maxHeight: 200, // Limit height to prevent it from taking too much space
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  generateButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 32,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  generateButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#1F2937',
  },
});