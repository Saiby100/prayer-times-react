#!/usr/bin/env bash
# Checks whether a production Android build exists for the current native fingerprint.
# Writes to $GITHUB_OUTPUT:
#   runtime_version     fingerprint-based runtime version of the current commit
#   has_finished_build  true if a finished build exists (safe to publish an OTA update)
#   has_active_build    true if a build is new, queued, in progress or finished (no new build needed)
set -euo pipefail

RUNTIME_VERSION=$(npx expo-updates runtimeversion:resolve --platform android | tail -n 1 | jq -r '.runtimeVersion')

BUILDS=$(eas build:list \
  --platform android \
  --build-profile production \
  --runtime-version "$RUNTIME_VERSION" \
  --limit 20 \
  --json \
  --non-interactive)

STATUSES=$(echo "$BUILDS" | jq -r '.[].status | ascii_upcase')

HAS_FINISHED_BUILD=false
HAS_ACTIVE_BUILD=false
if echo "$STATUSES" | grep -qx 'FINISHED'; then
  HAS_FINISHED_BUILD=true
fi
if echo "$STATUSES" | grep -qxE 'NEW|IN_QUEUE|IN_PROGRESS|FINISHED'; then
  HAS_ACTIVE_BUILD=true
fi

echo "Runtime version: $RUNTIME_VERSION"
echo "Build statuses: $(echo "$STATUSES" | tr '\n' ' ')"
echo "Has finished build: $HAS_FINISHED_BUILD"
echo "Has active build: $HAS_ACTIVE_BUILD"

{
  echo "runtime_version=$RUNTIME_VERSION"
  echo "has_finished_build=$HAS_FINISHED_BUILD"
  echo "has_active_build=$HAS_ACTIVE_BUILD"
} >> "${GITHUB_OUTPUT:-/dev/stdout}"
