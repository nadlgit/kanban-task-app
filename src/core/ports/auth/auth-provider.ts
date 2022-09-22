import type { UserEntity } from 'core/entities';

type EmailAuthMethod = 'email';
type ProviderAuthMethod = 'google';

export type RegisterInfo =
  | {
      method: EmailAuthMethod;
      email: string;
      password: string;
      username: string;
    }
  | {
      method: ProviderAuthMethod;
    };

export type LoginInfo =
  | {
      method: EmailAuthMethod;
      email: string;
      password: string;
    }
  | {
      method: ProviderAuthMethod;
    };

export type AuthUser = UserEntity | null;

export type AuthProvider = {
  register: (authInfo: RegisterInfo) => Promise<void>;
  login: (authInfo: LoginInfo) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => AuthUser;
  listenToAuthChange: (callback: () => void) => () => void;
};
