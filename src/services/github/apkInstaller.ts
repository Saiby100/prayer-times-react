import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import log from '@/utils/logger';

const APK_FILENAME = 'reminder-update.apk';

type DownloadProgress = {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
};

export async function downloadAndInstallApk(
  url: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  const fileUri = `${FileSystem.cacheDirectory}${APK_FILENAME}`;

  log.info('apkInstaller: starting APK download', { type: 'update', url });

  const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {}, (data) => {
    const { totalBytesWritten, totalBytesExpectedToWrite } = data as DownloadProgress;
    if (totalBytesExpectedToWrite > 0) {
      const progress = Math.round((totalBytesWritten / totalBytesExpectedToWrite) * 100);
      onProgress?.(progress);
    }
  });

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) {
    throw new Error('Download failed: no file URI returned');
  }

  log.info('apkInstaller: download complete, launching installer', { type: 'update' });

  const contentUri = await FileSystem.getContentUriAsync(result.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
    data: contentUri,
    flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
    type: 'application/vnd.android.package-archive',
  });
}
