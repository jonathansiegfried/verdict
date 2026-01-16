// Settings Tab - Design presets, preferences, data management, templates
import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Share,
  Platform,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Paths, File } from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Card, PressableScale, AnimatedSegmentedControl } from '../../src/components';
import { Toast, useToast } from '../../src/components/Toast';
import { useAppStore } from '../../src/store/useAppStore';
import { useTheme, PRESET_LIST, type DesignPreset } from '../../src/context/ThemeContext';
import { loadAnalyses, clearAllData, importAnalyses, type ImportMode } from '../../src/services/storage';
import * as DocumentPicker from 'expo-document-picker';
import { colors, typography, spacing, borderRadius, commentatorStyles, evidenceModes } from '../../src/constants/theme';
import type { AnalysisTemplate } from '../../src/types';
import type { CommentatorStyle, EvidenceMode } from '../../src/constants/theme';

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
  const { tokens, getAccentColor } = useTheme();
  const currentAccent = getAccentColor();
  // PRESET_LIST items ARE the tokens now (no nested .tokens property)
  const previewTokens = PRESET_LIST.find(p => p.id === presetId)!;
  // Get the preset's OWN accent color for the preview
  const presetAccent = previewTokens.palette.accent;

  return (
    <PressableScale onPress={onSelect} style={styles.presetTile}>
      <View style={[
        styles.presetPreview,
        {
          borderRadius: previewTokens.radius.lg,
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? currentAccent : colors.surfaceBorder,
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
        {/* Mini button - shows the PRESET's accent color (not current) */}
        <View style={[
          styles.miniButton,
          {
            borderRadius: previewTokens.radius.sm,
            height: 12,
            backgroundColor: presetAccent,
          }
        ]} />
        {/* Selected indicator */}
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Ionicons name="checkmark-circle" size={18} color={currentAccent} />
          </View>
        )}
      </View>
      <Text style={[
        styles.presetName,
        { fontSize: tokens.typography.sm },
        isSelected && { color: currentAccent }
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
  const { tokens, preset, setPreset, reduceMotion, getAccentColor } = useTheme();
  const accentColor = getAccentColor();
  const { visible: toastVisible, message: toastMessage, showToast, hideToast } = useToast();

  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const togglePro = useAppStore((s) => s.togglePro);
  const analysisSummaries = useAppStore((s) => s.analysisSummaries);
  const loadHistory = useAppStore((s) => s.loadHistory);

  // Templates
  const templates = useAppStore((s) => s.templates);
  const loadAllTemplates = useAppStore((s) => s.loadAllTemplates);
  const createTemplate = useAppStore((s) => s.createTemplate);
  const updateTemplate = useAppStore((s) => s.updateTemplate);
  const deleteTemplate = useAppStore((s) => s.deleteTemplate);

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AnalysisTemplate | null>(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateSides, setTemplateSides] = useState<{ label: string; placeholder?: string }[]>([
    { label: 'Side A', placeholder: '' },
    { label: 'Side B', placeholder: '' },
  ]);
  const [templateStyle, setTemplateStyle] = useState<CommentatorStyle>('neutral');
  const [templateEvidence, setTemplateEvidence] = useState<EvidenceMode>('light');

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  // Load templates on mount
  useEffect(() => {
    loadAllTemplates();
  }, [loadAllTemplates]);

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

  // Template handlers
  const resetTemplateForm = useCallback(() => {
    setTemplateTitle('');
    setTemplateDescription('');
    setTemplateSides([
      { label: 'Side A', placeholder: '' },
      { label: 'Side B', placeholder: '' },
    ]);
    setTemplateStyle('neutral');
    setTemplateEvidence('light');
    setEditingTemplate(null);
  }, []);

  const handleCreateTemplate = useCallback(() => {
    resetTemplateForm();
    setShowTemplateModal(true);
  }, [resetTemplateForm]);

  const handleEditTemplate = useCallback((template: AnalysisTemplate) => {
    setEditingTemplate(template);
    setTemplateTitle(template.title);
    setTemplateDescription(template.description || '');
    setTemplateSides(template.sides.map(s => ({ label: s.label, placeholder: s.placeholder || '' })));
    setTemplateStyle(template.commentatorStyle);
    setTemplateEvidence(template.evidenceMode);
    setShowTemplateModal(true);
  }, []);

  const handleDeleteTemplate = useCallback((template: AnalysisTemplate) => {
    Alert.alert(
      'Delete Template',
      `Are you sure you want to delete "${template.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(template.id);
            showToast('Template deleted');
          },
        },
      ]
    );
  }, [deleteTemplate, showToast]);

  const handleSaveTemplate = useCallback(async () => {
    if (!templateTitle.trim()) {
      Alert.alert('Error', 'Please enter a title for the template.');
      return;
    }

    if (templateSides.some(s => !s.label.trim())) {
      Alert.alert('Error', 'Please enter labels for all sides.');
      return;
    }

    const templateData = {
      title: templateTitle.trim(),
      description: templateDescription.trim() || undefined,
      sides: templateSides.map(s => ({
        label: s.label.trim(),
        placeholder: s.placeholder?.trim() || undefined,
      })),
      commentatorStyle: templateStyle,
      evidenceMode: templateEvidence,
    };

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateData);
        showToast('Template updated');
      } else {
        await createTemplate(templateData);
        showToast('Template created');
      }
      setShowTemplateModal(false);
      resetTemplateForm();
    } catch {
      Alert.alert('Error', 'Could not save template. Please try again.');
    }
  }, [
    templateTitle,
    templateDescription,
    templateSides,
    templateStyle,
    templateEvidence,
    editingTemplate,
    updateTemplate,
    createTemplate,
    showToast,
    resetTemplateForm,
  ]);

  const handleAddTemplateSide = useCallback(() => {
    if (templateSides.length >= 5) return;
    setTemplateSides([...templateSides, { label: `Side ${String.fromCharCode(65 + templateSides.length)}`, placeholder: '' }]);
  }, [templateSides]);

  const handleRemoveTemplateSide = useCallback((index: number) => {
    if (templateSides.length <= 2) return;
    setTemplateSides(templateSides.filter((_, i) => i !== index));
  }, [templateSides]);

  const updateTemplateSide = useCallback((index: number, updates: { label?: string; placeholder?: string }) => {
    setTemplateSides(templateSides.map((s, i) => i === index ? { ...s, ...updates } : s));
  }, [templateSides]);

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
          entering={reduceMotion ? undefined : FadeInDown.delay(tokens.motion.staggerDelay).duration(300).springify().damping(tokens.motion.springDamping)}
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
          entering={reduceMotion ? undefined : FadeInDown.delay(tokens.motion.staggerDelay * 2).duration(300).springify().damping(tokens.motion.springDamping)}
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
                trackColor={{ false: colors.surface, true: accentColor }}
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
                trackColor={{ false: colors.surface, true: accentColor }}
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
                  style={[styles.upgradeButton, { borderRadius: tokens.radius.md, backgroundColor: accentColor }]}
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
              trackColor={{ false: colors.surface, true: accentColor }}
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

        {/* Templates Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(250).duration(300)}
          style={[styles.section, { marginBottom: tokens.spacing.xxl }]}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { fontSize: tokens.typography.sm }]}>
              Templates
            </Text>
            <PressableScale
              onPress={handleCreateTemplate}
              style={[styles.addTemplateButton, { backgroundColor: accentColor }]}
            >
              <Text style={styles.addTemplateButtonText}>+ New</Text>
            </PressableScale>
          </View>

          {templates.length === 0 ? (
            <Card padding="lg">
              <View style={styles.emptyTemplates}>
                <Text style={styles.emptyTemplatesIcon}>📋</Text>
                <Text style={[styles.emptyTemplatesText, { fontSize: tokens.typography.sm }]}>
                  No templates yet
                </Text>
                <Text style={[styles.emptyTemplatesSubtext, { fontSize: tokens.typography.xs }]}>
                  Create templates for quick-starting analyses
                </Text>
              </View>
            </Card>
          ) : (
            <Card padding="none">
              {templates.map((template, index) => (
                <View key={template.id}>
                  {index > 0 && <View style={styles.separator} />}
                  <View style={[styles.templateRow, { padding: tokens.spacing.lg }]}>
                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateTitle, { fontSize: tokens.typography.base }]}>
                        {template.title}
                      </Text>
                      <Text style={[styles.templateMeta, { fontSize: tokens.typography.xs }]}>
                        {template.sides.length} sides · {template.commentatorStyle}
                        {template.useCount > 0 && ` · Used ${template.useCount}×`}
                      </Text>
                    </View>
                    <View style={styles.templateActions}>
                      <PressableScale
                        onPress={() => handleEditTemplate(template)}
                        style={styles.templateActionButton}
                      >
                        <Text style={styles.templateActionIcon}>✏️</Text>
                      </PressableScale>
                      <PressableScale
                        onPress={() => handleDeleteTemplate(template)}
                        style={styles.templateActionButton}
                      >
                        <Text style={styles.templateActionIcon}>🗑️</Text>
                      </PressableScale>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}
        </Animated.View>

        {/* About Section */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInDown.delay(300).duration(300)}
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

      {/* Template Create/Edit Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTemplateModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTemplateModal(false)}
        >
          <Pressable style={styles.templateModal} onPress={() => {}}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.templateModalTitle}>
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </Text>

              {/* Title */}
              <View style={styles.templateFormField}>
                <Text style={styles.templateFormLabel}>Title *</Text>
                <TextInput
                  style={[styles.templateFormInput, { borderColor: accentColor }]}
                  value={templateTitle}
                  onChangeText={setTemplateTitle}
                  placeholder="e.g., Couple Disagreement"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Description */}
              <View style={styles.templateFormField}>
                <Text style={styles.templateFormLabel}>Description (optional)</Text>
                <TextInput
                  style={[styles.templateFormInput, { borderColor: colors.surfaceBorder }]}
                  value={templateDescription}
                  onChangeText={setTemplateDescription}
                  placeholder="What is this template for?"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              {/* Sides */}
              <View style={styles.templateFormField}>
                <Text style={styles.templateFormLabel}>Sides ({templateSides.length})</Text>
                {templateSides.map((side, index) => (
                  <View key={index} style={styles.templateSideRow}>
                    <TextInput
                      style={[styles.templateSideInput, { flex: 1 }]}
                      value={side.label}
                      onChangeText={(text) => updateTemplateSide(index, { label: text })}
                      placeholder={`Side ${String.fromCharCode(65 + index)}`}
                      placeholderTextColor={colors.textTertiary}
                    />
                    {templateSides.length > 2 && (
                      <PressableScale
                        onPress={() => handleRemoveTemplateSide(index)}
                        style={styles.removeSideButton}
                      >
                        <Text style={styles.removeSideButtonText}>✕</Text>
                      </PressableScale>
                    )}
                  </View>
                ))}
                {templateSides.length < 5 && (
                  <PressableScale
                    onPress={handleAddTemplateSide}
                    style={styles.addSideButton}
                  >
                    <Text style={[styles.addSideButtonText, { color: accentColor }]}>+ Add Side</Text>
                  </PressableScale>
                )}
              </View>

              {/* Style */}
              <View style={styles.templateFormField}>
                <Text style={styles.templateFormLabel}>Commentator Style</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.styleChipsContainer}
                >
                  {commentatorStyles.map((s) => (
                    <PressableScale
                      key={s.id}
                      onPress={() => setTemplateStyle(s.id)}
                      style={[
                        styles.styleChip,
                        templateStyle === s.id && { backgroundColor: accentColor, borderColor: accentColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.styleChipText,
                          templateStyle === s.id && styles.styleChipTextActive,
                        ]}
                      >
                        {s.label}
                      </Text>
                    </PressableScale>
                  ))}
                </ScrollView>
              </View>

              {/* Evidence Mode */}
              <View style={styles.templateFormField}>
                <Text style={styles.templateFormLabel}>Evidence Mode</Text>
                <AnimatedSegmentedControl
                  options={evidenceModes.map(m => ({ id: m.id, label: m.label }))}
                  value={templateEvidence}
                  onChange={setTemplateEvidence}
                />
              </View>

              {/* Actions */}
              <View style={styles.templateModalActions}>
                <PressableScale
                  onPress={() => {
                    setShowTemplateModal(false);
                    resetTemplateForm();
                  }}
                  style={styles.templateCancelButton}
                >
                  <Text style={styles.templateCancelText}>Cancel</Text>
                </PressableScale>
                <PressableScale
                  onPress={handleSaveTemplate}
                  style={[styles.templateSaveButton, { backgroundColor: accentColor }]}
                >
                  <Text style={styles.templateSaveText}>
                    {editingTemplate ? 'Update' : 'Create'}
                  </Text>
                </PressableScale>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  // Templates section
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addTemplateButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  addTemplateButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  emptyTemplates: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyTemplatesIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyTemplatesText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  emptyTemplatesSubtext: {
    color: colors.textTertiary,
  },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  templateTitle: {
    fontWeight: typography.weights.medium,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  templateMeta: {
    color: colors.textTertiary,
  },
  templateActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  templateActionButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateActionIcon: {
    fontSize: 16,
  },
  // Template Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  templateModal: {
    backgroundColor: colors.backgroundSecondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  templateModalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  templateFormField: {
    marginBottom: spacing.lg,
  },
  templateFormLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  templateFormInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 2,
  },
  templateSideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  templateSideInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  removeSideButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeSideButtonText: {
    fontSize: 16,
    color: colors.error,
  },
  addSideButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  addSideButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  styleChipsContainer: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  styleChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  styleChipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  styleChipTextActive: {
    color: colors.textPrimary,
  },
  templateModalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  templateCancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  templateCancelText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  templateSaveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  templateSaveText: {
    fontSize: typography.sizes.base,
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
});
