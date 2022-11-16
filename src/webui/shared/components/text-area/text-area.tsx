import styles from './text-area.module.css';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, TextareaHTMLAttributes } from 'react';

type TextAreaProps = {
  label: string;
  error?: string;
} & Required<
  Pick<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'name'>
> &
  Omit<DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, 'name'>;

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, error, name, id, className, rows, ...otherProps },
  ref
) {
  const htmlId = id ?? name;

  const cssClasses = [styles.base];
  error && cssClasses.push(styles.invalid);
  className && cssClasses.push(className);

  return (
    <p className={cssClasses.join(' ')}>
      <label htmlFor={htmlId} className={styles.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={htmlId}
        name={name}
        className={styles.input}
        rows={rows ?? 4}
        {...otherProps}
      />
      <span role="status" className={styles.errormsg}>
        {error}
      </span>
    </p>
  );
});
