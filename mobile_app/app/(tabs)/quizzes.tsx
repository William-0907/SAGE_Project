import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getQuizzes, Quiz } from '@/services/quizService';

export default function QuizzesScreen() {
  const colorScheme = useColorScheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isQuizView, setIsQuizView] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [questionId: number]: number }>({});
  const [showResults, setShowResults] = useState(false);

  const colors = Colors[colorScheme || 'light'];

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load quizzes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setUserAnswers({});
    setShowResults(false);
    setIsQuizView(true);
  };

  const handleAnswer = (questionId: number, answerIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    const allAnswered = quizzes.length > 0;
    if (allAnswered) {
      setShowResults(true);
    }
  };

  const handleBackToList = () => {
    setIsQuizView(false);
    setSelectedQuiz(null);
  };

  const calculateResults = () => {
    if (!selectedQuiz) return { score: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    const total = selectedQuiz.questions.length;

    selectedQuiz.questions.forEach((question) => {
      if (userAnswers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    const percentage = Math.round((correct / total) * 100);

    return {
      score: correct,
      total,
      percentage,
    };
  };

  const results = calculateResults();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Quizzes</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Create Quiz', 'File upload feature coming soon!')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>Create Quiz</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading quizzes...</Text>
        </View>
      ) : isQuizView ? (
        selectedQuiz && (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.quizHeader}>
              <Text style={[styles.quizTitle, { color: colors.text }]}>
                {selectedQuiz.title}
              </Text>
              <Text style={[styles.quizSubject, { color: colors.primary }]}>
                {selectedQuiz.subject}
              </Text>
            </View>

            {showResults ? (
              <View style={styles.resultsContainer}>
                <View style={styles.resultCircle}>
                  <Text style={styles.resultPercentage}>{results.percentage}%</Text>
                  <Text style={[styles.resultLabel, { color: colors.text }]}>
                    Score
                  </Text>
                </View>
                <Text style={[styles.resultText, { color: colors.text }]}>
                  {results.score} out of {results.total} correct
                </Text>
              </View>
            ) : (
              <>
                {selectedQuiz.questions.map((question) => (
                  <View
                    key={question.id}
                    style={[
                      styles.questionCard,
                      { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                    ]}
                  >
                    <Text style={[styles.questionText, { color: colors.text }]}>
                      {question.question}
                    </Text>
                    <View style={styles.optionsContainer}>
                      {question.options.map((option, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionButton,
                            {
                              backgroundColor:
                                userAnswers[question.id] === index
                                  ? colors.primary + '20'
                                  : colors.surface,
                              borderColor:
                                userAnswers[question.id] === index
                                  ? colors.primary
                                  : '#E5E7EB',
                            },
                          ]}
                          onPress={() => handleAnswer(question.id, index)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              {
                                color:
                                  userAnswers[question.id] === index
                                    ? colors.primary
                                    : colors.text,
                              },
                            ]}
                          >
                            {option}
                          </Text>
                          {userAnswers[question.id] === index && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSubmitQuiz}
                >
                  <Text style={styles.submitButtonText}>Submit Quiz</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {quizzes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={64} color={colors.primary} />
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No quizzes yet
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                Create a quiz by uploading a file
              </Text>
            </View>
          ) : (
            quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={[
                  styles.quizCard,
                  { backgroundColor: colors.surface, borderColor: '#E5E7EB' },
                ]}
                onPress={() => handleQuizSelect(quiz)}
              >
                <View style={styles.quizCardHeader}>
                  <Ionicons name="book" size={24} color={colors.primary} />
                  <View style={styles.quizCardInfo}>
                    <Text style={[styles.quizCardTitle, { color: colors.text }]}>
                      {quiz.title}
                    </Text>
                    <Text style={[styles.quizCardSubject, { color: colors.textSecondary }]}>
                      {quiz.subject}
                    </Text>
                  </View>
                </View>
                <View style={styles.quizCardFooter}>
                  <Text style={[styles.quizCardDate, { color: colors.textSecondary }]}>
                    Created: {new Date(quiz.created_at).toLocaleDateString()}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  quizHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  quizSubject: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  resultCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366F120',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultPercentage: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6366F1',
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
  submitButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
  },
  quizCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  quizCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quizCardInfo: {
    flex: 1,
  },
  quizCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  quizCardSubject: {
    fontSize: 12,
  },
  quizCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  quizCardDate: {
    fontSize: 12,
  },
});