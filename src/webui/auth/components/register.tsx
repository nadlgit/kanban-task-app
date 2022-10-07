import GoogleLogo from './google-logo.svg';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

import { registerWithEmailInteractor, registerWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate, LOGIN_ROUTE } from 'webui/routes';
import { Button, TextField } from 'webui/shared';

export const Register = () => {
  const [navigateNow, setNavigateNow] = useState(false);

  const handleWithEmail: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await registerWithEmailInteractor(
        authRepository,
        data.get('email') as string,
        data.get('password') as string,
        data.get('username') as string
      );
      alert('Successfull!');
      setNavigateNow(true);
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  const handleWithGoogle = async () => {
    try {
      await registerWithGoogleInteractor(authRepository);
      alert('Successfull!');
      setNavigateNow(true);
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  return navigateNow ? (
    <Navigate to="/" />
  ) : (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleWithEmail}>
        <TextField id="email" name="email" type="email" label="Email" />
        <TextField id="password" name="password" type="password" label="Password" />
        <TextField id="confirmpwd" name="confirmpwd" type="password" label="Confirm password" />
        <TextField id="username" name="username" type="text" label="Username" />
        <Button variant="primary-s" type="submit">
          Continue with email
        </Button>
      </form>
      <p>- or -</p>
      <Button variant="secondary" onClick={handleWithGoogle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={GoogleLogo.src} alt="" />
        <span>Continue with Google</span>
      </Button>
      <p>- or -</p>
      <p>
        Already have an account? <Link href={LOGIN_ROUTE}>Log in</Link>
      </p>
    </div>
  );
};
