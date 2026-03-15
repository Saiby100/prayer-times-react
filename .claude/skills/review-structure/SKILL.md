---
name: review-structure
description: Review code for structural issues — screens that are too fat, missing component extraction, inline logic that should be in custom hooks, and misplaced files. Enforces the UI Component Guidelines from CLAUDE.md.
user-invocable: true
disable-model-invocation: true
argument-hint: <diff|pr|all>
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Review Structure

Review code for structural and modularity issues based on the project's UI Component Guidelines.

## Scope

Determine which files to review based on `$ARGUMENTS`:

- **`diff`** — Only files with unstaged or staged changes. Run `git diff --name-only --diff-filter=d HEAD -- '*.tsx' '*.ts'` to get the list.
- **`pr`** — Files changed in the current branch vs `main`. Run `git diff --name-only --diff-filter=d $(git merge-base HEAD main)...HEAD -- '*.tsx' '*.ts'` to get the list.
- **`all`** — All `.tsx` and `.ts` files under `app/` and `src/`.

If no argument is provided, default to `diff`.

## What to check

Read each file in scope and check for these issues:

### Screen files (`app/**/*.tsx`)

1. **Too long** — Screen files over ~150 lines likely need component extraction or hook extraction.
2. **Too many hook calls** — More than ~5 calls to `useState`, `useEffect`, `useCallback`, `useMemo`, or `useRef` suggests the logic should be extracted into a custom hook in `src/hooks/`.
3. **Inline data fetching** — Direct calls to `supabase`, `fetch()`, or similar in the screen file. These should live in a custom hook.
4. **Multiple component definitions** — More than 1 exported/named component defined in a single screen file. Sub-components should be extracted to `src/components/`.
5. **Inline styles** — Prefer `StyleSheet.create` over inline `style` objects for repeated or complex styles.

### Component files (`src/components/**/*.tsx`)

1. **Too long** — Component files over ~200 lines should be split into smaller, focused components.
2. **Multiple component definitions** — More than 2 component definitions in one file suggests it should be split.
3. **Direct data fetching** — Components in `src/components/ui/` should be presentational. Data fetching belongs in hooks or screen-level logic.

### Hook files (`src/hooks/**/*.ts`)

1. **Too long** — Hook files over ~150 lines may be doing too much; consider splitting.
2. **Too granular** — Hook files that contain a single query or mutation for a domain entity that already has another hook file should be merged. Hooks should be organized by domain entity (e.g., `useChats` for all chat queries), not one file per query. Flag when two or more hook files operate on the same Supabase table or domain entity and suggest merging them.

### Type files (`src/types/**/*.ts`)

1. **Usage of `any`** — Flag any use of `any`. Prefer `unknown` or a proper type. `Record<string, unknown>` over `Record<string, any>`.
2. **Inlined union types** — String literal unions with 3+ members used directly in a type property should be extracted into their own named type (e.g., `type MessageType = 'text' | 'image' | ...`).
3. **`interface` usage** — This project uses `type` by convention. Flag `interface` declarations unless they have a clear reason (declaration merging).
4. **Overly broad types** — Fields typed as plain `string` that represent a known set of values (roles, statuses, categories) should use string literal unions instead.
5. **Misplaced prop types** — Component prop types (`FooProps`) should live next to their component, not in `src/types/`.

### All `.ts` and `.tsx` files

1. **Usage of `any`** — Flag any use of `any` anywhere in the codebase. Suggest `unknown`, a proper type, or a generic.
2. **Misplaced files** — Reusable UI primitives should be in `src/components/ui/`, domain-specific chat components in `src/components/chat/`, custom hooks in `src/hooks/`, and domain types in `src/types/`.

## Output format

For each file with issues, list the file path and the issues found. At the end, provide a summary count of total issues. If no issues are found, say so.

Be concise — just list the issue and a short actionable suggestion. Do not rewrite code, only identify problems.
