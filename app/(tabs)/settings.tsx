// Settings Tab - Design presets, preferences, data management
import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Card, PressableScale } from '../../src/components';
import { Toast, useToast } from '../../src/components/Toast';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme, PRESET_LIST, type DesignPreset } from '../../src/context/ThemeContext';
import { loadAnalyses, clearAllData, importAnalyses, type ImportMode } from '../../src/services/storage';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography } from '../../src/constants/theme';

// Preview tile for design preset
function PresetPreviewTile({
  presetId,
  name,
  description,
  isSelected,
  onSelect,
}: {
  presetId: DesignPreset;
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { tokens } = useTheme();
  const preset = PRESET_LIST.find(p => p.id === presetId)!;
  const previewTokens = preset.tokens;

  return (
    <PressableScale onPress={onSelect} style={styles.presetTile}>
      <View style={[
        styles.presetPreview,
        {
          borderRadius: previewTokens.radius.lg,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? colors.accent : colors.surfaceBorder,
          backgroundColor: isSelected ? colors.surfaceElevated : colors.surface,
        }
      ]}>
        {/* Mini preview card */}
        <View style={[
          styles.miniCard,
          {
            borderRadius: previewTokens.radius.md,
            padding: previewTokens.spacing.xs,
            backgroundColor: colors.backgroundSecondary,
            borderWidth: previewTokens.card.borderWidth,
            borderColor: colors.surfaceBorder,
            shadowOpacity: previewTokens.card.shadowOpacity,
            shadowRadius: previewTokens.card.shadowRadius / 3,
            shadowOffset: { width: 0, height: previewTokens.card.shadowOffsetY / 2 },
          }
        ]}>
          <View style={[styles.miniLine, { width: '80%' }]} />
          <View style={[styles.miniLine, { width: '60%' }]} />
        </View>
        {/* Mini button */}
        <View style={[
          styles.miniButton,
          {
            borderRadius: previewTokens.radius.sm,
            height: 12,
            backgroundColor: colors.accent,
          }
        ]} />
        {/* Selected indicator */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          </View>
        )}
      </View>
      <Text style={[
        styles.presetName,
        { fontSize: tokens.typography.sm },
        isSelected && styles.presetNameSelected
      ]}>
        {name}
      </Text>
      <Text style={[styles.presetDesc, { fontSize: tokens.typography.xs }]}>
        {description}
      </Text>
    </PressableScale>
  );
}

