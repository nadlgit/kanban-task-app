import { useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import type { UniqueId } from 'core/entities';
import { addBoard } from 'core/usecases';
import { generateId } from 'infrastructure/utils';
import {
  Button,
  ModalHeading,
  TextField,
  TextFieldGroup,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddBoardProps = {
  close: () => void;
  onAdd?: (newBoardId: UniqueId) => void;
};

export const AddBoard = ({ close, onAdd }: AddBoardProps) => {
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

  const initializeColumns = () => [
    { ...register(newColumnItemName(), registerOptions), placeholder: newColumnPlaceholder },
  ];

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
      const board = {
        name: data.boardname,
        columns: columns.map(({ name }) => ({ name: data[name] })),
      };
      const result = await addBoard(board);
      if (result.ok && onAdd) {
        onAdd(result.boardId);
      }
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
      <ModalHeading>Add New Board</ModalHeading>
      <form onSubmit={handleFormSubmit} noValidate>
        <TextField
          {...register('boardname', registerOptions)}
          label="Board Name"
          placeholder="e.g. Web Design"
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
          Create New Board
        </Button>
      </form>
    </>
  );
};
