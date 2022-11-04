import { faker } from '@faker-js/faker';

import { loginWithEmailInteractor, loginWithGoogleInteractor } from './login';
import { notifyError, notifySuccess } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_ALREADY_LOGGED_IN_ERROR } from 'core/ports';

jest.mock('../notification');
jest.mock('core/dependencies/dependencies');

beforeEach(() => {
  jest.clearAllMocks();
});

const authRepository = Dependencies.getAuthRepository();
const mockGetUserFn = authRepository.getUser as jest.MockedFunction<typeof authRepository.getUser>;
const mockLoginFn = authRepository.login as jest.MockedFunction<typeof authRepository.login>;

describe('loginWithEmailInteractor()', () => {
  it('should handle success', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const result = await loginWithEmailInteractor(testCredential.email, testCredential.password);

    expect(result).toEqual({ ok: true });
    expect(authRepository.login).toHaveBeenCalledTimes(1);
    expect(authRepository.login).toHaveBeenLastCalledWith({
      method: 'email',
      email: testCredential.email,
      password: testCredential.password,
    });
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const testError = 'Email Error';
    mockLoginFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await loginWithEmailInteractor(testCredential.email, testCredential.password);

    expect(result).toEqual({ ok: false });
    expect(authRepository.login).toHaveBeenCalledTimes(1);
    expect(authRepository.login).toHaveBeenLastCalledWith({
      method: 'email',
      email: testCredential.email,
      password: testCredential.password,
    });
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle already logged in user', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const testError = AUTH_ALREADY_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => ({
      id: faker.datatype.uuid(),
      username: faker.internet.userName(),
    }));

    const result = await loginWithEmailInteractor(testCredential.email, testCredential.password);

    expect(result).toEqual({ ok: false });
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});

describe('loginWithGoogleInteractor()', () => {
  it('should handle success', async () => {
    const result = await loginWithGoogleInteractor();

    expect(result).toEqual({ ok: true });
    expect(authRepository.login).toHaveBeenCalledTimes(1);
    expect(authRepository.login).toHaveBeenLastCalledWith({
      method: 'google',
    });
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testError = 'Google Error';
    mockLoginFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await loginWithGoogleInteractor();

    expect(result).toEqual({ ok: false });
    expect(authRepository.login).toHaveBeenCalledTimes(1);
    expect(authRepository.login).toHaveBeenLastCalledWith({
      method: 'google',
    });
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle already logged in user', async () => {
    const testError = AUTH_ALREADY_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => ({
      id: faker.datatype.uuid(),
      username: faker.internet.userName(),
    }));

    const result = await loginWithGoogleInteractor();

    expect(result).toEqual({ ok: false });
    expect(authRepository.login).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
