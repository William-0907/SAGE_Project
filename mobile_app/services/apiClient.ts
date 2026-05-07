import { API_BASE_URL } from '../config/api';
import { getToken } from './authService';

/**
 * Make authenticated API requests with token
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `API error: ${response.status}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    console.error(`API call failed: ${url}`, error);
    throw error;
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUser() {
  return apiCall('/users/me/');
}

/**
 * Ask SAGE AI assistant
 */
export async function askSAGE(prompt: string) {
  return apiCall('/ai/ask/', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

/**
 * Get user activities
 */
export async function getActivities() {
  return apiCall('/users/activities/');
}

/**
 * Get user badges
 */
export async function getBadges() {
  return apiCall('/users/badges/');
}
