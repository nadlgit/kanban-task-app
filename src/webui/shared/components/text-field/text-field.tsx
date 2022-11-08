import styles from './text-field.module.css';
import IconCross from './icon-cross.svg';

import { forwardRef } from 'react';
import type { DetailedHTMLProps, InputHTMLAttributes } from 'react';

import { Icon } from '../icon';

export type TextFieldProps = {
  label: string;
  hideLabel?: boolean;
  error?: string;
  fullWidth?: boolean;
  onDelete?: () => void;
} & Required<
  Pick<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>
> &
  Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'name'>;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel = false,
    error,
    fullWidth = true,
    onDelete,
    name,
    id,
    type,
    className,
    ...otherProps
  },
  ref
) {
  const htmlId = id ?? name;

  const cssClasses = [styles.base];
  fullWidth && cssClasses.push(styles['full-width']);
  error && cssClasses.push(styles.invalid);
  className && cssClasses.push(className);

  return (
    <p className={cssClasses.join(' ')}>
      <label htmlFor={htmlId} className={hideLabel ? 'visually-hidden' : styles.label}>
        {label}
      </label>
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
            <Icon imgSrc={IconCross.src} imgAccessibleName="Delete item" className={styles.icon} />
          </button>
        )}
        <span role="status" className={styles.errormsg}>
          {error}
        </span>
      </span>
    </p>
  );
});
