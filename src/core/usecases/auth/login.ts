import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

async function loginGeneric(callback: () => Promise<void>) {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
    return;
  }

  try {
    await callback();
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}

export async function loginWithEmailInteractor(email: string, password: string) {
  const repository = Dependencies.getAuthRepository();
  await loginGeneric(() => repository.login({ method: 'email', email, password }));
}

export async function loginWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();
  await loginGeneric(() => repository.login({ method: 'google' }));
}
