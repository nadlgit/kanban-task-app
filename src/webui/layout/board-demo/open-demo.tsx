import styles from './open-demo.module.css';

import { DEMO_ROUTE } from 'webui/routes';
import { LinkButton } from 'webui/shared';

export const OpenDemo = () => (
  <LinkButton url={DEMO_ROUTE} variant="primary-s" fullWidth={false} className={styles.button}>
    Try demo
  </LinkButton>
);
