import { Tabs } from 'expo-router';
import React from 'react';
import { usePathname } from 'expo-router';
import BottomNavbar from '@/components/BottomNavbar';

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (
        <BottomNavbar 
          {...props} 
          currentRoute={pathname} 
        />
      )}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="activities"
        options={{ title: 'Activities' }}
      />
      <Tabs.Screen
        name="ai-assistant"
        options={{ title: 'AI Assistant' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore' }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ title: 'Quizzes' }}
      />
    </Tabs>
  );
}
