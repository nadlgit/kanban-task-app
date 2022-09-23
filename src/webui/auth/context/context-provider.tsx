import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { AuthContext } from './context';
import { getUser, onAuthChange } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import type { AuthUser } from 'core/ports';

type AuthContextProviderProps = PropsWithChildren;

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<AuthUser>(null);
  const updateUser = () => {
    setUser(getUser(authRepository));
  };

  useEffect(() => {
    updateUser();
    return onAuthChange(authRepository, updateUser);
  }, []);

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
};
