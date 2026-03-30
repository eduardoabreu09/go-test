import { Entity } from './shared';
import { DonwloadStatus } from './status';

export type Update = Entity & {
  status: DonwloadStatus;
  firmware_version: string;
  farm_id: number;
  created_at: string;
  updated_at: string;
};
