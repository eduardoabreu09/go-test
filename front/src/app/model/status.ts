export type DownloadStatus = 'PENDING' | 'COMPLETED' | 'ERROR';

export type DownloadStatusValue = {
  download_status: DownloadStatus;
  valid: boolean;
};

export function isDownloadStatus(value: string): value is DownloadStatus {
  return value === 'PENDING' || value === 'COMPLETED' || value === 'ERROR';
}
