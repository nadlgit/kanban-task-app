import styles from './modal-heading.module.css';

import { DialogHeading } from 'ariakit';
import type { PropsWithChildren } from 'react';

export const ModalHeading = ({ children }: PropsWithChildren) => (
  <DialogHeading className={styles.heading}>{children}</DialogHeading>
);
