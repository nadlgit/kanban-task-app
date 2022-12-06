import { useEffect, useMemo, useState } from 'react';
import type { ComponentProps, FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import { DeleteColumnConfirm } from './delete-column-confirm';
import type { BoardEntity, UniqueId } from 'core/entities';
import { generateId } from 'infrastructure/utils';
import {
  boardTextInputRegisterOptions,
  Button,
  doNothing,
  TextField,
  TextFieldGroup,
  updateTextInputErrors,
  useModalToggle,
  useTextFieldGroupInputList,
} from 'webui/shared';

type EditBoardFormProps = {
  board: BoardEntity;
  onSubmit: (boardName: string, boardColumns: { id: UniqueId; name: string }[]) => void;
};

export const EditBoardForm = ({ board, onSubmit }: EditBoardFormProps) => {
  const { register, handleSubmit, formState, watch, setFocus } = useForm({
    shouldUnregister: true,
  });

  const columnItemLabel = 'Column Name';
  const newColumnItemName = () => generateId('newcolumn');
  const newColumnPlaceholder = 'e.g. Todo';

  const initialColumns = useMemo(
    () =>
      board.columns.map(({ id, name }) => ({
        ...register(id, boardTextInputRegisterOptions),
        label: columnItemLabel,
        placeholder: newColumnPlaceholder,
        defaultValue: name,
      })),
    [board.columns, register]
  );

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    setError: setColumnItemError,
  } = useTextFieldGroupInputList(initialColumns);

  const {
    isModalOpen: isDeleteColumnConfirmOpen,
    closeModal: closeDeleteColumnConfirm,
    openModal: openDeleteColumnConfirm,
  } = useModalToggle();
  const [deleteColumnConfirmProps, setDeleteColumnConfirmProps] = useState<
    Omit<ComponentProps<typeof DeleteColumnConfirm>, 'isOpen' | 'close'>
  >({
    columnName: '',
    onDelete: doNothing,
  });

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
    setFocus('boardname');
  }, [setFocus]);

  useEffect(() => {
    updateTextInputErrors(
      formState,
      columns.map(({ name, error }) => ({ name, error })),
      setColumnItemError
    );
  }, [formState, columns, setColumnItemError]);

  return (
    <>
      <form onSubmit={handleFormSubmit} noValidate>
        <TextField
          {...register('boardname', boardTextInputRegisterOptions)}
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
              ...register(newColumnItemName(), boardTextInputRegisterOptions),
              label: columnItemLabel,
              placeholder: newColumnPlaceholder,
            });
          }}
          onDelete={(inputName: string) => {
            const hasTasks =
              (board.columns.find(({ id }) => id === inputName)?.tasks?.length ?? 0) > 0;
            const columnName = watch(inputName) as string;
            const onDelete = () => {
              deleteColumnItem(inputName);
            };
            if (hasTasks) {
              setDeleteColumnConfirmProps({
                columnName,
                onDelete,
              });
              openDeleteColumnConfirm();
            } else {
              onDelete();
            }
          }}
        />
        <Button variant="primary-s" type="submit">
          Save Changes
        </Button>
      </form>
      <DeleteColumnConfirm
        isOpen={isDeleteColumnConfirmOpen}
        close={closeDeleteColumnConfirm}
        {...deleteColumnConfirmProps}
      />
    </>
  );
};
