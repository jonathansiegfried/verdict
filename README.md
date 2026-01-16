# Verdict+

AI-powered argument and decision analysis mobile app. Get unbiased verdicts on any disagreement.

## Features

### Core Analysis
- **Multi-side Arguments**: Analyze 2-5 perspectives in any disagreement
- **AI-Powered Verdicts**: Get neutral, evidence-based analysis
- **Win vs Peace Mode**: Choose between finding a winner or finding common ground
- **Commentator Styles**: 7 analysis personalities (Neutral, Direct, Harsh, Savage, Coach, Lawyer, Mediator)
- **Evidence Modes**: Light or Strict evidence checking

### Premium Experience
- **4 Design Presets**: Soft Premium, Sharp Minimal, Neo Glass, Playful Bold
- **2-Step Verdict Reveal**: Anticipation pause with pulse animation
- **Haptic Feedback**: Tactile responses gated by user preference
- **Reduced Motion Support**: Full accessibility support

### Productivity Features
- **Quick Start Templates**: Create, edit, and manage analysis templates
- **Analysis History**: Grouped by date with search/filter and long-press actions
- **Compare Mode**: Side-by-side comparison of 2-3 analyses
- **Reflection Loop**: Save personal takeaways on each verdict
- **Draft Autosave**: Never lose work - resume drafts on app open
- **Export/Import**: Backup and restore analysis history as JSON

### Technical Excellence
- **Data Migrations**: Automatic schema versioning and data migration
- **Skeleton Loading**: Smooth loading states for perceived performance
- **Error Boundaries**: Graceful error handling with retry options
- **Preset-Aware Theming**: All colors adapt to selected design preset
- **Memoized Components**: Optimized rendering for long lists

### Settings
- Haptics toggle
- Reduced Motion toggle
- Default Commentator Style
- Default Evidence Mode
- Design Preset selection
- Pro upgrade (mock)
- Export/Import data

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81
- **Language**: TypeScript (strict mode)
- **Navigation**: expo-router (file-based, tab navigation)
- **State**: Zustand
- **Persistence**: AsyncStorage
- **Animations**: react-native-reanimated + gesture-handler
- **Haptics**: expo-haptics

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd verdict

# Install dependencies
npm install

# Start the development server
npm start
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Type checking
npx tsc --noEmit
```

### Development Commands

```bash
# Start Metro bundler
npm start

# Run iOS (requires macOS + Xcode)
npm run ios

# Run Android (requires Android Studio)
npm run android

# Type check
npm run typecheck

# Lint (if configured)
npm run lint
```

## Project Structure

```
/app                     # expo-router screens (file-based routing)
  (tabs)/               # Tab navigator screens
    _layout.tsx         # Tab layout
    index.tsx           # Home tab
    analyze.tsx         # New Analysis CTA
    history.tsx         # Analysis history with search/filter
    settings.tsx        # App settings with templates
  _layout.tsx           # Root layout with providers
  input.tsx             # Argument input screen
  analyzing.tsx         # Staged loading screen
  verdict.tsx           # Results display with reflection
  compare.tsx           # Compare analyses side-by-side
  upgrade.tsx           # Pro subscription modal
  playground.tsx        # Dev-only component showcase

/src
  /components           # Reusable UI components
    ErrorBoundary.tsx   # Error handling with fallback UI
    Skeleton.tsx        # Loading skeleton components
    AnalysisCard.tsx    # Memoized history card
  /services
    storage.ts          # AsyncStorage with migrations
    ai.ts               # AI provider interface
    migrations.ts       # Data version migrations
  /store               # Zustand global state
  /context             # Theme context with design presets
  /constants           # Theme tokens, styles
  /types               # TypeScript interfaces
  /hooks               # Custom hooks (useHaptics, useReducedMotion)
  /utils               # Defensive utility functions
    safe.ts            # Safe accessors, validators

/docs                   # Documentation
  MIGRATION-STRATEGY.md # Data migration documentation
  RELEASE-CHECKLIST.md  # Pre-release verification checklist
```

## Architecture

- **Navigation**: Tab-based with expo-router
- **State Management**: Zustand store for global state
- **Theming**: ThemeContext with 4 design presets, dynamic tokens, and preset-aware colors
- **Storage**: AsyncStorage with automatic data versioning and migrations
- **AI Service**: Pluggable AI provider interface (mock implementation)
- **Error Handling**: Error boundaries with retry capability and inline fallbacks
- **Performance**: Memoized components, skeleton loaders, optimized lists

## Development

### Component Playground

In development mode, access `/playground` to see all components with preset switching. This helps ensure visual consistency across design presets.

### Data Migrations

The app automatically migrates data when schema changes occur. See `docs/MIGRATION-STRATEGY.md` for details.

### Release Process

Follow `docs/RELEASE-CHECKLIST.md` for pre-release verification steps.

## License

Private - All rights reserved
