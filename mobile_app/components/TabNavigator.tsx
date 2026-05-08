import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavbar from './BottomNavbar';
import { usePathname } from 'expo-router';

interface TabNavigatorProps {
  children: React.ReactNode;
}

export default function TabNavigator({ children }: TabNavigatorProps) {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {children}
      <BottomNavbar currentRoute={pathname} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
