// Tab bar layout for main navigation
// Tabs: Home, Analyze (CTA), History, Settings
// Uses theme tokens for preset-aware styling
import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHaptics } from '../../src/hooks';
import { useTheme } from '../../src/context/ThemeContext';
import { colors, typography } from '../../src/constants/theme';

export default function TabsLayout() {
  const { trigger } = useHaptics();
  const { tokens, hapticsEnabled, getAccentColor } = useTheme();

  // Get preset-specific accent color
  const accentColor = getAccentColor();

  const handleTabPress = () => {
    if (hapticsEnabled) {
      trigger('selection');
    }
  };

  // Dynamic styles based on theme tokens and preset palette
  const dynamicStyles = useMemo(() => ({
    tabBar: {
      backgroundColor: colors.backgroundSecondary,
      borderTopWidth: 1,
      borderTopColor: colors.surfaceBorder,
      height: Platform.OS === 'ios' ? tokens.tabBar.height : tokens.tabBar.height - 24,
      paddingTop: tokens.spacing.sm,
      paddingBottom: Platform.OS === 'ios' ? tokens.spacing.xxl : tokens.spacing.sm,
    },
    tabBarLabel: {
      fontSize: tokens.tabBar.labelSize,
      fontWeight: typography.weights.medium as '500',
      marginTop: tokens.spacing.xs,
    },
    tabBarItem: {
      paddingTop: tokens.spacing.xs,
    },
    // CTA button in center - adapts to preset
    analyzeIconBackground: {
      width: 44 + (tokens.spacing.sm - 8),
      height: 44 + (tokens.spacing.sm - 8),
      borderRadius: tokens.radius.full,
      backgroundColor: colors.surface,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: tokens.button.borderWidth || 2,
      borderColor: accentColor,
      marginTop: -8,
    },
    analyzeIconBackgroundActive: {
      backgroundColor: accentColor,
      borderColor: accentColor,
    },
    analyzeLabel: {
      color: accentColor,
      fontWeight: typography.weights.semibold,
    },
  }), [tokens, accentColor]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: dynamicStyles.tabBar,
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: dynamicStyles.tabBarLabel,
        tabBarItemStyle: dynamicStyles.tabBarItem,
        // Respect preset's showLabel setting
        tabBarShowLabel: tokens.tabBar.showLabel,
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={tokens.tabBar.iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analyze"
        options={{
          title: 'Analyze',
          tabBarIcon: ({ focused }) => (
            <View style={styles.analyzeIconContainer}>
              <View style={[
                dynamicStyles.analyzeIconBackground,
                focused && dynamicStyles.analyzeIconBackgroundActive
              ]}>
                <Ionicons
                  name={focused ? 'add-circle' : 'add-circle-outline'}
                  size={tokens.tabBar.iconSize + 4}
                  color={focused ? colors.textPrimary : accentColor}
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: [dynamicStyles.tabBarLabel, dynamicStyles.analyzeLabel],
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={tokens.tabBar.iconSize}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={tokens.tabBar.iconSize}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  analyzeIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
