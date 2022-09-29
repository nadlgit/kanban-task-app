import type { AuthRepository } from 'core/ports';

export function getUser(repository: AuthRepository) {
  return repository.getUser();
}

export function onAuthChange(repository: AuthRepository, callback: () => void) {
  return repository.listenToAuthChange(callback);
}
