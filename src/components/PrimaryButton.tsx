// PrimaryButton - Premium animated button with all micro-interactions
// Features: press scale, label micro-scale, breathing pulse, glow effect, loading state, haptics
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useHaptics } from '../hooks/useHaptics';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, animation } from '../constants/theme';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'gradient' | 'solid' | 'outline';
  size?: 'default' | 'large';
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'gradient',
  size = 'default',
}: PrimaryButtonProps) {
  const reduceMotion = useReducedMotion();
  const { trigger } = useHaptics();
  const { tokens } = useTheme();

  // Animation values
  const buttonScale = useSharedValue(1);
  const labelScale = useSharedValue(1);
  const breathingScale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const pressHighlight = useSharedValue(0);

  const isActive = !disabled && !loading;

  // Breathing animation with glow - subtle idle pulse when enabled and not loading
  useEffect(() => {
    if (isActive && !reduceMotion) {
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      // Glow pulsing in sync
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(breathingScale);
      cancelAnimation(glowIntensity);
      breathingScale.value = withTiming(1, { duration: 200 });
      glowIntensity.value = withTiming(0, { duration: 200 });
    }

    return () => {
      cancelAnimation(breathingScale);
      cancelAnimation(glowIntensity);
    };
  }, [isActive, reduceMotion, breathingScale, glowIntensity]);

  // Loading state transition
  useEffect(() => {
    if (loading) {
      loadingOpacity.value = withTiming(1, { duration: 150 });
      labelOpacity.value = withTiming(0, { duration: 150 });
    } else {
      loadingOpacity.value = withTiming(0, { duration: 150 });
      labelOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [loading, loadingOpacity, labelOpacity]);

  const handlePress = () => {
    trigger('light');
    onPress();
  };

  const gesture = Gesture.Tap()
    .enabled(isActive)
    .onBegin(() => {
      if (!reduceMotion) {
        buttonScale.value = withSpring(0.96, animation.spring.stiff);
        labelScale.value = withSpring(1.04, animation.spring.stiff);
        pressHighlight.value = withTiming(1, { duration: 100 });
        glowIntensity.value = withTiming(1.5, { duration: 100 }); // Intensify glow on press
      }
    })
    .onFinalize((_, success) => {
      if (!reduceMotion) {
        buttonScale.value = withSpring(1, animation.spring.bouncy);
        labelScale.value = withSpring(1, animation.spring.bouncy);
        pressHighlight.value = withTiming(0, { duration: 200 });
        // Return to normal glow pulsing
        glowIntensity.value = withTiming(0.5, { duration: 200 });
      }
      if (success) {
        handlePress();
      }
    });

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: disabled ? 0.55 : 1,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: labelScale.value * breathingScale.value },
    ],
    opacity: labelOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
    position: 'absolute' as const,
  }));

  // Glow effect - pulsing shadow behind the button (iOS shadow, Android elevation workaround)
  const glowAnimatedStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(glowIntensity.value, [0, 1, 1.5], [0, 0.4, 0.6]);
    const shadowRadius = interpolate(glowIntensity.value, [0, 1, 1.5], [0, 12, 18]);

    return Platform.OS === 'ios'
      ? {
          shadowColor: colors.accent,
          shadowOpacity,
          shadowRadius,
          shadowOffset: { width: 0, height: 4 },
        }
      : {
          // Android: Use elevation and a subtle background glow
          elevation: interpolate(glowIntensity.value, [0, 1, 1.5], [0, 8, 12]),
        };
  });

  // Press highlight overlay
  const highlightAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pressHighlight.value, [0, 1], [0, 0.15]),
  }));

  const isLarge = size === 'large';
  const buttonHeight = isLarge ? 56 : 48;
  const fontSize = isLarge ? typography.sizes.md : typography.sizes.base;

  const renderContent = () => (
    <View style={[styles.content, { height: buttonHeight }]}>
      {/* Press highlight overlay */}
      <Animated.View style={[styles.highlightOverlay, highlightAnimatedStyle]} />
      <Animated.Text
        style={[
          styles.label,
          { fontSize },
          labelAnimatedStyle,
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View style={loadingAnimatedStyle}>
        <ActivityIndicator color={colors.textPrimary} size="small" />
      </Animated.View>
    </View>
  );

  const buttonStyle = [
    styles.button,
    { height: buttonHeight, borderRadius: tokens.radius.lg },
    variant === 'outline' && styles.outlineButton,
    variant === 'solid' && styles.solidButton,
  ];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.container, buttonAnimatedStyle, glowAnimatedStyle]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{
          disabled: disabled,
          busy: loading,
        }}
      >
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, { height: buttonHeight, borderRadius: tokens.radius.lg }]}
          >
            {renderContent()}
          </LinearGradient>
        ) : (
          <View style={buttonStyle}>
            {renderContent()}
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  button: {
    overflow: 'hidden',
  },
  solidButton: {
    backgroundColor: colors.accent,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    position: 'relative',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.textPrimary,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
