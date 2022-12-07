import styles from './button.module.css';

export type ButtonStyleProps = {
  variant: 'primary-l' | 'primary-s' | 'secondary' | 'destructive';
  fullWidth?: boolean;
  className?: string;
};

export function getButtonCssClasses({ variant, fullWidth = true, className }: ButtonStyleProps) {
  const cssClasses = [styles.button];
  styles[variant] && cssClasses.push(styles[variant]);
  fullWidth && cssClasses.push(styles['full-width']);
  className && cssClasses.push(className);
  return cssClasses.join(' ');
}
