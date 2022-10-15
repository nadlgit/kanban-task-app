import styles from './text-field.module.css';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

type TextFieldProps = {
  label: string;
  error?: string;
  fullWidth?: boolean;
} & Required<
  Pick<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>
> &
  Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, fullWidth = true, name, id, type, className, ...otherprops }, ref) => {
    const htmlId = id ?? name;
    const cssClass = `${fullWidth ? styles['full-width'] : ''} ${error ? styles.invalid : ''} ${
      className ?? ''
    }`;
    const otherInputProps = ref ? { ref, ...otherprops } : { ...otherprops };
    return (
      <p className={cssClass}>
        <label htmlFor={htmlId} className={styles.label}>
          {label}
        </label>
        <input
          id={htmlId}
          name={name}
          type={type ?? 'text'}
          className={styles.input}
          {...otherInputProps}
        />
        <span role="status" className={styles.errormsg}>
          {error}
        </span>
      </p>
    );
  }
);

TextField.displayName = 'TextField';
