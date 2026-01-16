# Verdict+ Release Checklist

## Pre-Release Verification

### Code Quality
- [ ] Run `npm run typecheck` - TypeScript passes with no errors
- [ ] Run `npm run lint` (if configured) - No linting errors
- [ ] Review all `// TODO` comments and address or document
- [ ] Ensure no `console.log` statements in production code (except errors)
- [ ] All files have consistent formatting

### Functionality Testing
- [ ] Test all 4 design presets on each screen
- [ ] Verify preset switching updates all components
- [ ] Test reduced motion mode
- [ ] Test haptics enabled/disabled
- [ ] Verify all screens render without errors

### Core Flows
- [ ] Start new analysis from Analyze tab
- [ ] Complete analysis and view verdict
- [ ] Save takeaway in reflection loop
- [ ] View analysis from History
- [ ] Search/filter history
- [ ] Compare 2-3 analyses
- [ ] Rename, duplicate, delete analysis
- [ ] Create, edit, delete templates
- [ ] Export/import data

### Edge Cases
- [ ] Empty state displays (no history, no search results)
- [ ] Large text handling (long headlines, long arguments)
- [ ] 2 sides, 3 sides, 5 sides variations
- [ ] All commentator styles
- [ ] Both evidence modes (light/strict)

### Data & Storage
- [ ] Data persists after app restart
- [ ] Draft autosave works correctly
- [ ] Draft restore works on app open
- [ ] Export produces valid JSON
- [ ] Import merges correctly
- [ ] Import replaces correctly
- [ ] Clear all data works

### Performance
- [ ] App launches in < 2 seconds
- [ ] Animations run at 60fps
- [ ] No visible lag when scrolling long history
- [ ] Memory usage stays reasonable
- [ ] Battery drain is acceptable

### Accessibility
- [ ] All buttons have accessibility labels
- [ ] Screen reader can navigate the app
- [ ] Reduced motion respected throughout
- [ ] Touch targets are minimum 44x44pt
- [ ] Color contrast meets WCAG standards

### Platform-Specific
- [ ] iOS: Home indicator spacing correct
- [ ] iOS: Status bar styled correctly
- [ ] iOS: Keyboard avoiding works
- [ ] Android: Back button works
- [ ] Android: Elevation shadows render

## Version Bump

1. Update version in `app.json`:
   ```json
   "version": "X.Y.Z"
   ```

2. Update `buildNumber` (iOS) and `versionCode` (Android)

## Build & Submission

### iOS
```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
eas submit --platform ios
```

### Android
```bash
# Build for internal testing
eas build --platform android --profile preview

# Build for Play Store
eas build --platform android --profile production
eas submit --platform android
```

## Post-Release

- [ ] Monitor crash reports
- [ ] Check analytics for abnormal patterns
- [ ] Respond to user feedback
- [ ] Plan next release iteration

## App Store Compliance

### Content
- [ ] No medical/legal advice claims
- [ ] Disclaimer displayed in About section
- [ ] Privacy policy link (if required)

### Screenshots
- [ ] Home screen (2 presets)
- [ ] Analysis in progress
- [ ] Verdict reveal
- [ ] History list
- [ ] Settings

### Metadata
- [ ] App name: Verdict+
- [ ] Subtitle: AI Argument Analyzer
- [ ] Keywords: argument, analysis, decision, relationship, debate
- [ ] Description highlighting key features
- [ ] What's New for this version
