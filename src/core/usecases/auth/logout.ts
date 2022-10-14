import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

export async function logout() {
  const repository = Dependencies.getAuthRepository();
  if (!repository.getUser()) {
    throw AUTH_NOT_LOGGED_IN_ERROR;
  }
  await repository.logout();
}
