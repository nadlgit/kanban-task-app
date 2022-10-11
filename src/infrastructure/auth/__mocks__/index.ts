import type { AuthRepository } from 'core/ports';

export const authRepository: AuthRepository = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn(),
  listenToAuthChange: jest.fn(),
};
