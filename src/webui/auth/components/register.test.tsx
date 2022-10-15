import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Register } from './register';
import { registerWithEmailInteractor, registerWithGoogleInteractor } from 'core/usecases';

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
const getConfirmPasswordElt = () =>
  screen.getByLabelText(/Confirm password/, { selector: 'input' });
const getUsernameElt = () => screen.getByLabelText(/Username/, { selector: 'input' });
const getEmailSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with email/ });
const getGoogleSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with Google/ });

describe('Register component using email method', () => {
  it('when succeeds', async () => {
    const testPassword = faker.internet.password();
    const testCredential = {
      email: faker.internet.email(),
      password: testPassword,
      confirmpwd: testPassword,
      username: faker.internet.userName(),
    };
    expect(testCredential.confirmpwd).toEqual(testCredential.password);

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
    await userEvt.type(getUsernameElt(), testCredential.username);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(registerWithEmailInteractor).toHaveBeenCalledTimes(1);
    expect(registerWithEmailInteractor).toHaveBeenLastCalledWith(
      testCredential.email,
      testCredential.password,
      testCredential.username
    );
    await screen.findByTestId(mockNavigateTestId);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
  });

  it('when fails', async () => {
    const testPassword = faker.internet.password();
    const testCredential = {
      email: faker.internet.email(),
      password: testPassword,
      confirmpwd: testPassword,
      username: faker.internet.userName(),
    };
    expect(testCredential.confirmpwd).toEqual(testCredential.password);

    const testError = new Error('Unable to register');
    (registerWithEmailInteractor as jest.MockedFunction<typeof registerWithEmailInteractor>)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementation((email, password) => Promise.reject(testError));

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
    await userEvt.type(getUsernameElt(), testCredential.username);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(registerWithEmailInteractor).toHaveBeenCalledTimes(1);
    expect(registerWithEmailInteractor).toHaveBeenLastCalledWith(
      testCredential.email,
      testCredential.password,
      testCredential.username
    );
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(
      expect.stringMatching(new RegExp(testError.message))
    );
  });

  it.skip('when inputs are invalid', async () => {
    // const testPassword = faker.internet.password();
    const testCredential = { email: ' ', password: ' ', confirmpwd: ' ', username: ' ' };
    //expect(testCredential.confirmpwd).toEqual(testCredential.password);

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
    await userEvt.type(getUsernameElt(), testCredential.username);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(registerWithEmailInteractor).not.toHaveBeenCalled();
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
  });
});

describe('Register component using Google method', () => {
  it('when succeeds', async () => {
    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(registerWithGoogleInteractor).toHaveBeenCalledTimes(1);
    expect(registerWithGoogleInteractor).toHaveBeenLastCalledWith();
    await screen.findByTestId(mockNavigateTestId);
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(expect.stringMatching(/Successfull/));
  });

  it('when fails', async () => {
    const testError = new Error('Google error');
    (
      registerWithGoogleInteractor as jest.MockedFunction<typeof registerWithGoogleInteractor>
    ).mockImplementation(() => Promise.reject(testError));

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(registerWithGoogleInteractor).toHaveBeenCalledTimes(1);
    expect(registerWithGoogleInteractor).toHaveBeenLastCalledWith();
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledTimes(1);
    expect(window.alert).toHaveBeenLastCalledWith(
      expect.stringMatching(new RegExp(testError.message))
    );
  });
});
