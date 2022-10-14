import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { AuthContext } from './context';
import type { AuthUser } from 'core/ports';
import { getUser, onAuthChange } from 'core/usecases';

type AuthContextProviderProps = PropsWithChildren;

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser>(null);
  const updateUser = () => {
    setLoading(true);
    setUser(getUser());
    setLoading(false);
  };

  useEffect(() => {
    updateUser();
    return onAuthChange(updateUser);
  }, []);

  return <AuthContext.Provider value={{ loading, user }}>{children}</AuthContext.Provider>;
};
