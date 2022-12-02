import styles from './board-exit.module.css';

import Link from 'next/link';

import { Logout } from 'webui/auth';
import { useIsDemo } from 'webui/board';
import { Button } from 'webui/shared';

export const BoardExit = () => {
  const isDemo = useIsDemo();
  return isDemo ? (
    <Link href="/">
      <Button variant="primary-s" fullWidth={false} className={styles.button}>
        Exit demo
      </Button>
    </Link>
  ) : (
    <Logout />
  );
};
