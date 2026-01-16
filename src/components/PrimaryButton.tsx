// PrimaryButton - Premium animated button with all micro-interactions
// Features: press scale, label micro-scale, breathing pulse, loading state, haptics
import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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
import { colors, borderRadius, spacing, typography, animation } from '../constants/theme';

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

  // Animation values
  const buttonScale = useSharedValue(1);
  const labelScale = useSharedValue(1);
  const breathingScale = useSharedValue(1);
  const loadingOpacity = useSharedValue(0);
  const labelOpacity = useSharedValue(1);

  const isActive = !disabled && !loading;

  // Breathing animation - subtle idle pulse when enabled and not loading
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
    } else {
      cancelAnimation(breathingScale);
      breathingScale.value = withTiming(1, { duration: 200 });
    }

    return () => {
      cancelAnimation(breathingScale);
    };
  }, [isActive, reduceMotion, breathingScale]);

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
        buttonScale.value = withSpring(0.97, animation.spring.stiff);
        labelScale.value = withSpring(1.03, animation.spring.stiff);
      }
    })
    .onFinalize((_, success) => {
      if (!reduceMotion) {
        buttonScale.value = withSpring(1, animation.spring.default);
        labelScale.value = withSpring(1, animation.spring.default);
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

  const isLarge = size === 'large';
  const buttonHeight = isLarge ? 56 : 48;
  const fontSize = isLarge ? typography.sizes.md : typography.sizes.base;

  const renderContent = () => (
    <View style={[styles.content, { height: buttonHeight }]}>
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
    { height: buttonHeight },
    variant === 'outline' && styles.outlineButton,
    variant === 'solid' && styles.solidButton,
  ];

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, buttonAnimatedStyle]}>
        {variant === 'gradient' ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, { height: buttonHeight }]}
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
    borderRadius: borderRadius.lg,
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
  },
  label: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
