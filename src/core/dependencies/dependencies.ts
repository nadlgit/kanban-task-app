import type { AppNotification, AuthRepository, BoardRepository } from 'core/ports';

let initialized = false;
let appNotification: AppNotification;
let authRepository: AuthRepository;
let boardRepository: BoardRepository;

export type DependenciesInitInfo = {
  appNotification: typeof appNotification;
  authRepository: typeof authRepository;
  boardRepository: typeof boardRepository;
};

export const Dependencies = {
  init: (dep: DependenciesInitInfo) => {
    if (!initialized) {
      appNotification = dep.appNotification;
      authRepository = dep.authRepository;
      boardRepository = dep.boardRepository;
      initialized = true;
    }
  },

  getAppNotification: () => {
    if (appNotification === undefined) {
      throw new Error('appNotification dependency has not been initialized');
    }
    return appNotification;
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
