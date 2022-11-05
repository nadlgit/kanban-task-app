import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

async function registerGeneric(callback: () => Promise<void>) {
  const repository = Dependencies.getAuthRepository();

  if (repository.getUser()) {
    notifyError(AUTH_ALREADY_LOGGED_IN_ERROR.message);
    return { ok: false };
  }

  try {
    await callback();
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  notifySuccess();
  return { ok: true };
}

export async function registerWithEmail(email: string, password: string, username: string) {
  const repository = Dependencies.getAuthRepository();
  return await registerGeneric(() =>
    repository.register({ method: 'email', email, password, username })
  );
}

export async function registerWithGoogle() {
  const repository = Dependencies.getAuthRepository();
  return await registerGeneric(() => repository.register({ method: 'google' }));
}
