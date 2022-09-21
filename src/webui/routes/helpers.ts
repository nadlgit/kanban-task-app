export const LOGIN_ROUTE = '/login';
export const REGISTER_ROUTE = '/register';
export const BOARDS_ROUTE = '/boards';

export const isPublicRoute = (route: string) => {
  const PUBLIC_ROUTES = Object.freeze([LOGIN_ROUTE, REGISTER_ROUTE]);
  return PUBLIC_ROUTES.includes(route);
};
