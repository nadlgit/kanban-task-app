import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Login } from './login';
import { loginWithEmailInteractor, loginWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate } from 'webui/routes';

jest.mock('core/usecases');
jest.mock('infrastructure/auth');
jest.mock('webui/routes/components/navigate');

const originalAlert = window.alert;
beforeAll(() => {
  window.alert = jest.fn();
});
afterAll(() => {
  window.alert = originalAlert;
});

beforeEach(() => {
  jest.resetAllMocks();
});

const getEmailElt = () => screen.getByLabelText(/Email/, { selector: 'input' });
const getPasswordElt = () => screen.getByLabelText(/Password/, { selector: 'input' });
const getEmailSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with email/ });
const getGoogleSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with Google/ });

describe('Login component', () => {
  let userEvt = userEvent.setup();

  describe('using email method', () => {
    it('when succeeds', async () => {
      const testCredential = { email: faker.internet.email(), password: faker.internet.password() };

      userEvt = userEvent.setup();
      render(<Login />);

      await userEvt.type(getEmailElt(), testCredential.email);
      await userEvt.type(getPasswordElt(), testCredential.password);
      await userEvt.click(getEmailSubmitBtnElt());

      expect(loginWithEmailInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithEmailInteractor).toHaveBeenLastCalledWith(
        authRepository,
        testCredential.email,
        testCredential.password
      );
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
      expect(Navigate).toHaveBeenCalledTimes(1);
    });

    it('when fails', async () => {
      const testCredential = { email: faker.internet.email(), password: faker.internet.password() };
      const testError = new Error('Invalid credentials');
      const mockLoginWithEmailInteractor = loginWithEmailInteractor as jest.MockedFunction<
        typeof loginWithEmailInteractor
      >;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockLoginWithEmailInteractor.mockImplementation((repository, email, password) =>
        Promise.reject(testError)
      );

      userEvt = userEvent.setup();
      render(<Login />);

      await userEvt.type(getEmailElt(), testCredential.email);
      await userEvt.type(getPasswordElt(), testCredential.password);
      await userEvt.click(getEmailSubmitBtnElt());

      expect(loginWithEmailInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithEmailInteractor).toHaveBeenLastCalledWith(
        authRepository,
        testCredential.email,
        testCredential.password
      );
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(testError.message))
      );
      expect(Navigate).not.toHaveBeenCalled();
    });

    it.skip('when inputs are invalid', async () => {
      const testCredential = { email: ' ', password: ' ' };

      userEvt = userEvent.setup();
      render(<Login />);

      await userEvt.type(getEmailElt(), testCredential.email);
      await userEvt.type(getPasswordElt(), testCredential.password);
      await userEvt.click(getEmailSubmitBtnElt());

      expect(loginWithEmailInteractor).not.toHaveBeenCalled();
      expect(Navigate).not.toHaveBeenCalled();
    });
  });

  describe('using Google method', () => {
    it('when succeeds', async () => {
      userEvt = userEvent.setup();
      render(<Login />);

      await userEvt.click(getGoogleSubmitBtnElt());

      expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith(authRepository);
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
      expect(Navigate).toHaveBeenCalledTimes(1);
    });

    it('when fails', async () => {
      const testError = new Error('Google error');
      const mockLoginWithGoogleInteractor = loginWithGoogleInteractor as jest.MockedFunction<
        typeof loginWithGoogleInteractor
      >;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockLoginWithGoogleInteractor.mockImplementation((repository) => Promise.reject(testError));

      userEvt = userEvent.setup();
      render(<Login />);

      await userEvt.click(getGoogleSubmitBtnElt());

      expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith(authRepository);
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(testError.message))
      );
      expect(Navigate).not.toHaveBeenCalled();
    });
  });
});
