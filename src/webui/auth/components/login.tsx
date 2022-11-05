import * as yup from 'yup';

import { LoginRegister } from './login-register';
import { loginWithEmail, loginWithGoogle } from 'core/usecases';
import { REGISTER_ROUTE } from 'webui/routes';

const emailFormFields = {
  email: {
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Email',
    validationSchema: yup.string().label('Email').trim().email().required(),
  },
  password: {
    id: 'password',
    name: 'password',
    type: 'password',
    label: 'Password',
    validationSchema: yup.string().label('Password').trim().required(),
  },
};

export const Login = () => {
  return (
    <LoginRegister
      title="Log in"
      emailMethod={{
        fields: emailFormFields,
        onSubmit: (data: Record<keyof typeof emailFormFields, string>) =>
          loginWithEmail(data.email, data.password),
      }}
      googleMethod={{ onSubmit: () => loginWithGoogle() }}
      alternative={{
        message: "Don't have an account?",
        linkLbl: 'Register',
        linkTo: REGISTER_ROUTE,
      }}
    />
  );
};
