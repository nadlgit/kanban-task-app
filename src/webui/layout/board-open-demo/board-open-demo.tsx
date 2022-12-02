import styles from './board-open-demo.module.css';

import Link from 'next/link';

import { DEMO_ROUTE } from 'webui/routes';
import { Button } from 'webui/shared';

export const BoardOpenDemo = () => (
  <Link href={DEMO_ROUTE}>
    <Button variant="primary-s" fullWidth={false} className={styles.button}>
      Try demo
    </Button>
  </Link>
);
