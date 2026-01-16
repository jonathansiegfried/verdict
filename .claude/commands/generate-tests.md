# Generate Tests

Generate comprehensive tests for the specified file or component.

## Usage
```
/generate-tests <filepath>
```

## Instructions

When generating tests for $ARGUMENTS:

1. **Identify the type of code:**
   - Component: Create React Native Testing Library tests
   - Hook: Create hook testing with renderHook
   - Service: Create unit tests with mocks
   - Store: Create Zustand store tests

2. **Test file location:**
   - Place in `__tests__` folder next to source file
   - Name as `<filename>.test.ts(x)`

3. **Coverage requirements:**
   - Happy path for main functionality
   - Edge cases (empty inputs, null values)
   - Error scenarios
   - For components: user interactions, accessibility

4. **Testing patterns:**
   ```typescript
   // Component test structure
   describe('ComponentName', () => {
     it('renders correctly with default props', () => {});
     it('handles user interaction', () => {});
     it('respects accessibility settings', () => {});
   });

   // Hook test structure
   describe('useHookName', () => {
     it('returns initial state', () => {});
     it('updates state correctly', () => {});
     it('handles cleanup', () => {});
   });
   ```

5. **Mock guidelines:**
   - Mock expo-haptics for haptic tests
   - Mock AsyncStorage for persistence tests
   - Mock navigation for screen tests

6. **Output:**
   - Complete, runnable test file
   - Clear test descriptions
   - No placeholder comments
