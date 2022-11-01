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
  const cssClasses = [styles.button];
  styles[variant] && cssClasses.push(styles[variant]);
  fullWidth && cssClasses.push(styles['full-width']);
  className && cssClasses.push(className);

  return (
    <button type={type ?? 'button'} className={cssClasses.join(' ')} {...otherprops}>
      {children}
    </button>
  );
};
