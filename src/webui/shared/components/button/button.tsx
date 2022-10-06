import styles from './button.module.css';

import type { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

type ButtonProps = {
  variant: 'primary-l' | 'primary-s' | 'secondary' | 'destructive';
  fullWidth?: boolean;
} & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({
  variant,
  fullWidth = true,
  type,
  className,
  children,
  ...otherprops
}: ButtonProps) => {
  const cssClass = `${styles.button} ${styles[variant] ?? ''} ${
    fullWidth ? styles['full-width'] : ''
  } ${className ?? ''}`;
  return (
    <button type={type ?? 'button'} className={cssClass} {...otherprops}>
      {children}
    </button>
  );
};
