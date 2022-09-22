import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';
import type { AuthProvider } from 'core/ports';

export async function logout(repository: AuthProvider) {
  if (!repository.getUser()) {
    throw AUTH_NOT_LOGGED_IN_ERROR;
  }
  await repository.logout();
}
