import styles from './login-register.module.css';
import GoogleLogo from './google-logo.svg';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import { Navigate } from 'webui/routes';
import { Button, TextField } from 'webui/shared';

type LoginRegisterProps = {
  title: string;
  emailMethod: {
    fields: { fieldName: string; componentProps: Parameters<typeof TextField>[0] }[];
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
  const { register, handleSubmit } = useForm();

  const handleWithEmail: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      try {
        await emailMethod.onSubmit(data);
        alert('Successfull!');
        setNavigateNow(true);
      } catch (e) {
        alert(`Error: ${e}`);
      }
    })(e);
  };

  const handleWithGoogle = async () => {
    try {
      await googleMethod.onSubmit();
      alert('Successfull!');
      setNavigateNow(true);
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  return navigateNow ? (
    <Navigate to="/" />
  ) : (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      <form onSubmit={handleWithEmail}>
        {emailMethod.fields.map((item) => (
          <TextField
            key={item.fieldName}
            {...item.componentProps}
            {...register(item.componentProps.name)}
          />
        ))}
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
