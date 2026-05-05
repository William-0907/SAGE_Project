import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showAITip, setShowAITip] = useState(true);
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#7C3AED', '#8B5CF6', '#4F46E5']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="sparkles-outline" size={40} color="#7C3AED" />
            </View>
            <Text style={styles.title}>SAGE</Text>
            <Text style={styles.subtitle}>
              Smart Assistant for Group-Based Education
            </Text>
          </View>

          {/* AI Tip */}
          {showAITip && (
            <View style={styles.aiCard}>
              <View style={styles.aiRow}>
                <View style={styles.aiIcon}>
                  <Ionicons name="sparkles-outline" size={16} color="#3B0764" />
                </View>
                <Text style={styles.aiText}>
                  Welcome! Sign in to continue.
                </Text>
                <TouchableOpacity onPress={() => setShowAITip(false)}>
                  <Text style={styles.closeText}>×</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>

            {isSignUp && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                <TextInput placeholder="Full Name" style={styles.input} />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Email"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
              <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                // After successful authentication
                router.replace('/dashboard');
              }}
            >
              <Text style={styles.loginButtonText}>
                {isSignUp ? 'Sign Up' : 'Log In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? Log In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            Works offline via LAN or hotspot
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, justifyContent: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoCircle: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
  },
  title: { fontSize: 32, color: 'white', fontWeight: 'bold' },
  subtitle: {
    color: '#E9D5FF',
    textAlign: 'center',
    marginTop: 4,
  },
  aiCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  aiRow: { flexDirection: 'row', alignItems: 'center' },
  aiIcon: {
    backgroundColor: '#FACC15',
    padding: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  aiText: { flex: 1, color: 'white', fontSize: 13 },
  closeText: { color: 'white', fontSize: 18, marginLeft: 8 },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
  },
  heading: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  input: { flex: 1, marginLeft: 8 },
  loginButton: {
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: { color: 'white', fontWeight: '600' },
  toggleText: {
    textAlign: 'center',
    marginTop: 14,
    color: '#7C3AED',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 20,
    fontSize: 12,
  },
});