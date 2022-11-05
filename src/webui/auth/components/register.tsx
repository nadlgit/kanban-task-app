import * as yup from 'yup';

import { LoginRegister } from './login-register';
import { registerWithEmail, registerWithGoogle } from 'core/usecases';
import { LOGIN_ROUTE } from 'webui/routes';

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
    type: 'text',
    label: 'Password',
    validationSchema: yup
      .string()
      .label('Password')
      .trim()
      .required()
      .min(8)
      .matches(/^\S+$/, 'Password must not contain whitespaces'),
  },
  confirmpwd: {
    id: 'confirmpwd',
    name: 'confirmpwd',
    type: 'text',
    label: 'Confirm password',
    validationSchema: yup
      .string()
      .label('Confirm password')
      .trim()
      .required()
      .oneOf([yup.ref('password'), null], 'Passwords must match'),
  },
  username: {
    id: 'username',
    name: 'username',
    type: 'text',
    label: 'Username',
    validationSchema: yup.string().label('Username').trim().required(),
  },
};

export const Register = () => {
  return (
    <LoginRegister
      title="Register"
      emailMethod={{
        fields: emailFormFields,
        onSubmit: (data: Record<keyof typeof emailFormFields, string>) =>
          registerWithEmail(data.email, data.password, data.username),
      }}
      googleMethod={{ onSubmit: () => registerWithGoogle() }}
      alternative={{
        message: 'Already have an account?',
        linkLbl: 'Log in',
        linkTo: LOGIN_ROUTE,
      }}
    />
  );
};
