import type { FieldValues, UseFormRegister } from 'react-hook-form';

type RegisterOptions = Parameters<UseFormRegister<FieldValues>>[1];

export const boardTextInputRegisterOptions: RegisterOptions = {
  onBlur: (e) => {
    e.target.value = e.target.value.trim();
  },
  required: "Can't be empty",
  pattern: { value: /\S/, message: "Can't be empty" },
};

export const boardTextAreaRegisterOptions: RegisterOptions = {
  onBlur: (e) => {
    e.target.value = e.target.value.trim();
  },
};
