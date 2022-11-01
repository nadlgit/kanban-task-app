import { forwardRef } from 'react';
import type { PropsWithoutRef } from 'react';

import { TextField } from '../text-field';
import type { TextFieldProps } from '../text-field';

type TextFieldGroupItemProps = Required<Pick<TextFieldProps, 'onDelete'>> &
  Omit<PropsWithoutRef<TextFieldProps>, 'onDelete' | 'label'>;

export const TextFieldGroupItem = forwardRef<HTMLInputElement, TextFieldGroupItemProps>(
  function TextFieldGroupItem(props, ref) {
    return <TextField ref={ref} {...props} />;
  }
);
