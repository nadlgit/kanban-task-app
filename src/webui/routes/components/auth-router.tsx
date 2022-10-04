import { useRouter } from 'next/router';
import type { PropsWithChildren } from 'react';

import { useAuth } from 'webui/auth';
import { Loading } from 'webui/misc';
import { Navigate, LOGIN_ROUTE, REGISTER_ROUTE } from 'webui/routes';

const isPublicRoute = (route: string) => [LOGIN_ROUTE, REGISTER_ROUTE].includes(route);

const isLoginRegisterRoute = (route: string) => [LOGIN_ROUTE, REGISTER_ROUTE].includes(route);

type AuthRouterProps = PropsWithChildren;

export const AuthRouter = ({ children }: AuthRouterProps) => {
  const { loading, user } = useAuth();
  const router = useRouter();

  if (loading) {
    return <Loading />;
  }

  if (!user && !isPublicRoute(router.pathname)) {
    return <Navigate to={LOGIN_ROUTE} />;
  }

  if (user && isLoginRegisterRoute(router.pathname)) {
    return <Navigate to="/" />;
  }

  return children as JSX.Element;
};
