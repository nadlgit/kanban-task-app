import { createContext } from 'react';

import type { AuthUser } from 'core/ports';

export const AuthContext = createContext<AuthUser | undefined>(undefined);
