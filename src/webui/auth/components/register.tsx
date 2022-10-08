import { LoginRegister } from './login-register';
import { registerWithEmailInteractor, registerWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { LOGIN_ROUTE } from 'webui/routes';

const emailFormFields = {
  email: { id: 'email', name: 'email', type: 'email', label: 'Email' },
  password: { id: 'password', name: 'password', type: 'password', label: 'Password' },
  confirmpwd: { id: 'confirmpwd', name: 'confirmpwd', type: 'password', label: 'Confirm password' },
  username: { id: 'username', name: 'username', type: 'text', label: 'Username' },
};

export const Register = () => {
  return (
    <LoginRegister
      title="Register"
      emailMethod={{
        fields: Object.entries(emailFormFields).map(([key, value]) => ({
          fieldName: key,
          componentProps: value,
        })),
        onSubmit: (data: Record<keyof typeof emailFormFields, string>) =>
          registerWithEmailInteractor(authRepository, data.email, data.password, data.username),
      }}
      googleMethod={{ onSubmit: () => registerWithGoogleInteractor(authRepository) }}
      alternative={{
        message: 'Already have an account?',
        linkLbl: 'Log in',
        linkTo: LOGIN_ROUTE,
      }}
    />
  );
};
