---
name: review-rn-components
description: Review React Native TSX code for componentisation, modularity, and UI consistency. Identifies extraction opportunities, prop-drilling issues, repeated patterns, and suggests structural changes with trade-off analysis.
user-invocable: true
disable-model-invocation: true
argument-hint: <diff|pr|all|path/to/file.tsx ...>
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Review RN Components

Review React Native TSX code to identify patterns that hurt modularity, componentisation, and UI consistency. Suggest structural changes with explicit trade-offs.

## Scope

Determine which files to review based on `$ARGUMENTS`:

- **`diff`** — Only `.tsx` files with unstaged or staged changes. Run `git diff --name-only --diff-filter=d HEAD -- '*.tsx'` to get the list.
- **`pr`** — `.tsx` files changed in the current branch vs `main`. Run `git diff --name-only --diff-filter=d $(git merge-base HEAD main)...HEAD -- '*.tsx'` to get the list.
- **`all`** — All `.tsx` files under `app/` and `src/`.
- **File paths** — If `$ARGUMENTS` contains one or more file paths (anything ending in `.tsx` or `.ts`), review exactly those files.

If no argument is provided, default to `diff`.

## What to check

Read each file in scope. For every issue found, include a **Trade-off** note explaining what is gained and what is lost by making the change. UI consistency across the app takes priority over localised control.

---

### 1. Inline JSX that should be a component

Flag JSX blocks (10+ lines) rendered inline inside a screen or parent component that represent a distinct UI concept (a card, a list item, a section, a modal body, etc.).

**Suggest:** Extract into a focused component in `src/components/` with props for data and callbacks.

**Trade-off:** Extraction improves reuse and keeps screens declarative. The cost is an extra file and slightly less direct control over layout tweaks — but UI consistency benefits outweigh this since the same visual element renders identically everywhere.

---

### 2. Repeated JSX patterns across files

Search for structurally similar JSX across the scoped files — e.g., the same arrangement of `View > Text + Icon + TouchableOpacity` appearing in multiple screens or components with only data differences.

**Suggest:** Extract the shared pattern into a single reusable component. Data and event handlers should be passed as props.

**Trade-off:** A shared component enforces visual consistency (the primary goal). The trade-off is that one-off styling tweaks become harder — each screen loses the freedom to subtly diverge. This is intentional: divergence is the problem being solved.

---

### 3. Prop-drilling through more than two levels

Identify props being passed through an intermediate component unchanged, purely to reach a deeper child.

**Suggest:** If it spans 2+ intermediate layers, consider:

- Lifting state into a custom hook that the deep child calls directly.
- React Context _only_ if the data is truly app-wide (theme, auth). Do not introduce Context for narrow, screen-local state.

**Trade-off:** Removing prop-drilling makes the intermediate components simpler and more reusable (they no longer carry unrelated props). The cost is that data flow becomes less explicit — a developer reading the deep child must know about the hook/context to trace where data comes from.

---

### 4. Mixed concerns in a single component

Flag components that combine:

- Data fetching / side effects **and** complex rendering logic in the same component.
- Business logic (formatting, filtering, sorting) **and** presentation.

**Suggest:** Split into a container pattern — a hook or wrapper that owns the data/logic, and a presentational component that receives everything via props.

**Trade-off:** Separation makes the presentational component testable and reusable across screens with different data sources. The cost is two units of code instead of one, and for truly one-off screens this can feel like over-engineering. Flag it but note when a component is only used once — in that case recommend extraction only if the file exceeds ~150 lines or the logic is non-trivial.

---

### 5. Inconsistent use of the UI library (`@rneui/themed`)

This project uses `@rneui/themed` for components and theming. Flag:

- Direct use of raw React Native primitives (`<Text>`, `<Button>`, `<Input>`) when an `@rneui/themed` equivalent exists and is used elsewhere in the project.
- Inline `style` props that override themed values without clear justification.
- One-off colour hex codes or magic numbers instead of theme colours from `src/theme/colors.ts`.

**Suggest:** Use the themed component and theme colours for consistency. Inline style overrides should be rare and commented.

**Trade-off:** Themed components enforce a unified look and centralise style changes. The cost is reduced per-instance control — if a screen needs a truly unique visual treatment, the themed component may need an additional variant rather than an inline override.

---

### 6. Callbacks defined inline in JSX

Flag anonymous functions or arrow functions defined directly in JSX props (`onPress={() => ...}`) that contain more than a single expression (e.g., multiple statements, conditionals, or async operations).

**Suggest:** Extract to a named function or `useCallback` at the component scope.

**Trade-off:** Named callbacks are easier to read and debug (they show up in stack traces with a name). The cost is minor boilerplate. For trivial single-expression handlers (`onPress={() => setVisible(true)}`), inline is fine — only flag multi-statement handlers.

---

### 7. Hardcoded strings and layout values

Flag:

- User-visible strings hardcoded in JSX rather than being defined as constants or coming from a central location.
- Repeated magic numbers for padding, margin, font sizes, or border radius that don't reference theme or shared constants.

**Suggest:** Move user-visible strings to a constants file or co-located constants at the top of the file. Use theme spacing/sizing values where they exist.

**Trade-off:** Centralising strings and values makes global changes trivial and ensures consistency. The cost is indirection — a developer must look up the constant to know what the string says. For strings used only once in a single file, a co-located `const` at the top of the file is sufficient (no need for a separate file).

---

### 8. Large `FlatList` / `ScrollView` renderItem functions

Flag `renderItem` props on `FlatList` or `SectionList` that contain more than ~15 lines of JSX.

**Suggest:** Extract the render function into a separate component. Pass item data as props.

**Trade-off:** Extracted list item components can use `React.memo` for performance and are easier to test. The cost is that list-specific context (like scroll position or parent state) needs to be passed explicitly via props or callbacks.

---

## Output format

For each file with issues, list:

```
### path/to/file.tsx

- **[Issue name]** (lines ~X–Y): Brief description of the problem.
  - *Suggestion:* What to do.
  - *Trade-off:* What is gained vs what is lost.
```

At the end, provide:

1. **Summary count** — total issues by category.
2. **Top 3 highest-impact changes** — the extractions or refactors that would most improve UI consistency and modularity across the app, ranked by how many files or screens they affect.

If no issues are found, say so.

Be concise — identify problems and trade-offs, do not rewrite code.
