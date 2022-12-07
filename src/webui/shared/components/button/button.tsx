import type { DetailedHTMLProps, ButtonHTMLAttributes } from 'react';

import { getButtonCssClasses } from './button-style';
import type { ButtonStyleProps } from './button-style';

type ButtonProps = ButtonStyleProps &
  DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const Button = ({
  variant,
  fullWidth,
  type,
  className,
  children,
  ...otherprops
}: ButtonProps) => (
  <button
    type={type ?? 'button'}
    className={getButtonCssClasses({ variant, fullWidth, className })}
    {...otherprops}
  >
    {children}
  </button>
);
