import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

export async function logout() {
  const repository = Dependencies.getAuthRepository();

  if (!repository.getUser()) {
    notifyError(AUTH_NOT_LOGGED_IN_ERROR.message);
  }

  try {
    await repository.logout();
    notifySuccess();
  } catch (err) {
    notifyError((err as Error).message);
  }
}
