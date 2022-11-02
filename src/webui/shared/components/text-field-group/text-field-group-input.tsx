import { forwardRef } from 'react';
import type { PropsWithoutRef } from 'react';

import { TextField } from '../text-field';
import type { TextFieldProps } from '../text-field';

export type TextFieldGroupInputProps = Required<Pick<TextFieldProps, 'onDelete'>> &
  Omit<PropsWithoutRef<TextFieldProps>, 'onDelete' | 'label'>;

export const TextFieldGroupInput = forwardRef<HTMLInputElement, TextFieldGroupInputProps>(
  function TextFieldGroupInput(props, ref) {
    return <TextField ref={ref} {...props} />;
  }
);
