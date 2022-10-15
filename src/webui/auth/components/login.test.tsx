import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Login } from './login';
import { loginWithEmailInteractor, loginWithGoogleInteractor } from 'core/usecases';

jest.mock('core/usecases');
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

let userEvt = userEvent.setup();

const mockNavigateTestId = 'mock-navigate-component';
const getEmailElt = () => screen.getByLabelText(/Email/, { selector: 'input' });
const getPasswordElt = () => screen.getByLabelText(/Password/, { selector: 'input' });
const getEmailSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with email/ });
const getGoogleSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with Google/ });

describe('Login component using email method', () => {
  it('when succeeds', async () => {
    const testCredential = { email: faker.internet.email(), password: faker.internet.password() };

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(loginWithEmailInteractor).toHaveBeenCalledTimes(1);
    expect(loginWithEmailInteractor).toHaveBeenLastCalledWith(
      testCredential.email,
      testCredential.password
    );
    await screen.findByTestId(mockNavigateTestId);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
  });

  it('when fails', async () => {
    const testCredential = { email: faker.internet.email(), password: faker.internet.password() };
    const testError = new Error('Invalid credentials');
    (loginWithEmailInteractor as jest.MockedFunction<typeof loginWithEmailInteractor>)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementation((email, password) => Promise.reject(testError));

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(loginWithEmailInteractor).toHaveBeenCalledTimes(1);
    expect(loginWithEmailInteractor).toHaveBeenLastCalledWith(
      testCredential.email,
      testCredential.password
    );
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(
      expect.stringMatching(new RegExp(testError.message))
    );
  });

  it.skip('when inputs are invalid', async () => {
    const testCredential = { email: ' ', password: ' ' };

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(loginWithEmailInteractor).not.toHaveBeenCalled();
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
  });
});

describe('Login component using Google method', () => {
  it('when succeeds', async () => {
    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
    expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith();
    await screen.findByTestId(mockNavigateTestId);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
  });

  it('when fails', async () => {
    const testError = new Error('Google error');
    (
      loginWithGoogleInteractor as jest.MockedFunction<typeof loginWithGoogleInteractor>
    ).mockImplementation(() => Promise.reject(testError));

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(loginWithGoogleInteractor).toHaveBeenCalledTimes(1);
    expect(loginWithGoogleInteractor).toHaveBeenLastCalledWith();
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(
      expect.stringMatching(new RegExp(testError.message))
    );
  });
});
