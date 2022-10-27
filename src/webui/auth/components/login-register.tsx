import styles from './login-register.module.css';
import GoogleLogo from './google-logo.svg';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Navigate } from 'webui/routes';
import { Button, TextField } from 'webui/shared';

type LoginRegisterProps = {
  title: string;
  emailMethod: {
    fields: {
      [fieldName: string]: {
        id: string;
        name: string;
        type: string;
        label: string;
        validationSchema: yup.StringSchema;
      };
    };
    onSubmit: (data: Record<string, string>) => Promise<void>;
  };
  googleMethod: { onSubmit: () => Promise<void> };
  alternative: { message: string; linkLbl: string; linkTo: string };
};

export const LoginRegister = ({
  title,
  emailMethod,
  googleMethod,
  alternative,
}: LoginRegisterProps) => {
  const [navigateNow, setNavigateNow] = useState(false);

  const validationSchema = yup
    .object()
    .shape(
      Object.fromEntries(
        Object.entries(emailMethod.fields).map(([key, value]) => [key, value.validationSchema])
      )
    );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(validationSchema) });

  const handleWithEmail: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      await emailMethod.onSubmit(data);
      setNavigateNow(true);
    })(e);
  };

  const handleWithGoogle = async () => {
    await googleMethod.onSubmit();
    setNavigateNow(true);
  };

  return navigateNow ? (
    <Navigate to="/" />
  ) : (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <form onSubmit={handleWithEmail} noValidate>
        {Object.entries(emailMethod.fields).map(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { name, validationSchema, ...textFieldProps } = value;
          return (
            <TextField
              key={key}
              {...register(name, {
                onBlur: (e) => {
                  e.target.value = e.target.value.trim();
                },
              })}
              {...textFieldProps}
              error={errors[name]?.message as string}
            />
          );
        })}
        <Button variant="primary-s" type="submit">
          Continue with email
        </Button>
      </form>

      <div className={styles.divider}></div>

      <Button variant="secondary" onClick={handleWithGoogle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GoogleLogo.src} alt="" />
        <span>Continue with Google</span>
      </Button>

      <p className={styles.alternative}>
        {alternative.message} <Link href={alternative.linkTo}>{alternative.linkLbl}</Link>
      </p>
    </div>
  );
};
