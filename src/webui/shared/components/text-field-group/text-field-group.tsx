import styles from './text-field-group.module.css';

import type { PropsWithChildren } from 'react';

import { Button } from '../button';

type TextFieldGroupProps = PropsWithChildren<{
  groupLabel: string;
  addLabel: string;
  onAdd: () => void;
}>;

export const TextFieldGroup = ({ groupLabel, addLabel, onAdd, children }: TextFieldGroupProps) => {
  return (
    <>
      <p className={styles.label}>{groupLabel}</p>
      {children}
      <Button variant="secondary" onClick={onAdd}>
        {addLabel}
      </Button>
    </>
  );
};