export default function SettingsTab() {
  const router = useRouter();
  const { tokens, preset, setPreset, reduceMotion } = useTheme();
  const { visible: toastVisible, message: toastMessage, showToast, hideToast } = useToast();

  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const togglePro = useAppStore((s) => s.togglePro);
  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const loadHistory = useAppStore((s) => s.loadHistory);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const handlePresetSelect = useCallback((newPreset: DesignPreset) => {
    if (newPreset !== preset) {
      setPreset(newPreset);
      showToast(`Design updated to ${PRESET_LIST.find(p => p.id === newPreset)?.name}`);
    }
  }, [preset, setPreset, showToast]);

  const handleExportHistory = useCallback(async () => {
    if (analysisSummaries.length === 0) {
      Alert.alert('No Data', 'You have no analyses to export yet.');
      return;
    }

    setIsExporting(true);

    try {
      const analyses = await loadAnalyses();

      const exportData = {
        exportedAt: new Date().toISOString(),
        appVersion,
        totalAnalyses: analyses.length,
        analyses: analyses,
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      if (Platform.OS === 'web') {
        await Share.share({
          message: jsonString,
          title: 'Verdict+ Export',
        });
      } else {
        const fileName = `verdict-plus-export-${Date.now()}.json`;
        const exportFile = new File(Paths.document, fileName);
        await exportFile.write(jsonString);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(exportFile.uri, {
            mimeType: 'application/json',
            dialogTitle: 'Export Verdict+ History',
          });
        } else {
          Alert.alert('Export Complete', 'File saved to app documents.');
        }
      }

      showToast('History exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [analysisSummaries, appVersion, showToast]);

  const handleImportHistory = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      // Show import mode selection
      Alert.alert(
        'Import Mode',
        'How would you like to import this data?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Merge',
            onPress: () => performImport(file.uri, 'merge'),
          },
          {
            text: 'Replace All',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirm Replace',
                'This will delete all existing analyses and replace them with the imported data. Continue?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Replace',
                    style: 'destructive',
                    onPress: () => performImport(file.uri, 'replace'),
                  },
                ]
              );
            },
          },
        ]
      );
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Could not open file picker. Please try again.');
    }
  }, []);

  const performImport = useCallback(async (uri: string, mode: ImportMode) => {
    setIsImporting(true);

    try {
      // Read file content
      const response = await fetch(uri);
      const jsonString = await response.text();

      const result = await importAnalyses(jsonString, mode);

      if (result.success) {
        await loadHistory();
        showToast(result.message);
      } else {
        Alert.alert('Import Failed', result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Import Failed', 'Could not read the file. Please try again.');
    } finally {
      setIsImporting(false);
    }
  }, [loadHistory, showToast]);

  const handleDeleteAllHistory = useCallback(() => {
    if (analysisSummaries.length === 0) {
      Alert.alert('No Data', 'You have no analyses to delete.');
      return;
    }

    Alert.alert(
      'Delete All History',
      `Are you sure you want to delete all ${analysisSummaries.length} analyses? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              await clearAllData();
              await loadHistory();
              showToast('All history deleted');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Could not delete data. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [analysisSummaries, loadHistory, showToast]);

  const handleUpgrade = () => {
    router.push('/upgrade');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onHide={hideToast}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: tokens.spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.duration(300)}
          style={[styles.header, { marginTop: tokens.spacing.xl, marginBottom: tokens.spacing.xxl }]}
        >
          <Text style={[styles.headerTitle, { fontSize: tokens.typography.xxxl }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { fontSize: tokens.typography.sm }]}>
            Customize your experience
          </Text>
        </Animated.View>

        {/* Design Presets Section - Featured! */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(50).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxl }]}
        >
          <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.md }]}>
            Design Style
          </Text>
          <Text style={[styles.sectionSubtitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.lg }]}>
            Choose a visual style for the app
          </Text>

          <View style={styles.presetsGrid}>
            {PRESET_LIST.map((p) => (
              <PresetPreviewTile
                key={p.id}
                presetId={p.id}
                name={p.name}
                description={p.description}
                isSelected={preset === p.id}
                onSelect={() => handlePresetSelect(p.id)}
              />
            ))}
          </View>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(100).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxl }]}
        >
          <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.md }]}>
            Preferences
          </Text>
          <Card padding="none">
            <View style={[styles.settingRow, { padding: tokens.spacing.lg }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { fontSize: tokens.typography.base }]}>
                  Haptic Feedback
                </Text>
                <Text style={[styles.settingDescription, { fontSize: tokens.typography.sm }]}>
                  Vibration on interactions
                </Text>
              </View>
              <Switch
                value={settings.hapticsEnabled}
                onValueChange={(value) => updateSettings({ hapticsEnabled: value })}
                trackColor={{ false: colors.surface, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            </View>

            <View style={styles.separator} />

            <View style={[styles.settingRow, { padding: tokens.spacing.lg }]}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { fontSize: tokens.typography.base }]}>
                  Reduce Motion
                </Text>
                <Text style={[styles.settingDescription, { fontSize: tokens.typography.sm }]}>
                  Minimize animations
                </Text>
              </View>
              <Switch
                value={settings.reduceMotion}
                onValueChange={(value) => updateSettings({ reduceMotion: value })}
                trackColor={{ false: colors.surface, true: colors.accent }}
                thumbColor={colors.textPrimary}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Pro Status Card */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(150).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxl }]}
        >
          <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.md }]}>
            Subscription
          </Text>
          <Card padding="lg" variant="elevated">
            <View style={styles.proRow}>
              <View style={styles.proInfo}>
                <View style={styles.proTitleRow}>
                  <Text style={[styles.proTitle, { fontSize: tokens.typography.lg }]}>
                    {settings.isPro ? 'Pro Member' : 'Free Plan'}
                  </Text>
                  {settings.isPro && (
                    <View style={[styles.proBadge, { borderRadius: tokens.radius.sm }]}>
                      <Text style={[styles.proBadgeText, { fontSize: tokens.typography.xs }]}>PRO</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.proSubtitle, { fontSize: tokens.typography.sm }]}>
                  {settings.isPro
                    ? 'Unlimited analyses & premium features'
                    : `${5 - settings.analysesThisWeek}/5 analyses this week`}
                </Text>
              </View>
              {!settings.isPro && (
                <PressableScale
                  onPress={handleUpgrade}
                  style={[styles.upgradeButton, { borderRadius: tokens.radius.md }]}
                >
                  <Text style={[styles.upgradeButtonText, { fontSize: tokens.typography.sm }]}>
                    Upgrade
                  </Text>
                </PressableScale>
              )}
            </View>
          </Card>

          <View style={styles.devToggle}>
            <Text style={[styles.devToggleLabel, { fontSize: tokens.typography.sm }]}>
              Dev: Toggle Pro
            </Text>
            <Switch
              value={settings.isPro}
              onValueChange={togglePro}
              trackColor={{ false: colors.surface, true: colors.accent }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </Animated.View>

        {/* Data Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(200).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxl }]}
        >
          <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.md }]}>
            Data
          </Text>
          <Card padding="none">
            <PressableScale
              onPress={handleExportHistory}
              disabled={isExporting}
              style={[styles.dataButton, { padding: tokens.spacing.lg }]}
            >
              <View style={styles.dataButtonContent}>
                <Text style={styles.dataButtonIcon}>📤</Text>
                <View style={styles.dataButtonInfo}>
                  <Text style={[styles.dataButtonLabel, { fontSize: tokens.typography.base }]}>
                    Export History
                  </Text>
                  <Text style={[styles.dataButtonDescription, { fontSize: tokens.typography.sm }]}>
                    Save all analyses as JSON
                  </Text>
                </View>
              </View>
              <Text style={[styles.dataButtonArrow, { fontSize: tokens.typography.lg }]}>
                {isExporting ? '...' : '→'}
              </Text>
            </PressableScale>

            <View style={styles.separator} />

            <PressableScale
              onPress={handleImportHistory}
              disabled={isImporting}
              style={[styles.dataButton, { padding: tokens.spacing.lg }]}
            >
              <View style={styles.dataButtonContent}>
                <Text style={styles.dataButtonIcon}>📥</Text>
                <View style={styles.dataButtonInfo}>
                  <Text style={[styles.dataButtonLabel, { fontSize: tokens.typography.base }]}>
                    Import History
                  </Text>
                  <Text style={[styles.dataButtonDescription, { fontSize: tokens.typography.sm }]}>
                    Load analyses from JSON file
                  </Text>
                </View>
              </View>
              <Text style={[styles.dataButtonArrow, { fontSize: tokens.typography.lg }]}>
                {isImporting ? '...' : '→'}
              </Text>
            </PressableScale>

            <View style={styles.separator} />

            <PressableScale
              onPress={handleDeleteAllHistory}
              disabled={isDeleting}
              style={[styles.dataButton, { padding: tokens.spacing.lg }]}
            >
              <View style={styles.dataButtonContent}>
                <Text style={styles.dataButtonIcon}>🗑️</Text>
                <View style={styles.dataButtonInfo}>
                  <Text style={[styles.dataButtonLabel, styles.dataButtonLabelDanger, { fontSize: tokens.typography.base }]}>
                    Delete All History
                  </Text>
                  <Text style={[styles.dataButtonDescription, { fontSize: tokens.typography.sm }]}>
                    Permanently remove all analyses
                  </Text>
                </View>
              </View>
              <Text style={[styles.dataButtonArrow, styles.dataButtonArrowDanger, { fontSize: tokens.typography.lg }]}>
                {isDeleting ? '...' : '→'}
              </Text>
            </PressableScale>
          </Card>
        </Animated.View>

        {/* About Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(250).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxxl * 2 }]}
        >
          <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm, marginBottom: tokens.spacing.md }]}>
            About
          </Text>
          <Card padding="lg">
            <View style={styles.aboutHeader}>
              <Text style={[styles.aboutTitle, { fontSize: tokens.typography.lg }]}>Verdict+</Text>
              <Text style={[styles.aboutVersion, { fontSize: tokens.typography.sm }]}>
                Version {appVersion}
              </Text>
            </View>
            <Text style={[styles.aboutText, { fontSize: tokens.typography.sm }]}>
              AI-powered argument and decision analysis.
            </Text>
            <View style={[styles.disclaimer, { borderRadius: tokens.radius.md, padding: tokens.spacing.md }]}>
              <Text style={[styles.disclaimerText, { fontSize: tokens.typography.xs }]}>
                This app provides analysis tools only and does not constitute legal, medical,
                or professional advice. All data is stored locally on your device.
              </Text>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 64,
  },
  header: {},
  headerTitle: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: colors.textSecondary,
  },
  section: {},
  sectionTitle: {
    fontWeight: typography.weights.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
  },
  // Design Presets
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetTile: {
    width: '47%',
    marginBottom: 8,
  },
  presetPreview: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    position: 'relative',
  },
  miniCard: {
    width: '70%',
    height: 30,
    justifyContent: 'center',
    gap: 3,
    shadowColor: '#000',
  },
  miniLine: {
    height: 4,
    backgroundColor: colors.textTertiary,
    borderRadius: 2,
    marginLeft: 6,
  },
  miniButton: {
    width: '50%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  presetName: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
  },
  presetNameSelected: {
    color: colors.accent,
  },
  presetDesc: {
    color: colors.textTertiary,
  },
  // Settings rows
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  settingDescription: {
    color: colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: 16,
  },
  // Pro section
  proRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  proInfo: {
    flex: 1,
  },
  proTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proTitle: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  proBadge: {
    backgroundColor: colors.successMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proBadgeText: {
    fontWeight: typography.weights.bold,
    color: colors.success,
  },
  proSubtitle: {
    color: colors.textSecondary,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  upgradeButtonText: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  devToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  devToggleLabel: {
    color: colors.textTertiary,
  },
  // Data buttons
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dataButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  dataButtonIcon: {
    fontSize: 24,
  },
  dataButtonInfo: {
    flex: 1,
  },
  dataButtonLabel: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  dataButtonLabelDanger: {
    color: colors.error,
  },
  dataButtonDescription: {
    color: colors.textSecondary,
  },
  dataButtonArrow: {
    color: colors.textTertiary,
  },
  dataButtonArrowDanger: {
    color: colors.error,
  },
  // About
  aboutHeader: {
    marginBottom: 12,
  },
  aboutTitle: {
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  aboutVersion: {
    color: colors.textTertiary,
  },
  aboutText: {
    color: colors.textSecondary,
    marginBottom: 12,
  },
  disclaimer: {
    backgroundColor: colors.backgroundTertiary,
  },
  disclaimerText: {
    color: colors.textTertiary,
    lineHeight: 16,
  },
});
