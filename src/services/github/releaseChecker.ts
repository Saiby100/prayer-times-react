import {
  getLastReleaseCheck,
  setLastReleaseCheck,
  getDismissedReleaseVersion,
  setDismissedReleaseVersion,
} from '@/stores';
import log from '@/utils/logger';

const GITHUB_API_URL = 'https://api.github.com/repos/Saiby100/prayer-times-react/releases/latest';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

type LatestRelease = {
  /** Git tag of the release (e.g. "v1.2.0"). */
  tagName: string;
  /** URL to the GitHub release page. */
  htmlUrl: string;
  /** Direct download URL for the APK asset, or null if unavailable. */
  apkDownloadUrl: string | null;
};

export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const [latestParts, currentParts] = [parse(latest), parse(current)];

  if (latestParts.length !== 3 || latestParts.some(isNaN)) return false;
  if (currentParts.length !== 3 || currentParts.some(isNaN)) return false;

  for (let i = 0; i < 3; i++) {
    if (latestParts[i] > currentParts[i]) return true;
    if (latestParts[i] < currentParts[i]) return false;
  }
  return false;
}

export function shouldCheckForRelease(): boolean {
  const lastCheck = getLastReleaseCheck();
  if (!lastCheck) return true;
  return Date.now() - lastCheck >= CHECK_INTERVAL_MS;
}

export function markReleaseChecked(): void {
  setLastReleaseCheck(Date.now());
}

export { getDismissedReleaseVersion as getDismissedVersion };

export function setDismissedVersion(version: string): void {
  setDismissedReleaseVersion(version);
}

export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(GITHUB_API_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      log.warn('releaseChecker: GitHub API returned non-OK status', {
        type: 'update',
        status: response.status,
      });
      return null;
    }

    const data = await response.json();
    const apkAsset = (data.assets ?? []).find((a: { name: string }) => a.name.endsWith('.apk'));
    return {
      tagName: data.tag_name,
      htmlUrl: data.html_url,
      apkDownloadUrl: apkAsset?.browser_download_url ?? null,
    };
  } catch (e) {
    log.warn('releaseChecker: failed to fetch latest release', {
      type: 'update',
      error: String(e),
    });
    return null;
  }
}
