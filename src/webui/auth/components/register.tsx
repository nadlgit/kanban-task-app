import { useState } from 'react';
import Link from 'next/link';

import { registerWithEmailInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate, LOGIN_ROUTE } from 'webui/routes';

export const Register = () => {
  const [navigateNow, setNavigateNow] = useState(false);

  const handleClick = () => {
    registerWithEmailInteractor(authRepository, 'email', 'password', 'username');
    setNavigateNow(true);
  };

  return navigateNow ? (
    <Navigate to="/" />
  ) : (
    <div>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
      </ul>
      <button onClick={handleClick}>Register</button>
      <p>
        <Link href={LOGIN_ROUTE}>Log in</Link>
      </p>
    </div>
  );
};
