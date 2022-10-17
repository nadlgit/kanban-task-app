import * as yup from 'yup';

import { LoginRegister } from './login-register';
import { registerWithEmailInteractor, registerWithGoogleInteractor } from 'core/usecases';
import { LOGIN_ROUTE } from 'webui/routes';

const emailFormFields = {
  email: {
    id: 'email',
    name: 'email',
    type: 'email',
    label: 'Email',
    validationSchema: yup.string().label('Email').email().required(),
  },
  password: {
    id: 'password',
    name: 'password',
    type: 'password',
    label: 'Password',
    validationSchema: yup.string().label('Password').required().min(8),
  },
  confirmpwd: {
    id: 'confirmpwd',
    name: 'confirmpwd',
    type: 'password',
    label: 'Confirm password',
    validationSchema: yup
      .string()
      .label('Confirm password')
      .required()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
  },
  username: {
    id: 'username',
    name: 'username',
    type: 'text',
    label: 'Username',
    validationSchema: yup.string().label('Username').required(),
  },
};

export const Register = () => {
  return (
    <LoginRegister
      title="Register"
      emailMethod={{
        fields: emailFormFields,
        onSubmit: (data: Record<keyof typeof emailFormFields, string>) =>
          registerWithEmailInteractor(data.email, data.password, data.username),
      }}
      googleMethod={{ onSubmit: () => registerWithGoogleInteractor() }}
      alternative={{
        message: 'Already have an account?',
        linkLbl: 'Log in',
        linkTo: LOGIN_ROUTE,
      }}
    />
  );
};
