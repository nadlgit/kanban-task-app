import type { AppNotification, AuthRepository, BoardRepository } from 'core/ports';

let initialized = false;
let appNotification: AppNotification;
let authRepository: AuthRepository;
let boardRepository: BoardRepository;
let demoRepository: BoardRepository;
let isDemo = false;

export type DependenciesInitInfo = {
  appNotification: typeof appNotification;
  authRepository: typeof authRepository;
  boardRepository: typeof boardRepository;
  demoRepository: typeof demoRepository;
};

export const Dependencies = {
  init: (dep: DependenciesInitInfo) => {
    if (!initialized) {
      appNotification = dep.appNotification;
      authRepository = dep.authRepository;
      boardRepository = dep.boardRepository;
      demoRepository = dep.demoRepository;
      initialized = true;
    }
  },

  setIsDemo: (value: boolean) => {
    isDemo = value;
  },

  isDemo: () => isDemo,

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
    if (demoRepository === undefined) {
      throw new Error('demoRepository dependency has not been initialized');
    }
    return isDemo ? demoRepository : boardRepository;
  },
};
