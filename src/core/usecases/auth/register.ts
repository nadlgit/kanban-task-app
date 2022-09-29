import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';
import type { AuthRepository } from 'core/ports';

export async function registerWithEmailInteractor(
  repository: AuthRepository,
  email: string,
  password: string,
  username: string
) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.register({ method: 'email', email, password, username });
}

export async function registerWithGoogleInteractor(repository: AuthRepository) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.register({ method: 'google' });
}
