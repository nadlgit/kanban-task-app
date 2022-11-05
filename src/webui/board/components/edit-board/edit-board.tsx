import { useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import type { BoardEntity } from 'core/entities';
// import { TBD } from 'core/usecases';
import { generateId } from 'infrastructure/utils';
import {
  Button,
  ModalHeading,
  TextField,
  TextFieldGroup,
  useTextFieldGroupInputList,
} from 'webui/shared';

type EditBoardProps = { board: BoardEntity; close: () => void };

export const EditBoard = ({ board, close }: EditBoardProps) => {
  const { register, handleSubmit, formState } = useForm({ shouldUnregister: true });

  const registerOptions: Parameters<typeof register>[1] = {
    onBlur: (e) => {
      e.target.value = e.target.value.trim();
    },
    required: "Can't be empty",
    pattern: { value: /\S/, message: "Can't be empty" },
  };

  const newColumnItemName = () => generateId('newcolumn');
  const newColumnPlaceholder = 'e.g. Todo';

  const initializeColumns = () =>
    board.columns.map((column) => ({
      ...register(column.id, registerOptions),
      placeholder: newColumnPlaceholder,
      defaultValue: column.name,
    }));

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    setError: setColumnItemError,
  } = useTextFieldGroupInputList(initializeColumns);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      console.log('editboard data', data);
      // TODO
      close();
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
      <ModalHeading>Edit Board</ModalHeading>
      <form onSubmit={handleFormSubmit} noValidate>
        <TextField
          {...register('boardname', registerOptions)}
          label="Board Name"
          placeholder="e.g. Web Design"
          defaultValue={board.name}
          error={formState.errors['boardname']?.message as string | undefined}
        />
        <TextFieldGroup
          groupLabel="Board Columns"
          inputList={columns}
          addLabel="+ Add New Column"
          onAdd={() => {
            addColumnItem({
              ...register(newColumnItemName(), registerOptions),
              placeholder: newColumnPlaceholder,
            });
          }}
          onDelete={(inputName: string) => {
            deleteColumnItem(inputName);
          }}
        />
        <Button variant="primary-s" type="submit">
          Save Changes
        </Button>
      </form>
    </>
  );
};
