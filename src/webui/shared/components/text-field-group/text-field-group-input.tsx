import { forwardRef } from 'react';
import type { ComponentProps, PropsWithoutRef } from 'react';

import { TextField } from '../text-field';

type TextFieldProps = ComponentProps<typeof TextField>;
type TextFieldGroupInputProps = Required<Pick<TextFieldProps, 'onDelete'>> &
  Omit<PropsWithoutRef<TextFieldProps>, 'onDelete' | 'hideLabel'>;

export const TextFieldGroupInput = forwardRef<HTMLInputElement, TextFieldGroupInputProps>(
  function TextFieldGroupInput(props, ref) {
    return <TextField ref={ref} hideLabel={true} {...props} />;
  }
);
