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
- **Quick Start Templates**: Pre-configured templates for common scenarios (Couple, Work, Family)
- **Analysis History**: Grouped by date with search and long-press actions
- **Compare Mode**: Side-by-side comparison of 2-3 analyses
- **Reflection Loop**: Save personal takeaways on each verdict
- **Draft Autosave**: Never lose work - resume drafts on app open
- **Export/Import**: Backup and restore analysis history as JSON

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
    history.tsx         # Analysis history
    settings.tsx        # App settings
  _layout.tsx           # Root layout with providers
  input.tsx             # Argument input screen
  analyzing.tsx         # Staged loading screen
  verdict.tsx           # Results display
  compare.tsx           # Compare analyses
  upgrade.tsx           # Pro subscription modal

/src
  /components           # Reusable UI components
  /services            # Storage, AI service
  /store               # Zustand global state
  /context             # Theme context with design presets
  /constants           # Theme tokens, styles
  /types               # TypeScript interfaces
  /hooks               # Custom hooks (useHaptics, useReducedMotion)
```

## Architecture

- **Navigation**: Tab-based with expo-router
- **State Management**: Zustand store for global state
- **Theming**: ThemeContext with 4 design presets and design tokens
- **Storage**: AsyncStorage for local persistence
- **AI Service**: Pluggable AI provider interface (mock implementation)

## License

Private - All rights reserved
