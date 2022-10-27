import styles from './logout.module.css';

import { logout } from 'core/usecases';
import { Button } from 'webui/shared';

export const Logout = () => {
  const handleClick = async () => {
    await logout();
  };

  return (
    <Button variant="primary-s" fullWidth={false} className={styles.button} onClick={handleClick}>
      Log out
    </Button>
  );
};
