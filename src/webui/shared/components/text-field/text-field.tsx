import styles from './text-field.module.css';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

export type TextFieldProps = {
  label?: string;
  error?: string;
  fullWidth?: boolean;
} & Required<
  Pick<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>
> &
  Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, fullWidth = true, name, id, type, className, ...otherProps },
  ref
) {
  const htmlId = id ?? name;

  const cssClasses = [] as string[];
  fullWidth && cssClasses.push(styles['full-width']);
  error && cssClasses.push(styles.invalid);
  className && cssClasses.push(className);

  return (
    <p className={cssClasses.join(' ')}>
      {label && (
        <label htmlFor={htmlId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={htmlId}
        name={name}
        type={type ?? 'text'}
        className={styles.input}
        {...otherProps}
      />
      <span role="status" className={styles.errormsg}>
        {error}
      </span>
    </p>
  );
});
