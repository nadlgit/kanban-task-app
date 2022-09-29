import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';
import type { AuthRepository } from 'core/ports';

export async function logout(repository: AuthRepository) {
  if (!repository.getUser()) {
    throw AUTH_NOT_LOGGED_IN_ERROR;
  }
  await repository.logout();
}
