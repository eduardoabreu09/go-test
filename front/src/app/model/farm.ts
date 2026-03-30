import { Entity } from './shared';

export type Farm = Entity & {
  firmware_version: string;
  created_at: string;
  updated_at: string;
};
