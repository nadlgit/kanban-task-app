import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

export async function logout() {
  const repository = Dependencies.getAuthRepository();

  if (!repository.getUser()) {
    notifyError(AUTH_NOT_LOGGED_IN_ERROR.message);
    return { ok: false };
  }

  try {
    await repository.logout();
  } catch (err) {
    notifyError((err as Error).message);
    return { ok: false };
  }

  notifySuccess();
  return { ok: true };
}
