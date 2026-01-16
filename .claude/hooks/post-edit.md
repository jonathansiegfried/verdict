# Post-Edit Hook

This hook runs after file edits are applied.

## Verification Steps

After applying edits:

1. **Type check:**
   ```bash
   npm run typecheck
   ```
   - If errors, report them and suggest fixes
   - Do not leave type errors unresolved

2. **Lint check (if configured):**
   ```bash
   npm run lint
   ```
   - Fix any auto-fixable issues
   - Report remaining issues

3. **Dependency check:**
   - If new imports added, verify package is installed
   - Suggest `npm install <package>` if missing

## Notifications

Report to user:
- Any type errors introduced
- Any lint warnings/errors
- Suggestions for improvement
