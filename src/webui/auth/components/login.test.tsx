import { faker } from '@faker-js/faker';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { Login } from './login';
import { loginWithEmail, loginWithGoogle } from 'core/usecases';

jest.mock('core/usecases');
const mockLoginWithEmail = loginWithEmail as jest.MockedFunction<typeof loginWithEmail>;
mockLoginWithEmail.mockImplementation(() => {
  return Promise.resolve({ ok: true });
});
const mockLoginWithGoogle = loginWithGoogle as jest.MockedFunction<typeof loginWithGoogle>;
mockLoginWithGoogle.mockImplementation(() => {
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
const getEmailErrorElt = () => screen.getAllByRole('status')[0];
const getPasswordErrorElt = () => screen.getAllByRole('status')[1];
const getEmailSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with email/ });
const getGoogleSubmitBtnElt = () => screen.getByRole('button', { name: /Continue with Google/ });

describe('Login component using email method', () => {
  it.each([
    {
      desc: 'trimmed input',
      testEmail: faker.internet.email(),
      testPassword: faker.internet.password(),
    },
    {
      desc: 'input with leading and trailing spaces',
      testEmail: `   ${faker.internet.email()}     `,
      testPassword: `   ${faker.internet.password()}   `,
    },
  ])('should trim text input values: $desc', async ({ testEmail, testPassword }) => {
    const testCredential = {
      email: testEmail,
      password: testPassword,
    };

    userEvt = userEvent.setup();
    render(<Login />);

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.click(getEmailSubmitBtnElt());

    expect(getEmailElt()).toHaveDisplayValue(testCredential.email.trim());
    expect(getPasswordElt()).toHaveDisplayValue(testCredential.password.trim());

    expect(loginWithEmail).toHaveBeenCalledTimes(1);
    expect(loginWithEmail).toHaveBeenLastCalledWith(
      testCredential.email.trim(),
      testCredential.password.trim()
    );
  });

  it('should handle usecase success', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
    await userEvt.click(getEmailSubmitBtnElt());

    await screen.findByTestId(mockNavigateTestId);
  });

  it('should handle usecase error', async () => {
    const testCredential = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    mockLoginWithEmail.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.type(getEmailElt(), testCredential.email);
    await userEvt.type(getPasswordElt(), testCredential.password);
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
    },
    {
      desc: 'incorrect email format',
      testEmail: faker.lorem.word(),
      testPassword: faker.internet.password(),
      testUsername: faker.internet.userName(),
      expectedEmailError: new RegExp('Email must .*valid'),
    },
  ])(
    'should handle invalid input: $desc',
    async ({ testEmail, testPassword, expectedEmailError, expectedPasswordError }) => {
      const testCredential = {
        email: testEmail,
        password: testPassword,
      };

      userEvt = userEvent.setup();
      render(<Login />);
      expect(getEmailErrorElt()).toBeEmptyDOMElement();
      expect(getPasswordErrorElt()).toBeEmptyDOMElement();

      testCredential.email && (await userEvt.type(getEmailElt(), testCredential.email));
      testCredential.password && (await userEvt.type(getPasswordElt(), testCredential.password));
      await userEvt.click(getEmailSubmitBtnElt());

      expect(loginWithEmail).not.toHaveBeenCalled();

      expect(getEmailElt()).toHaveDisplayValue(testCredential.email.trim());
      expect(getPasswordElt()).toHaveDisplayValue(testCredential.password.trim());

      expectedEmailError && (await screen.findByText(expectedEmailError));
      expectedPasswordError && (await screen.findByText(expectedPasswordError));

      expectedEmailError
        ? expect(getEmailErrorElt()).toHaveTextContent(expectedEmailError)
        : expect(getEmailErrorElt()).toBeEmptyDOMElement();
      expectedPasswordError
        ? expect(getPasswordErrorElt()).toHaveTextContent(expectedPasswordError)
        : expect(getPasswordErrorElt()).toBeEmptyDOMElement();
    }
  );
});

describe('Login component using Google method', () => {
  it('should call usecase', async () => {
    userEvt = userEvent.setup();
    render(<Login />);

    await userEvt.click(getGoogleSubmitBtnElt());

    expect(loginWithGoogle).toHaveBeenCalledTimes(1);
    expect(loginWithGoogle).toHaveBeenLastCalledWith();
  });

  it('should handle usecase success', async () => {
    userEvt = userEvent.setup();
    render(<Login />);
    expect(screen.queryByTestId(mockNavigateTestId)).not.toBeInTheDocument();

    await userEvt.click(getGoogleSubmitBtnElt());

    await screen.findByTestId(mockNavigateTestId);
  });

  it('should handle usecase error', async () => {
    mockLoginWithGoogle.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<Login />);
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
