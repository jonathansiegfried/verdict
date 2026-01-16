// Root layout for Verdict+ app
// Sets up providers, loads settings, and configures navigation
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from '../src/store/useAppStore';
import { ThemeProvider } from '../src/context/ThemeContext';
import { colors } from '../src/constants/theme';

// Inner component that uses the store (needs to be inside providers)
function RootLayoutInner() {
  const loadAppSettings = useAppStore((s) => s.loadAppSettings);
  const loadHistory = useAppStore((s) => s.loadHistory);
  const settingsLoaded = useAppStore((s) => s.settingsLoaded);

  // Load settings and history on app start
  useEffect(() => {
    loadAppSettings();
    loadHistory();
  }, [loadAppSettings, loadHistory]);

  // Show nothing while loading (could add splash screen here)
  if (!settingsLoaded) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          // Default: horizontal slide for push navigation
          animation: 'slide_from_right',
        }}
      >
        {/* Tab navigation group - no animation when switching */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: 'none',
          }}
        />

        {/* PUSH SCREENS: slide_from_right */}
        <Stack.Screen
          name="input"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="verdict"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="compare"
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* TRANSITION SCREENS: fade (no gesture) */}
        <Stack.Screen
          name="analyzing"
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />

        {/* MODAL SCREENS: slide_from_bottom */}
        <Stack.Screen
          name="upgrade"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <RootLayoutInner />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
