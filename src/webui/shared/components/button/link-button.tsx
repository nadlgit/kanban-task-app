import Link from 'next/link';
import type { DetailedHTMLProps, AnchorHTMLAttributes } from 'react';

import { getButtonCssClasses } from './button-style';
import type { ButtonStyleProps } from './button-style';

type LinkButtonProps = ButtonStyleProps & {
  url: string;
} & DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const LinkButton = ({
  variant,
  fullWidth,
  className,
  url,
  children,
  ...otherprops
}: LinkButtonProps) => (
  <Link href={url}>
    <a className={getButtonCssClasses({ variant, fullWidth, className })} {...otherprops}>
      {children}
    </a>
  </Link>
);
