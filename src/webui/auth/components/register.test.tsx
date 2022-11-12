import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Register } from './register';
import { registerWithEmail, registerWithGoogle } from 'core/usecases';

jest.mock('core/usecases');
const mockRegisterWithEmail = registerWithEmail as jest.MockedFunction<typeof registerWithEmail>;
mockRegisterWithEmail.mockImplementation(() => {
  return Promise.resolve({ ok: true });
});
const mockRegisterWithGoogle = registerWithGoogle as jest.MockedFunction<typeof registerWithGoogle>;
mockRegisterWithGoogle.mockImplementation(() => {
  return Promise.resolve({ ok: true });
});

jest.mock('webui/routes/components/navigate');

beforeEach(() => {
  jest.clearAllMocks();
});

let userEvt = userEvent.setup();

const mockNavigateTestId = 'mock-navigate-component';
const getEmailElt = () => screen.getByLabelText(/Email/, { selector: 'input' });
const getPasswordElt = () => screen.getByLabelText(/Password/, { selector: 'input' });
const getConfirmPasswordElt = () =>
  screen.getByLabelText(/Confirm password/, { selector: 'input' });
const getUsernameElt = () => screen.getByLabelText(/Username/, { selector: 'input' });
const getEmailErrorElt = () => screen.getAllByRole('status')[0];
const getPasswordErrorElt = () => screen.getAllByRole('status')[1];
const getConfirmPwdErrorElt = () => screen.getAllByRole('status')[2];
const getUsernameErrorElt = () => screen.getAllByRole('status')[3];
const getEmailSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with email/ });
const getGoogleSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with Google/ });

