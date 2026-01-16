# Verdict+ - Claude Code Project Guide

## Project Purpose
Verdict+ is an AI-powered argument and decision analysis mobile app built with Expo/React Native. It helps users analyze disagreements, understand different perspectives, and find resolution paths.

**Target Platform:** iOS-first, Expo compatible
**Status:** MVP

## Architecture Overview

```
/app                     # expo-router screens (file-based routing)
  _layout.tsx           # Root layout with providers
  index.tsx             # Home screen
  input.tsx             # Argument input screen
  analyzing.tsx         # Staged loading screen
  verdict.tsx           # Results display
  history.tsx           # Previous analyses
  settings.tsx          # App preferences
  upgrade.tsx           # Pro subscription modal

/src
  /components           # Reusable UI components
    PressableScale.tsx  # Base animated pressable
    PrimaryButton.tsx   # Main CTA with micro-interactions
    AnimatedSegmentedControl.tsx  # Sliding selector
    StagedLoader.tsx    # Multi-step progress indicator
    VerdictReveal.tsx   # Animated result display
    /ui
      Card.tsx          # Generic card component

  /services
    ai.ts               # AI provider interface + mock implementation
    storage.ts          # AsyncStorage persistence layer

  /store
    useAppStore.ts      # Zustand global state

  /constants
    theme.ts            # Colors, spacing, typography, animations

  /types
    index.ts            # TypeScript interfaces

  /hooks
    useReducedMotion.ts # Accessibility motion preference
    useHaptics.ts       # Haptic feedback with settings respect
```

## Tech Stack
- **Framework:** Expo SDK 54, React Native 0.81
- **Language:** TypeScript (strict mode)
- **Navigation:** expo-router (file-based)
- **State:** Zustand
- **Persistence:** AsyncStorage
- **Animations:** react-native-reanimated + gesture-handler
- **Haptics:** expo-haptics

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

### Styling
- Use StyleSheet.create() for performance
- Import from theme.ts for colors, spacing, typography
- Dark theme only (premium feel)

### State Management
- Global state in Zustand store
- Local state with useState for UI-only concerns
- Side effects in useEffect with proper cleanup

### Animations
- Check useReducedMotion() before animating
- Use withSpring for interactive feedback
- Haptics gated by useHaptics() hook

### AI Service
- MockAIProvider returns deterministic JSON
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
1. Create file in /app directory
2. Add to Stack.Screen in _layout.tsx if custom options needed
3. Use SafeAreaView with edges prop

### Adding a new component
1. Create in /src/components
2. Export from components/index.ts
3. Use theme constants for styling
4. Implement reduced motion support if animated

### Modifying AI responses
Edit MockAIProvider in services/ai.ts. Structure must match AnalysisResult interface.

### Adding settings
1. Add to AppSettings interface in types/index.ts
2. Add default in storage.ts DEFAULT_SETTINGS
3. Add UI in settings.tsx
4. Use via useAppStore

## Security Notes
- No backend/network calls in MVP
- All data stored locally via AsyncStorage
- No PII collection
- No medical/legal advice (App Store compliance)
