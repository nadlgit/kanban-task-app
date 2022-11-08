import { useEffect, useState } from 'react';
import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import { DeleteColumnConfirm } from './delete-column-confirm';
import type { DeleteColumnConfirmProps } from './delete-column-confirm';
import type { BoardEntity, UniqueId } from 'core/entities';
import { editBoard } from 'core/usecases';
import { generateId } from 'infrastructure/utils';
import {
  boardTextInputRegisterOptions,
  Button,
  Modal,
  ModalHeading,
  TextField,
  TextFieldGroup,
  updateTextInputErrors,
  useModalToggle,
  useTextFieldGroupInputList,
} from 'webui/shared';

type EditBoardProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const EditBoard = ({ isOpen, close, board }: EditBoardProps) => {
  const { register, handleSubmit, formState, watch } = useForm({ shouldUnregister: true });

  const columnItemLabel = 'Column Name';
  const newColumnItemName = () => generateId('newcolumn');
  const newColumnPlaceholder = 'e.g. Todo';

  const initializeColumns = () =>
    board.columns.map((column) => ({
      ...register(column.id, boardTextInputRegisterOptions),
      label: columnItemLabel,
      placeholder: newColumnPlaceholder,
      defaultValue: column.name,
    }));

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    setError: setColumnItemError,
  } = useTextFieldGroupInputList(initializeColumns);

  const {
    isModalOpen: isDeleteColumnConfirmOpen,
    closeModal: closeDeleteColumnConfirm,
    openModal: openDeleteColumnConfirm,
  } = useModalToggle();
  const [deleteColumnConfirmProps, setDeleteColumnConfirmProps] = useState<
    Omit<DeleteColumnConfirmProps, 'isOpen' | 'close'>
  >({
    columnName: '',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onDelete: () => {},
  });

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      const boardUpdate: Parameters<typeof editBoard>[0] = {
        id: board.id,
        name: data.boardname === board.name ? undefined : (data.boardname as string),
        columnsAdded: [],
        columnsDeleted: [],
        columnsUpdated: [],
      };
      const listBefore = board.columns;
      const listAfter = columns.map(({ name }) => ({
        id: name as UniqueId,
        name: data[name] as string,
      }));
      boardUpdate.columnsAdded = listAfter
        .filter(({ id: afterId }) => !listBefore.find(({ id: idBefore }) => idBefore === afterId))
        .map(({ name }) => ({ name }));
      boardUpdate.columnsDeleted = listBefore
        .filter(({ id: idBefore }) => !listAfter.find(({ id: idAfter }) => idBefore === idAfter))
        .map(({ id }) => ({ id }));
      boardUpdate.columnsUpdated = listAfter.filter(({ id: idAfter, name: nameAfter }) =>
        listBefore.find(
          ({ id: idBefore, name: nameBefore }) => idBefore === idAfter && nameBefore !== nameAfter
        )
      );

      await editBoard(boardUpdate);
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
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Edit Board</ModalHeading>
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
    </Modal>
  );
};
