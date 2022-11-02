import styles from './add-board.module.css';

import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  ModalHeading,
  TextField,
  TextFieldGroup,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddBoardProps = { onSubmit: () => void };

export const AddBoard = ({ onSubmit }: AddBoardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {
    list: columns,
    addItem: addColumnItem,
    deleteItem: deleteColumnItem,
    newItemName: newColumnItemName,
  } = useTextFieldGroupInputList([
    {
      ...register(`addBoardColumnFirst`, {
        onBlur: (e) => {
          e.target.value = e.target.value.trim();
        },
      }),
      defaultValue: 'valFirst',
    },
  ]);

  const handleTBD: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(async (data) => {
      onSubmit();
    })(e);
  };

  return (
    <>
      <ModalHeading>Add New Board</ModalHeading>
      <form onSubmit={handleTBD} noValidate>
        <TextField
          {...register('boardname', {
            onBlur: (e) => {
              e.target.value = e.target.value.trim();
            },
          })}
          id="boardname"
          type="text"
          label="Board Name"
          error={errors['boardname']?.message as string}
        />
        <TextFieldGroup
          groupLabel="Board Columns"
          inputList={columns}
          addLabel="+ Add New Column"
          onAdd={() => {
            addColumnItem({
              ...register(newColumnItemName('addBoardColumn'), {
                onBlur: (e) => {
                  e.target.value = e.target.value.trim();
                },
              }),
            });
          }}
          onDelete={(index: number) => {
            deleteColumnItem(index);
          }}
        />
        <Button variant="primary-s" type="submit">
          Create New Board
        </Button>
      </form>
    </>
  );
};
