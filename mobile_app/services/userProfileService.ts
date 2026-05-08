import { API_BASE_URL } from '../config/api';
import * as SecureStore from 'expo-secure-store';

export interface UserBadge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  created_at: string;
}

export interface UserActivity {
  id: number;
  title: string;
  description: string;
  activity_type: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  level: number;
  current_xp: number;
  total_points: number;
  streak: number;
  courses_completed: number;
  study_hours: number;
  quizzes_taken: number;
  group_activities_count: number;
  next_level_xp: number;
  badges: UserBadge[];
  date_joined: string;
}

/**
 * Fetch the current user's profile data
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Fetch user's badges
 */
export async function fetchUserBadges(userId: number): Promise<UserBadge[]> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/badges/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user badges');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user badges:', error);
    throw error;
  }
}

/**
 * Fetch user's activities
 */
export async function fetchUserActivities(userId: number): Promise<UserActivity[]> {
  try {
    const token = await SecureStore.getItemAsync('auth_token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}/activities/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user activities');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
}

/**
 * Get user's display name (prioritize full name, fallback to username)
 */
export function getDisplayName(user: UserProfile): string {
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.username;
}