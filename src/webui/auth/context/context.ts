import { createContext } from 'react';

import type { AuthUser } from 'core/ports';

export const AuthContext = createContext<{ loading: boolean; user: AuthUser } | undefined>(
  undefined
);
