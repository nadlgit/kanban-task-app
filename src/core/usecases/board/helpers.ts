import { getUser } from '../auth';
import { notifyError } from '../notification';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

export function getUserId() {
  const user = getUser();
  if (!user) {
    notifyError(AUTH_NOT_LOGGED_IN_ERROR.message);
    return;
  }
  return user.id;
}
