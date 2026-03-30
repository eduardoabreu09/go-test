import { Entity } from './shared';

export type User = Entity & {
  name: string;
  email: string;
  created_at: string;
};
