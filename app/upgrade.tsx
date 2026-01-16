// Upgrade Screen - Pro subscription modal (mock, no real payments)
import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { PrimaryButton, Card, PressableScale } from '../src/components';
import { useAppStore } from '../src/store/useAppStore';
import { useReducedMotion } from '../src/hooks';
import { colors, spacing, typography, borderRadius } from '../src/constants/theme';

const FEATURES = [
  {
    title: 'Unlimited Analyses',
    description: 'No weekly limits on argument analysis',
  },
  {
    title: 'Up to 5 Parties',
    description: 'Analyze complex multi-party disputes',
  },
  {
    title: 'Priority Processing',
    description: 'Faster analysis with priority queue',
  },
  {
    title: 'Advanced Insights',
    description: 'Deep weekly reports and patterns',
  },
  {
    title: 'Export Options',
    description: 'PDF and text export of analyses',
  },
];

export default function UpgradeScreen() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const togglePro = useAppStore((s) => s.togglePro);
  const isPro = useAppStore((s) => s.settings.isPro);

  const handleClose = () => {
    router.back();
  };

  const handleSubscribe = () => {
    // Mock: just toggle pro status
    togglePro();
    router.back();
  };

  const handleRestore = () => {
    // Mock: would restore purchases
    togglePro();
    router.back();
  };

  if (isPro) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleClose} hitSlop={12}>
            <Text style={styles.closeButton}>Close</Text>
          </Pressable>
        </View>
        <View style={styles.alreadyProContainer}>
          <Text style={styles.alreadyProTitle}>You're Already Pro!</Text>
          <Text style={styles.alreadyProText}>
            Enjoy unlimited analyses and all premium features.
          </Text>
          <PrimaryButton label="Continue" onPress={handleClose} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Pressable onPress={handleClose} hitSlop={12}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(0).duration(400)}
          style={styles.hero}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proBadge}
          >
            <Text style={styles.proBadgeText}>PRO</Text>
          </LinearGradient>

          <Text style={styles.heroTitle}>Unlock Verdict+ Pro</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited access to all features
          </Text>
        </Animated.View>

        {/* Features */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(400)}
          style={styles.featuresSection}
        >
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureCheck}>
                <Text style={styles.featureCheckText}>✓</Text>
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Pricing */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(400)}
          style={styles.pricingSection}
        >
          <Card padding="lg" variant="elevated">
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>$4.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.priceNote}>Cancel anytime</Text>
          </Card>

          <Card padding="lg" variant="outline" style={styles.yearlyCard}>
            <View style={styles.yearlyHeader}>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>SAVE 40%</Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>$35.99</Text>
              <Text style={styles.pricePeriod}>/year</Text>
            </View>
            <Text style={styles.priceNote}>Best value</Text>
          </Card>
        </Animated.View>

        {/* CTA */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(400)}
          style={styles.ctaSection}
        >
          <PrimaryButton
            label="Start Free Trial"
            onPress={handleSubscribe}
            size="large"
          />
          <Text style={styles.trialNote}>
            7-day free trial, then $4.99/month
          </Text>

          <Pressable onPress={handleRestore} style={styles.restoreLink}>
            <Text style={styles.restoreLinkText}>Restore Purchase</Text>
          </Pressable>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(400).duration(400)}
          style={styles.disclaimer}
        >
          <Text style={styles.disclaimerText}>
            This is a demo app. No real payment will be processed. Tapping
            "Start Free Trial" will simulate a Pro subscription for testing
            purposes.
          </Text>
        </Animated.View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 50,
  },
  closeButton: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  proBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  proBadgeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  featureCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.successMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheckText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  pricingSection: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  priceAmount: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  pricePeriod: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  priceNote: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  yearlyCard: {
    borderColor: colors.accent,
  },
  yearlyHeader: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  saveBadge: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  saveBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  ctaSection: {
    marginBottom: spacing.xxl,
  },
  trialNote: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  restoreLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  restoreLinkText: {
    fontSize: typography.sizes.sm,
    color: colors.accent,
  },
  disclaimer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  disclaimerText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.sizes.sm * typography.lineHeights.relaxed,
  },
  alreadyProContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  alreadyProTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  alreadyProText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
