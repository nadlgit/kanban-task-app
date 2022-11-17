import styles from './modal-heading.module.css';

import { DialogHeading } from 'ariakit';
import type { PropsWithChildren, ReactNode } from 'react';

type ModalHeadingProps = PropsWithChildren<{
  variant?: 'destructive';
  menu?: ReactNode;
}>;

export const ModalHeading = ({ variant, menu, children }: ModalHeadingProps) => {
  const cssClasses = [styles.heading];
  variant && cssClasses.push(styles[variant]);
  return (
    <DialogHeading className={cssClasses.join(' ')}>
      <span>{children}</span>
      {menu && <span>{menu}</span>}
    </DialogHeading>
  );
};
