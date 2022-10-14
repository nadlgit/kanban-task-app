import { Dependencies } from 'core/dependencies';

export function getUser() {
  const repository = Dependencies.getAuthRepository();
  return repository.getUser();
}
