import { logout } from 'core/usecases';
import { authRepository } from 'infrastructure/auth';

import Link from 'next/link';
import { LOGIN_ROUTE, REGISTER_ROUTE } from 'webui/routes';

export const Logout = () => {
  const handleClick = async () => {
    try {
      await logout(authRepository);
      alert('Successfull!');
    } catch (e) {
      alert(`Error: ${e}`);
    }
  };

  return (
    <div>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href={LOGIN_ROUTE}>Log in</Link>
        </li>
        <li>
          <Link href={REGISTER_ROUTE}>Register</Link>
        </li>
      </ul>
      <button onClick={handleClick}>Log out</button>
    </div>
  );
};
