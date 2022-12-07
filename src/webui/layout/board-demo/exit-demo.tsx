import styles from './exit-demo.module.css';

import { LinkButton } from 'webui/shared';

export const ExitDemo = () => (
  <LinkButton url="/" variant="primary-s" fullWidth={false} className={styles.button}>
    Exit demo
  </LinkButton>
);
