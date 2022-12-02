import { getUser } from '../auth';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

export function getUserId() {
  if (Dependencies.isDemo()) {
    return 'demo';
  }

  const user = getUser();
  if (!user) {
    notifyError(AUTH_NOT_LOGGED_IN_ERROR.message);
    return;
  }
  return user.id;
}
