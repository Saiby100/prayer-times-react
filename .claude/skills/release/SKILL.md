---
name: release
description: Analyze changes since last release, determine bump type, bump version, and create PR to main
---

# Release

Analyze changes since the last release, automatically determine the version bump type, and create a PR to main.

## Arguments

None required. The bump type is determined automatically. The user may optionally override with `patch` or `minor`.

## Steps

1. **Validate preconditions:**
   - Confirm the current branch is `develop`
   - Confirm the working tree is clean (no uncommitted changes)
   - If any check fails, stop and tell the user what to fix

2. **Determine bump type from changes:**
   - Run `git log main..develop --oneline` to list all commits since the last release
   - Run `git diff main..develop --name-only` to list all changed files
   - Apply these rules to decide the bump type:
     - **`minor`** if ANY of the following files were changed:
       - `app.config.ts`
       - `eas.json`
       - `package.json` (dependency changes — not just version field)
       - `app.json`
       - Any file under `ios/` or `android/` native directories
       - Any new native module or plugin was added
     - **`patch`** for everything else (JS/TS-only changes, asset changes, config tweaks that don't affect native layer)
   - **Never use `major`.**
   - If the user provided an explicit override, use that instead (but still never allow `major`)
   - Show the user: the list of changes, the determined bump type, and the reasoning. Ask for confirmation before proceeding.

3. **Calculate the new version:**
   - Read the current version from `package.json`
   - Apply the bump type to calculate the new semver version (e.g. `1.2.0` + `patch` = `1.2.1`)

4. **Bump the version:**
   - Update the `version` field in `package.json` to the new version

5. **Commit and push on develop:**
   - Stage only `package.json`
   - Commit with message: `chore: Bump version to <new_version>`
   - Push `develop` to origin

6. **Create PR to merge develop into main:**
   - Create a pull request from `develop` into `main` with title `Release v<new_version>`
   - In the PR body, include:
     - The bump type (`patch` or `minor`)
     - A summary of the changes included
   - Print the PR URL

7. **Print next steps:**
   - Tell the user the release is ready and they should merge the PR on GitHub.
   - **For `patch` releases**: Merging will automatically publish an OTA update via the publish workflow.
   - **For `minor` releases**: Merging will automatically trigger a production build. After the build completes, trigger the release workflow: `gh workflow run release-production-android.yml`
