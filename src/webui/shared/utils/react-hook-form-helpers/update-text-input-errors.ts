import type { FieldValues, FormState } from 'react-hook-form';

export const updateTextInputErrors = (
  formState: FormState<FieldValues>,
  inputErrors: { name: string; error: string | undefined }[],
  setInputError: (itemName: string, errorMsg: string | undefined) => void
) => {
  const formInputErrors = Object.entries(formState.errors).map(([key, value]) => ({
    name: key,
    error: value?.message as string | undefined,
  }));
  inputErrors.forEach(({ name, error }) => {
    const formError = formInputErrors.find((form) => form.name === name)?.error;
    if (formError !== error) {
      setInputError(name, formError);
    }
  });
};
