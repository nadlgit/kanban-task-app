import styles from './exit-demo.module.css';

import Link from 'next/link';

import { Button } from 'webui/shared';

export const ExitDemo = () => (
  <Link href="/">
    <Button variant="primary-s" fullWidth={false} className={styles.button}>
      Exit demo
    </Button>
  </Link>
);
