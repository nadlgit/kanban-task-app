import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

export async function registerWithEmailInteractor(
  email: string,
  password: string,
  username: string
) {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
  }

  try {
    await repository.register({ method: 'email', email, password, username });
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}

export async function registerWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
  }

  try {
    await repository.register({ method: 'google' });
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}
