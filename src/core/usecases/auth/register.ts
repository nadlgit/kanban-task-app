import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

async function registerGeneric(callback: () => Promise<void>) {
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

export async function registerWithEmailInteractor(
  email: string,
  password: string,
  username: string
) {
  const repository = Dependencies.getAuthRepository();
  await registerGeneric(() => repository.register({ method: 'email', email, password, username }));
}

export async function registerWithGoogleInteractor() {
  const repository = Dependencies.getAuthRepository();
  await registerGeneric(() => repository.register({ method: 'google' }));
}
