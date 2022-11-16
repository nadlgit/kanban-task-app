import { useEffect, useMemo } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import type { UniqueId } from 'core/entities';
import { generateId } from 'infrastructure/utils';
import {
  boardTextInputRegisterOptions,
  Button,
  TextField,
  TextFieldGroup,
  updateTextInputErrors,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddBoardFormProps = {
  onSubmit: (boardName: string, boardColumns: { id: UniqueId; name: string }[]) => void;
};

export const AddBoardForm = ({ onSubmit }: AddBoardFormProps) => {
  const { register, handleSubmit, formState } = useForm({ shouldUnregister: true });

  const columnItemLabel = 'Column Name';
  const newColumnItemName = () => generateId('newcolumn');
  const newColumnPlaceholder = 'e.g. Todo';

  const initialColumns = useMemo(
    () => [
      {
        ...register(newColumnItemName(), boardTextInputRegisterOptions),
        label: columnItemLabel,
        placeholder: newColumnPlaceholder,
      },
    ],
    [register]
  );

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    setError: setColumnItemError,
  } = useTextFieldGroupInputList(initialColumns);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit((data) => {
      onSubmit(
        data.boardname.trim(),
        columns.map(({ name }) => ({ id: name, name: data[name].trim() }))
      );
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
            label: columnItemLabel,
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
  );
};
