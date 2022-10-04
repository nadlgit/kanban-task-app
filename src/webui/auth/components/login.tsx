import Link from 'next/link';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

import { loginWithEmailInteractor, loginWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate, REGISTER_ROUTE } from 'webui/routes';

export const Login = () => {
  const [navigateNow, setNavigateNow] = useState(false);

  const handleWithEmail: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const data = new FormData(e.target as HTMLFormElement);
    try {
      await loginWithEmailInteractor(
        authRepository,
        data.get('email') as string,
        data.get('password') as string
      );
      alert('Successfull!');
      setNavigateNow(true);
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  const handleWithGoogle = async () => {
    try {
      await loginWithGoogleInteractor(authRepository);
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
      {testNav}
      <form style={{ border: '1px solid black' }} onSubmit={handleWithEmail}>
        <p>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
        </p>
        <p>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" />
        </p>
        <button type="submit">Log in with email</button>
      </form>
      <p>- or -</p>
      <button onClick={handleWithGoogle}>Log in with Google</button>
      <p>- or -</p>
      <p>
        Don&apos;t have an account? <Link href={REGISTER_ROUTE}>Register</Link>
      </p>
    </div>
  );
};

const testNav = (
  <>
    <ul>
      <li>
        <Link href="/">Home</Link>
      </li>
    </ul>
    <hr />
  </>
);
