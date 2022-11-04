import { faker } from '@faker-js/faker';

import { registerWithEmailInteractor, registerWithGoogleInteractor } from './register';
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
const mockRegisterFn = authRepository.register as jest.MockedFunction<
  typeof authRepository.register
>;

describe('registerWithEmailInteractor()', () => {
  it('should handle success', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.internet.userName(),
    };

    const result = await registerWithEmailInteractor(
      testCredential.email,
      testCredential.password,
      testCredential.username
    );

    expect(result).toEqual({ ok: true });
    expect(authRepository.register).toHaveBeenCalledTimes(1);
    expect(authRepository.register).toHaveBeenLastCalledWith({
      method: 'email',
      email: testCredential.email,
      password: testCredential.password,
      username: testCredential.username,
    });
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.internet.userName(),
    };

    const testError = 'Email Error';
    mockRegisterFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await registerWithEmailInteractor(
      testCredential.email,
      testCredential.password,
      testCredential.username
    );

    expect(result).toEqual({ ok: false });
    expect(authRepository.register).toHaveBeenCalledTimes(1);
    expect(authRepository.register).toHaveBeenLastCalledWith({
      method: 'email',
      email: testCredential.email,
      password: testCredential.password,
      username: testCredential.username,
    });
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle already logged in user', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      username: faker.internet.userName(),
    };

    const testError = AUTH_ALREADY_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => ({
      id: faker.datatype.uuid(),
      username: faker.internet.userName(),
    }));

    const result = await registerWithEmailInteractor(
      testCredential.email,
      testCredential.password,
      testCredential.username
    );

    expect(result).toEqual({ ok: false });
    expect(authRepository.register).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});

describe('registerWithGoogleInteractor()', () => {
  it('should handle success', async () => {
    const result = await registerWithGoogleInteractor();

    expect(result).toEqual({ ok: true });
    expect(authRepository.register).toHaveBeenCalledTimes(1);
    expect(authRepository.register).toHaveBeenLastCalledWith({
      method: 'google',
    });
    expect(notifySuccess).toHaveBeenCalledTimes(1);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testError = 'Google Error';
    mockRegisterFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await registerWithGoogleInteractor();

    expect(result).toEqual({ ok: false });
    expect(authRepository.register).toHaveBeenCalledTimes(1);
    expect(authRepository.register).toHaveBeenLastCalledWith({
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

    const result = await registerWithGoogleInteractor();

    expect(result).toEqual({ ok: false });
    expect(authRepository.register).not.toHaveBeenCalled();
    expect(notifySuccess).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
