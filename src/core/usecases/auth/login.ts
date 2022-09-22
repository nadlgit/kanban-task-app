import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';
import type { AuthProvider } from 'core/ports';

export async function loginWithEmailInteractor(
  repository: AuthProvider,
  email: string,
  password: string
) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'email', email, password });
}

export async function loginWithGoogleInteractor(repository: AuthProvider) {
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'google' });
}
