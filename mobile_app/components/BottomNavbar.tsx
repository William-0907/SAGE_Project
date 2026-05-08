import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
// import { Colors } from '@/constants/theme'; // Removed to use hardcoded Indigo theme

interface NavItem {
  name: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface BottomNavbarProps {
  currentRoute?: string;
  adaptToRoute?: (route: string) => Partial<NavbarConfig>;
}

interface NavbarConfig {
  showAllTabs?: boolean;
  highlightTab?: string;
  customItems?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { name: 'dashboard', label: 'Home', icon: 'home' },
  { name: 'activities', label: 'Activities', icon: 'list' },
  { name: 'ai-assistant', label: 'AI Assistant', icon: 'sparkles' },
  { name: 'profile', label: 'Profile', icon: 'person' },
];

export default function BottomNavbar({ currentRoute = 'index', adaptToRoute }: BottomNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Get adapted config for current route
  const config = adaptToRoute?.(currentRoute) || {};
  const { showAllTabs = true, highlightTab, customItems } = config;
  
  const navItems = customItems || DEFAULT_NAV_ITEMS;
  
  // Handle tab press
  const handleTabPress = (item: NavItem) => {
    router.push(item.name as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = pathname.includes(item.name);
          const isHighlighted = highlightTab === item.name;
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                (isActive || isHighlighted) && styles.activeNavItem,
              ]}
              onPress={() => handleTabPress(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.icon}
                size={24}
                // Updated Color Logic to match Theme
                color={isActive || isHighlighted ? '#6366F1' : '#9CA3AF'} 
              />
              <Text style={[
                styles.navLabel,
                isActive || isHighlighted ? styles.activeLabel : styles.inactiveLabel,
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // Consistent with reference screens
    paddingBottom: 10,
    paddingTop: 5,
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeNavItem: {
    // Updated Background to use Indigo tint with opacity
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
  },
  highlightedNavItem: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  activeLabel: {
    color: '#6366F1', // Updated Primary Color
  },
  inactiveLabel: {
    color: '#9CA3AF', // Gray-400 from reference
  },
});