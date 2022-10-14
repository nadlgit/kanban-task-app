import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

export async function loginWithEmailInteractor(email: string, password: string) {
  const repository = Dependencies.getAuthRepository();
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'email', email, password });
}

export async function loginWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.login({ method: 'google' });
}
