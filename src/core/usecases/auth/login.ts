import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

export async function loginWithEmailInteractor(email: string, password: string) {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
  }

  try {
    await repository.login({ method: 'email', email, password });
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}

export async function loginWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
  }

  try {
    await repository.login({ method: 'google' });
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}
