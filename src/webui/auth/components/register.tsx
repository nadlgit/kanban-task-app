import Link from 'next/link';
import { useState } from 'react';
import type { FormEventHandler } from 'react';

import { registerWithEmailInteractor, registerWithGoogleInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate, LOGIN_ROUTE } from 'webui/routes';

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
        <p>
          <label htmlFor="confirmpwd">Confirm password</label>
          <input id="confirmpwd" name="confirmpwd" type="password" />
        </p>
        <p>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" type="text" />
        </p>
        <button type="submit">Register with email</button>
      </form>
      <p>- or -</p>
      <button onClick={handleWithGoogle}>Register with Google</button>
      <p>- or -</p>
      <p>
        Already have an account? <Link href={LOGIN_ROUTE}>Log in</Link>
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
