import styles from './add-board.module.css';

import type { FormEventHandler } from 'react';
import { useForm } from 'react-hook-form';

import { Button, ModalHeading, TextField, TextFieldGroup, TextFieldGroupItem } from 'webui/shared';

type AddBoardProps = { onSubmit: () => void };

export const AddBoard = ({ onSubmit }: AddBoardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
          addLabel="+ Add New Column"
          onAdd={() => console.log('onAdd')}
        >
          <TextFieldGroupItem
            {...register('addBoardColumn1', {
              onBlur: (e) => {
                e.target.value = e.target.value.trim();
              },
            })}
            defaultValue="val1"
            onDelete={() => console.log('onDelete1')}
            // error="test"
          />
          <TextFieldGroupItem
            {...register('addBoardColumn2', {
              onBlur: (e) => {
                e.target.value = e.target.value.trim();
              },
            })}
            defaultValue="val2"
            onDelete={() => console.log('onDelete2')}
            // error="test"
          />
        </TextFieldGroup>
        <Button variant="primary-s" type="submit">
          Create New Board
        </Button>
      </form>
    </>
  );
};
