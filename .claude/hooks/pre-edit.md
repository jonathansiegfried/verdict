# Pre-Edit Hook

This hook runs before accepting file edits.

## Validation Checks

Before applying edits, verify:

1. **TypeScript validity:**
   - Run `npm run typecheck` if editing .ts/.tsx files
   - Ensure no new type errors introduced

2. **Import validity:**
   - Check all imports resolve correctly
   - Verify no circular dependencies

3. **Theme compliance:**
   - Colors should use `colors.` from theme
   - Spacing should use `spacing.` from theme
   - No hardcoded color hex values

4. **Accessibility:**
   - Animations must check `useReducedMotion()`
   - Haptics must use `useHaptics()` hook

## Auto-fixes

If the edit introduces issues that can be auto-fixed:
- Missing imports: Add them
- Unused imports: Remove them (if edit caused)
- Formatting: Apply consistent style
