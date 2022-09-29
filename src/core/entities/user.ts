import { UniqueId } from 'core/entities';

export type UserEntity = {
  id: UniqueId;
  username: string;
  avatar_url?: string;
};
