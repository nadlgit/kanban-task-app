import styles from './add-board.module.css';

import { useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  ModalHeading,
  newItemName,
  TextField,
  TextFieldGroup,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddBoardProps = { onSubmit: () => void };

export const AddBoard = ({ onSubmit }: AddBoardProps) => {
  const { register, handleSubmit, formState } = useForm();

  const registerOptions: Parameters<typeof register>[1] = {
    onBlur: (e) => {
      e.target.value = e.target.value.trim();
    },
    required: "Can't be empty",
    pattern: { value: /\S/, message: "Can't be empty" },
  };

  const newColumnItemName = () => newItemName('newcolumn');

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    setError: setColumnItemError,
  } = useTextFieldGroupInputList([{ ...register(newColumnItemName(), registerOptions) }]);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      onSubmit();
    })(e);
  };

  useEffect(() => {
    const columnErrors = columns.map(({ name, error }) => ({ name, error }));
    const formColumnErrors = Object.entries(formState.errors).map(([key, value]) => ({
      name: key,
      error: value?.message as string | undefined,
    }));
    columnErrors.forEach(({ name, error }) => {
      const formError = formColumnErrors.find((form) => form.name === name)?.error;
      if (formError !== error) {
        setColumnItemError(name, formError);
      }
    });
  }, [formState, columns, setColumnItemError]);

  return (
    <>
      <ModalHeading>Add New Board</ModalHeading>
      <form onSubmit={handleFormSubmit} noValidate>
        <TextField
          {...register('boardname', registerOptions)}
          label="Board Name"
          error={formState.errors['boardname']?.message as string | undefined}
        />
        <TextFieldGroup
          groupLabel="Board Columns"
          inputList={columns}
          addLabel="+ Add New Column"
          onAdd={() => {
            addColumnItem({ ...register(newColumnItemName(), registerOptions) });
          }}
          onDelete={(inputName: string) => {
            deleteColumnItem(inputName);
          }}
        />
        <Button variant="primary-s" type="submit">
          Create New Board
        </Button>
      </form>
    </>
  );
};
