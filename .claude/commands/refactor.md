# Refactor Component/Module

Refactor the specified file to improve code quality while preserving functionality.

## Usage
```
/refactor <filepath> [focus]
```

Arguments:
- filepath: Path to file to refactor
- focus (optional): Specific aspect to focus on (performance, readability, types, etc.)

## Instructions

When refactoring $ARGUMENTS:

1. **Analyze current implementation:**
   - Read the file completely
   - Identify code smells or issues
   - Note any TODO comments

2. **Refactoring priorities:**
   - Preserve external API/interface
   - Improve type safety
   - Reduce complexity
   - Enhance readability
   - Follow project conventions (see CLAUDE.md)

3. **Common refactoring patterns:**
   - Extract repeated code into helper functions
   - Replace magic numbers with named constants
   - Simplify conditional logic
   - Improve naming for clarity
   - Add proper TypeScript types where missing
   - Use theme constants instead of hardcoded values

4. **Performance considerations:**
   - Memoize expensive computations
   - Use useCallback for handler functions passed as props
   - Check for unnecessary re-renders
   - Optimize animation worklets

5. **Constraints:**
   - Do not change the component's public interface
   - Do not add new dependencies without justification
   - Maintain existing test compatibility
   - Keep changes minimal and focused

6. **Output:**
   - Provide unified diff of changes
   - Brief explanation of each change
   - Note any breaking changes (there should be none)
