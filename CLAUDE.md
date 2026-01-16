# Verdict+ - Claude Code Project Guide

## Project Purpose
Verdict+ is an AI-powered argument and decision analysis mobile app built with Expo/React Native. It helps users analyze disagreements, understand different perspectives, and find resolution paths.

**Target Platform:** iOS-first, Expo compatible
**Status:** MVP

## Architecture Overview

```
/app                     # expo-router screens (file-based routing)
  _layout.tsx           # Root layout with providers
  (tabs)/               # Tab-based navigation
    _layout.tsx         # Tab navigator config
    index.tsx           # Home tab
    analyze.tsx         # Start analysis tab
    history.tsx         # History tab with long-press actions
    settings.tsx        # Settings tab
  input.tsx             # Argument input screen
  analyzing.tsx         # Staged loading screen
  verdict.tsx           # Results display
  upgrade.tsx           # Pro subscription modal

/src
  /components           # Reusable UI components
    PressableScale.tsx  # Base animated pressable with accessibility
    PrimaryButton.tsx   # Main CTA with glow effect, micro-interactions
    AnimatedSegmentedControl.tsx  # Sliding selector
    StagedLoader.tsx    # Multi-step progress indicator
    VerdictReveal.tsx   # Animated result display
    EmptyState.tsx      # Polished empty state with floating animation
    Toast.tsx           # Toast notification component
    /ui
      Card.tsx          # Generic card with theme tokens

  /context
    ThemeContext.tsx    # Design preset theming (4 presets)

  /services
    ai.ts               # AI provider + auto-title generation
    storage.ts          # AsyncStorage + import/export + drafts

  /store
    useAppStore.ts      # Zustand global state

  /constants
    theme.ts            # Colors, spacing, typography, animations

  /types
    index.ts            # TypeScript interfaces

  /hooks
    useReducedMotion.ts # Accessibility motion preference
    useHaptics.ts       # Semantic haptic patterns
```

## Tech Stack
- **Framework:** Expo SDK 54, React Native 0.81
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router (file-based, tab navigation)
- **State:** Zustand
- **Persistence:** AsyncStorage
- **Animations:** react-native-reanimated + gesture-handler
- **Haptics:** expo-haptics
- **File System:** expo-file-system (new File/Paths API)
- **Document Picker:** expo-document-picker (for import)

## Build/Dev Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type checking
npm run typecheck

# Linting (if ESLint configured)
npm run lint
```

## Key Conventions

### Component Structure
- Functional components with TypeScript interfaces
- Hooks at top, handlers next, render last
- Export as named export (not default) for components in /src
- Add accessibility props (accessibilityLabel, accessibilityRole, accessibilityState)

### Styling
- Use StyleSheet.create() for performance
- Import from theme.ts for colors, spacing, typography
- Use ThemeContext tokens for dynamic styling based on design preset
- Create `dynamicStyles` with useMemo for token-based styles
- Dark theme only (premium feel)

### Theming System
The app supports 4 design presets via ThemeContext:
- `soft-premium` (default): Generous spacing, soft corners
- `compact-bold`: Dense, sharp corners
- `minimal-glass`: Transparent glass morphism
- `classic-card`: Traditional elevated cards

Access via `useTheme()` hook:
```tsx
const { tokens, preset, setPreset, reduceMotion, getCardStyle } = useTheme();
```

### State Management
- Global state in Zustand store
- Local state with useState for UI-only concerns
- Side effects in useEffect with proper cleanup
- Draft autosave with debouncing (2 second delay)

### Animations
- Check `reduceMotion` from useTheme() or useReducedMotion() before animating
- Use withSpring for interactive feedback
- Haptics gated by useHaptics() hook with semantic patterns

### Haptic Patterns
useHaptics now supports semantic patterns:
```tsx
const { trigger, pattern } = useHaptics();
pattern('buttonPress');    // Light impact
pattern('tabChange');      // Light impact
pattern('delete');         // Warning notification
pattern('analysisComplete'); // Success notification
```

### Accessibility
- All interactive components should have accessibilityLabel
- Use accessibilityRole ('button', 'summary', etc.)
- Use accessibilityState for disabled/busy states
- Use accessibilityHint for non-obvious interactions
- Respect reduceMotion for all animations

### AI Service
- MockAIProvider returns deterministic JSON
- Auto-generates titles from argument content keywords
- PromptBuilder constructs prompts for real API integration
- Swap provider by implementing AIProvider interface

## File Naming
- Components: PascalCase.tsx
- Hooks: camelCase with 'use' prefix
- Services: camelCase.ts
- Screens: lowercase.tsx (expo-router convention)

## Testing Strategy
Currently manual testing. When adding tests:
- Unit tests for services and hooks
- Component tests for interactive elements
- E2E tests for core flows

## Common Tasks

### Adding a new screen
1. Create file in /app directory (or /app/(tabs) for tab screens)
2. Add to Stack.Screen in _layout.tsx if custom options needed
3. Use SafeAreaView with edges prop
4. Use ThemeContext tokens for styling

### Adding a new component
1. Create in /src/components
2. Export from components/index.ts
3. Use theme tokens via useTheme() for dynamic styling
4. Implement reduced motion support if animated
5. Add accessibility props

### Modifying AI responses
Edit MockAIProvider in services/ai.ts. Structure must match AnalysisResult interface.

### Adding settings
1. Add to AppSettings interface in types/index.ts
2. Add default in storage.ts DEFAULT_SETTINGS
3. Add UI in settings.tsx
4. Use via useAppStore

### Data Management Features
- **Export:** Saves all analyses as JSON via expo-sharing
- **Import:** Uses expo-document-picker, supports merge/replace modes
- **Drafts:** Auto-saved after 2 seconds of inactivity, restored on app open
- **History actions:** Rename, duplicate, delete with long-press

## Platform Considerations
- KeyboardAvoidingView: Use 'padding' on iOS, 'height' on Android
- Tab bar: Account for iOS home indicator with extra bottom padding
- Shadows: Use iOS shadows, Android elevation
- File System: Use new expo-file-system File/Paths API (SDK 54+)

## Security Notes
- No backend/network calls in MVP
- All data stored locally via AsyncStorage
- No PII collection
- No medical/legal advice (App Store compliance)
