import styles from './text-field-group.module.css';

import type { PropsWithoutRef } from 'react';

import { TextFieldGroupInput } from './text-field-group-input';
import type { TextFieldGroupInputProps } from './text-field-group-input';
import { Button } from '../button';

export type TextFieldGroupInputDef = Omit<PropsWithoutRef<TextFieldGroupInputProps>, 'onDelete'>;

type TextFieldGroupProps = {
  groupLabel: string;
  inputList: TextFieldGroupInputDef[];
  addLabel: string;
  onAdd: () => void;
  onDelete: (index: number) => void;
};

export const TextFieldGroup = ({
  groupLabel,
  inputList,
  addLabel,
  onAdd,
  onDelete,
}: TextFieldGroupProps) => {
  return (
    <>
      <p className={styles.label}>{groupLabel}</p>
      {inputList.map((input, index) => (
        <TextFieldGroupInput key={input.name} onDelete={() => onDelete(index)} {...input} />
      ))}
      <Button variant="secondary" onClick={onAdd}>
        {addLabel}
      </Button>
    </>
  );
};
