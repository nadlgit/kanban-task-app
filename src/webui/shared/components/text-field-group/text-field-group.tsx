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
  onDelete: (inputName: string) => void;
};

export const TextFieldGroup = ({
  groupLabel,
  inputList,
  addLabel,
  onAdd,
  onDelete,
}: TextFieldGroupProps) => {
  return (
    <fieldset className={styles.container}>
      <legend className={styles.label}>{groupLabel}</legend>
      {inputList.map((input) => (
        <TextFieldGroupInput key={input.name} onDelete={() => onDelete(input.name)} {...input} />
      ))}
      <Button variant="secondary" onClick={onAdd} className={styles.button}>
        {addLabel}
      </Button>
    </fieldset>
  );
};
