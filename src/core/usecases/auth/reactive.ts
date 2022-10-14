import { Dependencies } from 'core/dependencies';

export function onAuthChange(callback: () => void) {
  const repository = Dependencies.getAuthRepository();
  return repository.listenToAuthChange(callback);
}
