import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';
import type { AuthRepository } from 'core/ports';

export async function loginWithEmailInteractor(
  repository: AuthRepository,
  email: string,
  password: string
) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'email', email, password });
}

export async function loginWithGoogleInteractor(repository: AuthRepository) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'google' });
}
