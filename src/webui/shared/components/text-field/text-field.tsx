import styles from './text-field.module.css';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

export type TextFieldProps = {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  onDelete?: () => void;
} & Required<
  Pick<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>
> &
  Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, fullWidth = true, onDelete, name, id, type, className, ...otherProps },
  ref
) {
  const htmlId = id ?? name;

  const cssClasses = [styles.base];
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
      <span className={styles.inputcontainer}>
        <input
          ref={ref}
          id={htmlId}
          name={name}
          type={type ?? 'text'}
          className={styles.input}
          {...otherProps}
        />
        {onDelete && (
          <button type="button" onClick={onDelete} className={styles.delete}>
            <SVGIconCross />
          </button>
        )}
        <span role="status" className={styles.errormsg}>
          {error}
        </span>
      </span>
    </p>
  );
});

const SVGIconCross = () => (
  <svg role="img" width="15" height="15" xmlns="http://www.w3.org/2000/svg">
    <title>Delete item</title>
    <g fill="currentColor" fillRule="evenodd">
      <path d="m12.728 0 2.122 2.122L2.122 14.85 0 12.728z" />
      <path d="M0 2.122 2.122 0 14.85 12.728l-2.122 2.122z" />
    </g>
  </svg>
);
