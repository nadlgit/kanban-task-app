import { LoginRegister } from './login-register';
import { loginWithEmailInteractor, loginWithGoogleInteractor } from 'core/usecases';
import { REGISTER_ROUTE } from 'webui/routes';

const emailFormFields = {
  email: { id: 'email', name: 'email', type: 'email', label: 'Email' },
  password: { id: 'password', name: 'password', type: 'password', label: 'Password' },
};

export const Login = () => {
  return (
    <LoginRegister
      title="Log in"
      emailMethod={{
        fields: Object.entries(emailFormFields).map(([key, value]) => ({
          fieldName: key,
          componentProps: value,
        })),
        onSubmit: (data: Record<keyof typeof emailFormFields, string>) =>
          loginWithEmailInteractor(data.email, data.password),
      }}
      googleMethod={{ onSubmit: () => loginWithGoogleInteractor() }}
      alternative={{
        message: "Don't have an account?",
        linkLbl: 'Register',
        linkTo: REGISTER_ROUTE,
      }}
    />
  );
};
