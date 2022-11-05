import { useEffect } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import type { UniqueId } from 'core/entities';
import { addBoard } from 'core/usecases';
import { generateId } from 'infrastructure/utils';
import {
  boardTextInputRegisterOptions,
  Button,
  ModalHeading,
  TextField,
  TextFieldGroup,
  updateTextInputErrors,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddBoardProps = {
  close: () => void;
  onAdd?: (newBoardId: UniqueId) => void;
};

export const AddBoard = ({ close, onAdd }: AddBoardProps) => {
  const { register, handleSubmit, formState } = useForm({ shouldUnregister: true });

  const newColumnItemName = () => generateId('newcolumn');
  const newColumnPlaceholder = 'e.g. Todo';

  const initializeColumns = () => [
    {
      ...register(newColumnItemName(), boardTextInputRegisterOptions),
      placeholder: newColumnPlaceholder,
    },
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
    updateTextInputErrors(
      formState,
      columns.map(({ name, error }) => ({ name, error })),
      setColumnItemError
    );
  }, [formState, columns, setColumnItemError]);

  return (
    <>
      <ModalHeading>Add New Board</ModalHeading>
      <form onSubmit={handleFormSubmit} noValidate>
        <TextField
          {...register('boardname', boardTextInputRegisterOptions)}
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
              ...register(newColumnItemName(), boardTextInputRegisterOptions),
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
