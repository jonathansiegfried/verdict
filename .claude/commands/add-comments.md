# Add/Improve Comments

Add or improve documentation comments in the specified file.

## Usage
```
/add-comments <filepath>
```

## Instructions

When documenting $ARGUMENTS:

1. **Read the file completely first**

2. **Comment types to add:**

   **File header (if missing):**
   ```typescript
   // ComponentName - Brief description of purpose
   // Key features or behaviors
   ```

   **Function/Component JSDoc:**
   ```typescript
   /**
    * Brief description of what this does.
    *
    * @param props - Description of props
    * @returns Description of return value
    *
    * @example
    * <Component prop="value" />
    */
   ```

   **Complex logic inline:**
   ```typescript
   // Calculate the weighted score based on evidence quality
   // Higher weight for direct evidence vs circumstantial
   const score = directEvidence * 1.5 + circumstantial * 0.8;
   ```

3. **Comment guidelines:**
   - Explain WHY, not WHAT (code shows what)
   - Document non-obvious behavior
   - Explain business logic decisions
   - Note any workarounds or tech debt
   - Keep comments concise

4. **Do NOT comment:**
   - Self-explanatory code
   - Every single line
   - Obvious getters/setters
   - Standard React patterns

5. **Type documentation:**
   ```typescript
   /** User's analysis settings and preferences */
   interface AppSettings {
     /** Whether device vibration is enabled */
     hapticsEnabled: boolean;
     /** Reduces animations for accessibility */
     reduceMotion: boolean;
   }
   ```

6. **Output:**
   - Provide the updated file with comments
   - Use unified diff format
   - Only add meaningful comments
