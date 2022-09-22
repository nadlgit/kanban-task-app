import type { AuthProvider } from 'core/ports';

export function getUser(repository: AuthProvider) {
  return repository.getUser();
}

export function onAuthChange(repository: AuthProvider, callback: () => void) {
  return repository.listenToAuthChange(callback);
}
