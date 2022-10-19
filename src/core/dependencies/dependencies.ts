import type { AuthRepository, BoardRepository } from 'core/ports';

let initialized = false;
let authRepository: AuthRepository;
let boardRepository: BoardRepository;

export type DependenciesInitInfo = {
  authRepository: typeof authRepository;
  boardRepository: typeof boardRepository;
};

export const Dependencies = {
  init: (dep: DependenciesInitInfo) => {
    if (!initialized) {
      authRepository = dep.authRepository;
      boardRepository = dep.boardRepository;
      initialized = true;
    }
  },

  getAuthRepository: () => {
    if (authRepository === undefined) {
      throw new Error('authRepository dependency has not been initialized');
    }
    return authRepository;
  },

  getBoardRepository: () => {
    if (boardRepository === undefined) {
      throw new Error('boardRepository dependency has not been initialized');
    }
    return boardRepository;
  },
};
