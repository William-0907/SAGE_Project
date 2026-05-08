import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: number;
  title: string;
  questions: QuizQuestion[];
  subject: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
  };
}

/**
 * Fetch all quizzes
 */
export async function getQuizzes(): Promise<Quiz[]> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/quizzes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

/**
 * Fetch a specific quiz by ID
 */
export async function getQuizById(quizId: number): Promise<Quiz> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/quizzes/${quizId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
}

/**
 * Create a new quiz (mock AI response for now)
 */
export async function createQuiz(
  title: string,
  questions: QuizQuestion[],
  subject: string
): Promise<Quiz> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/quizzes/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        questions,
        subject,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create quiz');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw error;
  }
}

/**
 * Calculate quiz score
 */
export function calculateScore(
  quiz: Quiz,
  userAnswers: { [questionId: number]: number }
): { score: number; total: number; percentage: number } {
  let correct = 0;
  const total = quiz.questions.length;

  quiz.questions.forEach((question) => {
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
}