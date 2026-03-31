import { Entity } from './shared';
import { DownloadStatusValue } from './status';

export type FarmUpdate = Entity & {
  status: DownloadStatusValue;
  firmware_version: string;
  farm_id: number;
  created_at: string;
  updated_at: string;
};
