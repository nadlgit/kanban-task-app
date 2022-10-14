import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

export async function registerWithEmailInteractor(
  email: string,
  password: string,
  username: string
) {
  const repository = Dependencies.getAuthRepository();
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.register({ method: 'email', email, password, username });
}

export async function registerWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();
  if (repository.getUser()) {
    throw AUTH_ALREADY_LOGGED_IN_ERROR;
  }
  await repository.register({ method: 'google' });
}
