import styles from './checkbox.module.css';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import { generateId } from 'infrastructure/utils';

type CheckboxProps = {
  label: string;
} & Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'type'>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, name, id, ...otherProps },
  ref
) {
  const htmlId = id ?? name ?? generateId('checkbox');
  return (
    <>
      <input
        type="checkbox"
        ref={ref}
        id={htmlId}
        name={name}
        className={`visually-hidden ${styles.input}`}
        {...otherProps}
      />
      <label htmlFor={htmlId} className={styles.label}>
        {label}
      </label>
    </>
  );
});
