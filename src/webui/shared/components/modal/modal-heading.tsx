import styles from './modal-heading.module.css';

import { DialogHeading } from 'ariakit';
import type { PropsWithChildren } from 'react';

type ModalHeadingProps = PropsWithChildren<{ variant?: 'destructive' }>;

export const ModalHeading = ({ variant, children }: ModalHeadingProps) => {
  const cssClasses = [styles.heading];
  variant && cssClasses.push(styles[variant]);
  return <DialogHeading className={cssClasses.join(' ')}>{children}</DialogHeading>;
};
