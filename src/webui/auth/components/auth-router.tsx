import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';

import { useAuth } from 'webui/auth';
import { isPublicRoute, Navigate, LOGIN_ROUTE, REGISTER_ROUTE } from 'webui/routes';

type AuthRouterProps = PropsWithChildren;

export const AuthRouter = ({ children }: AuthRouterProps) => {
  const user = useAuth();
  const router = useRouter();

  if (!user && !isPublicRoute(router.pathname)) {
    return <Navigate to={LOGIN_ROUTE} />;
  }

  if (user && (router.pathname === LOGIN_ROUTE || router.pathname === REGISTER_ROUTE)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};
