import { faker } from '@faker-js/faker';

import { logout } from './logout';
import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

jest.mock('../notification');
jest.mock('core/dependencies/dependencies');

beforeEach(() => {
  jest.clearAllMocks();
});

const authRepository = Dependencies.getAuthRepository();
const mockGetUserFn = authRepository.getUser as jest.MockedFunction<typeof authRepository.getUser>;
mockGetUserFn.mockImplementation(() => ({
  id: faker.datatype.uuid(),
  username: faker.internet.userName(),
}));
const mockLogoutFn = authRepository.logout as jest.MockedFunction<typeof authRepository.logout>;

describe('logout()', () => {
  it('should handle success', async () => {
    await logout();

    expect(authRepository.logout).toHaveBeenCalledTimes(1);
    expect(authRepository.logout).toHaveBeenLastCalledWith();
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testError = 'Log out Error';
    mockLogoutFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    await logout();

    expect(authRepository.logout).toHaveBeenCalledTimes(1);
    expect(authRepository.logout).toHaveBeenLastCalledWith();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle already logged in user', async () => {
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(jest.fn());

    await logout();

    expect(authRepository.logout).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
