import { useState } from 'react';
import Link from 'next/link';

import { loginWithEmailInteractor } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';
import { Navigate, REGISTER_ROUTE } from 'webui/routes';

export const Login = () => {
  const [navigateNow, setNavigateNow] = useState(false);

  const handleClick = () => {
    loginWithEmailInteractor(authRepository, 'email', 'password');
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
      <button onClick={handleClick}>Log in</button>
      <p>
        <Link href={REGISTER_ROUTE}>Register</Link>
      </p>
    </div>
  );
};
