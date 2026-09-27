/** @type {import('expo/fingerprint').Config} */
const { SourceSkips } = require('expo/fingerprint');

// Skip config fields that change without touching the native layer, so the
// fingerprint (and therefore runtimeVersion) only changes when a new build is needed.
module.exports = {
  sourceSkips:
    SourceSkips.ExpoConfigVersions | // version / versionCode bumps
    SourceSkips.ExpoConfigRuntimeVersionIfString |
    SourceSkips.ExpoConfigExtraSection | // extra.commitHash changes on every commit
    SourceSkips.PackageJsonAndroidAndIosScriptsIfNotContainRun, // expo default
};