describe('Register component using email method', () => {
  it.each([
    {
      desc: 'trimmed input',
      testEmail: faker.internet.email(),
      testPassword: faker.internet.password(),
      testUsername: faker.internet.userName(),
    },
    {
      desc: 'input with leading and trailing spaces',
      testEmail: `     ${faker.internet.email()}    `,
      testPassword: `  ${faker.internet.password()}  `,
      testConfirmpwd: '    ',
      testUsername: `   ${faker.internet.userName()}     `,
    },
  ])(
    'should call usecase with trimmed values: $desc',
    async ({ testEmail, testPassword, testConfirmpwd, testUsername }) => {
      const testCredential = {
        email: testEmail,
        password: testPassword,
        confirmpwd: testConfirmpwd?.match(/^\s+$/) ? ` ${testPassword}  ` : testPassword,
        username: testUsername,
      };

      userEvt = userEvent.setup();
      render(<Register />);

      await userEvt.type(getEmailElt(), testCredential.email);
      await userEvt.type(getPasswordElt(), testCredential.password);
      await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
      await userEvt.type(getUsernameElt(), testCredential.username);
      await userEvt.click(getEmailSubmitBtnElt());

      expect(getEmailElt()).toHaveDisplayValue(testCredential.email.trim());
      expect(getPasswordElt()).toHaveDisplayValue(testCredential.password.trim());
      expect(getConfirmPasswordElt()).toHaveDisplayValue(testCredential.confirmpwd.trim());
      expect(getUsernameElt()).toHaveDisplayValue(testCredential.username.trim());

      expect(registerWithEmail).toHaveBeenCalledTimes(1);
      expect(registerWithEmail).toHaveBeenLastCalledWith(
        testCredential.email.trim(),
        testCredential.password.trim(),
        testCredential.username.trim()
      );
    }
  );

  it('should handle usecase success', async () => {
    const testPassword = faker.internet.password();
    const testCredential = {
      email: faker.internet.email(),
      password: testPassword,
      confirmpwd: testPassword,
      username: faker.internet.userName(),
    };

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
    await userEvt.type(getUsernameElt(), testCredential.username);
    await userEvt.click(getEmailSubmitBtnElt());

    await screen.findByTestId(mockNavigateTestId);
  });

  it('should handle usecase error', async () => {
    const testPassword = faker.internet.password();
    const testCredential = {
      email: faker.internet.email(),
      password: testPassword,
      confirmpwd: testPassword,
      username: faker.internet.userName(),
    };

    mockRegisterWithEmail.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd);
    await userEvt.type(getUsernameElt(), testCredential.username);
    await userEvt.click(getEmailSubmitBtnElt());

    try {
      await screen.findByTestId(mockNavigateTestId);
    } catch (e) {
      //Do nothing
    }
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
  });

  it.each([
    {
      desc: 'required fields missing',
      testEmail: '   ',
      testPassword: '  ',
      testConfirmpwd: '       ',
      testUsername: '   ',
      expectedEmailError: new RegExp('Email .*required'),
      expectedPasswordError: new RegExp('Password .*required'),
      expectedConfirmpwdError: new RegExp('Confirm password .*required'),
      expectedUsernameError: new RegExp('Username .*required'),
    },
    {
      desc: 'incorrect email format',
      testEmail: faker.lorem.word(),
      testPassword: faker.internet.password(),
      testUsername: faker.internet.userName(),
      expectedEmailError: new RegExp('Email must .*valid'),
    },
    {
      desc: 'password length < 8',
      testEmail: faker.internet.email(),
      testPassword: faker.internet.password(7),
      testUsername: faker.internet.userName(),
      expectedPasswordError: new RegExp('Password must.* at least 8'),
    },
    {
      desc: 'password with spaces',
      testEmail: faker.internet.email(),
      testPassword: faker.internet.password() + ' ' + faker.lorem.word(),
      testUsername: faker.internet.userName(),
      expectedPasswordError: new RegExp('Password must .*spaces'),
    },
    {
      desc: 'confirm password mismatch',
      testEmail: faker.internet.email(),
      testPassword: faker.internet.password(),
      testConfirmpwd: faker.internet.password(),
      testUsername: faker.internet.userName(),
      expectedConfirmpwdError: new RegExp('Password.* must.* match'),
    },
  ])(
    'should handle invalid input: $desc',
    async ({
      testEmail,
      testPassword,
      testConfirmpwd,
      testUsername,
      expectedEmailError,
      expectedPasswordError,
      expectedConfirmpwdError,
      expectedUsernameError,
    }) => {
      const testCredential = {
        email: testEmail,
        password: testConfirmpwd ?? testPassword,
        confirmpwd: testPassword,
        username: testUsername,
      };

      userEvt = userEvent.setup();
      render(<Register />);
      expect(getEmailErrorElt()).toBeEmptyDOMElement();
      expect(getPasswordErrorElt()).toBeEmptyDOMElement();
      expect(getConfirmPwdErrorElt()).toBeEmptyDOMElement();
      expect(getUsernameErrorElt()).toBeEmptyDOMElement();

      testCredential.email && (await userEvt.type(getEmailElt(), testCredential.email));
      testCredential.password && (await userEvt.type(getPasswordElt(), testCredential.password));
      testCredential.confirmpwd &&
        (await userEvt.type(getConfirmPasswordElt(), testCredential.confirmpwd));
      testCredential.username && (await userEvt.type(getUsernameElt(), testCredential.username));
      await userEvt.click(getEmailSubmitBtnElt());

      expect(registerWithEmail).not.toHaveBeenCalled();

      expect(getEmailElt()).toHaveDisplayValue(testCredential.email.trim());
      expect(getPasswordElt()).toHaveDisplayValue(testCredential.password.trim());
      expect(getConfirmPasswordElt()).toHaveDisplayValue(testCredential.confirmpwd.trim());
      expect(getUsernameElt()).toHaveDisplayValue(testCredential.username.trim());

      expectedEmailError && (await screen.findByText(expectedEmailError));
      expectedPasswordError && (await screen.findByText(expectedPasswordError));
      expectedConfirmpwdError && (await screen.findByText(expectedConfirmpwdError));
      expectedUsernameError && (await screen.findByText(expectedUsernameError));

      expectedEmailError
        ? expect(getEmailErrorElt()).toHaveTextContent(expectedEmailError)
        : expect(getEmailErrorElt()).toBeEmptyDOMElement();
      expectedPasswordError
        ? expect(getPasswordErrorElt()).toHaveTextContent(expectedPasswordError)
        : expect(getPasswordErrorElt()).toBeEmptyDOMElement();
      expectedConfirmpwdError
        ? expect(getConfirmPwdErrorElt()).toHaveTextContent(expectedConfirmpwdError)
        : expect(getConfirmPwdErrorElt()).toBeEmptyDOMElement();
      expectedUsernameError
        ? expect(getUsernameErrorElt()).toHaveTextContent(expectedUsernameError)
        : expect(getUsernameErrorElt()).toBeEmptyDOMElement();
    }
  );
});

describe('Register component using Google method', () => {
  it('should call usecase', async () => {
    userEvt = userEvent.setup();
    render(<Register />);

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(registerWithGoogle).toHaveBeenCalledTimes(1);
    expect(registerWithGoogle).toHaveBeenLastCalledWith();
  });

  it('should handle usecase success', async () => {
    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    await screen.findByTestId(mockNavigateTestId);
  });

  it('should handle usecase error', async () => {
    mockRegisterWithGoogle.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<Register />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    try {
      await screen.findByTestId(mockNavigateTestId);
    } catch (e) {
      //Do nothing
    }
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();
  });
});
