import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Login } from './login';
import { loginWithEmailInteractor, loginWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';

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

const getMockNavigateElt = () => screen.queryByTestId('mock-navigate-component');
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
      expect(getMockNavigateElt()).not.toBeInTheDocument();

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
      expect(getMockNavigateElt()).toBeInTheDocument();
    });

    it('when fails', async () => {
      const testCredential = { email: faker.internet.email(), password: faker.internet.password() };
      const testError = new Error('Invalid credentials');
      (loginWithEmailInteractor as jest.MockedFunction<typeof loginWithEmailInteractor>)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((repository, email, password) => Promise.reject(testError));

      userEvt = userEvent.setup();
      render(<Login />);
      expect(getMockNavigateElt()).not.toBeInTheDocument();

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
      expect(getMockNavigateElt()).not.toBeInTheDocument();
    });

    it.skip('when inputs are invalid', async () => {
      const testCredential = { email: ' ', password: ' ' };

      userEvt = userEvent.setup();
      render(<Login />);
      expect(getMockNavigateElt()).not.toBeInTheDocument();

      await userEvt.type(getEmailElt(), testCredential.email);
      await userEvt.type(getPasswordElt(), testCredential.password);
      await userEvt.click(getEmailSubmitBtnElt());

      expect(loginWithEmailInteractor).not.toHaveBeenCalled();
      expect(getMockNavigateElt()).not.toBeInTheDocument();
    });
  });

  describe('using Google method', () => {
    it('when succeeds', async () => {
      userEvt = userEvent.setup();
      render(<Login />);
      expect(getMockNavigateElt()).not.toBeInTheDocument();

      await userEvt.click(getGoogleSubmitBtnElt());

      expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith(authRepository);
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
      expect(getMockNavigateElt()).toBeInTheDocument();
    });

    it('when fails', async () => {
      const testError = new Error('Google error');
      (loginWithGoogleInteractor as jest.MockedFunction<typeof loginWithGoogleInteractor>)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .mockImplementation((repository) => Promise.reject(testError));

      userEvt = userEvent.setup();
      render(<Login />);
      expect(getMockNavigateElt()).not.toBeInTheDocument();

      await userEvt.click(getGoogleSubmitBtnElt());

      expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
      expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith(authRepository);
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(window.alert).toHaveBeenLastCalledWith(
        expect.stringMatching(new RegExp(testError.message))
      );
      expect(getMockNavigateElt()).not.toBeInTheDocument();
    });
  });
});
