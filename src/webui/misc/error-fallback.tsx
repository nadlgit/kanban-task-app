import styles from './error-fallback.module.css';

import type { FallbackProps } from 'react-error-boundary';

export const ErrorFallback = ({ error }: FallbackProps) => (
  <div role="alert" className={styles.component}>
    <p>Apologies, something went wrong.</p>
    <code>{error?.message}</code>
  </div>
);
