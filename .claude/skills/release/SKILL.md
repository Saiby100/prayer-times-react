---
name: release
description: Bump app version, commit, merge develop into main, and push for production release
disable-model-invocation: true
---

# Release

Create a new production release by bumping the version, committing, merging to main, and pushing.

## Arguments

The user must provide a bump type: `major`, `minor`, or `patch`.

## Steps

1. **Validate preconditions:**
   - Confirm the current branch is `develop`
   - Confirm the working tree is clean (no uncommitted changes)
   - Validate that the bump type argument is one of: `major`, `minor`, or `patch`
   - If any check fails, stop and tell the user what to fix

2. **Calculate the new version:**
   - Read the current version from `package.json`
   - Apply the bump type to calculate the new semver version (e.g. `1.1.0` + `minor` = `1.2.0`)
   - Tell the user the current and new version, and ask for confirmation before proceeding

3. **Bump the version:**
   - Update the `version` field in `package.json` to the new version

4. **Commit and push on develop:**
   - Stage only `package.json`
   - Commit with message: `chore: Bump version to <new_version>`
   - Push `develop` to origin

5. **Create PR to merge develop into main:**
   - Create a pull request from `develop` into `main` with title `Release v<new_version>`
   - Print the PR URL

6. **Print next steps:**
   - Tell the user the release is ready and they should:
     1. Merge the PR on GitHub
     2. Run the production EAS build: `eas build --profile production --platform android`
     3. After the build completes, trigger the release workflow: `gh workflow run release-production-android.yml`
