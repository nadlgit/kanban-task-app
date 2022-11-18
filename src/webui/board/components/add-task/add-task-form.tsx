import { useEffect, useMemo } from 'react';
import type { ComponentProps, FormEventHandler } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { generateId } from 'infrastructure/utils';
import {
  boardTextAreaRegisterOptions,
  boardTextInputRegisterOptions,
  Button,
  Dropdown,
  TextArea,
  TextField,
  TextFieldGroup,
  updateTextInputErrors,
  useTextFieldGroupInputList,
} from 'webui/shared';

type AddTaskFormProps = {
  statusList: ComponentProps<typeof Dropdown>['items'];
  onSubmit: (
    title: string,
    description: string,
    subtasks: { title: string }[],
    statusId: string
  ) => void;
};

export const AddTaskForm = ({ statusList, onSubmit }: AddTaskFormProps) => {
  const { register, handleSubmit, formState, control } = useForm({ shouldUnregister: true });

  const subtaskItemLabel = 'Subtask Title';
  const newSubtaskItemName = () => generateId('newsubtask');
  const newSubtaskPlaceholder = 'e.g. Make coffee';

  const initialSubtasks = useMemo(
    () => [
      {
        ...register(newSubtaskItemName(), boardTextInputRegisterOptions),
        label: subtaskItemLabel,
        placeholder: newSubtaskPlaceholder,
      },
    ],
    [register]
  );

  const {
    list: subtasks,
    addItem: addSubtaskItem,
    deleteItem: deleteSubtaskItem,
    setError: setSubtaskItemError,
  } = useTextFieldGroupInputList(initialSubtasks);

  const handleFormSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit((data) => {
      onSubmit(
        data['tasktitle'].trim(),
        data['taskdesc'].trim(),
        subtasks.map(({ name }) => ({ title: data[name].trim() })),
        data['taskstatus']
      );
    })(e);
  };

  useEffect(() => {
    updateTextInputErrors(
      formState,
      subtasks.map(({ name, error }) => ({ name, error })),
      setSubtaskItemError
    );
  }, [formState, subtasks, setSubtaskItemError]);

  return (
    <form onSubmit={handleFormSubmit} noValidate>
      <TextField
        {...register('tasktitle', boardTextInputRegisterOptions)}
        label="Title"
        placeholder="e.g. Take coffee break"
        error={formState.errors['tasktitle']?.message as string | undefined}
      />
      <TextArea
        {...register('taskdesc', boardTextAreaRegisterOptions)}
        label="Description"
        placeholder="e.g. It’s always good to take a break. This 15 minute break will recharge the batteries a little."
        error={formState.errors['taskdesc']?.message as string | undefined}
      />
      <TextFieldGroup
        groupLabel="Subtasks"
        inputList={subtasks}
        addLabel="+ Add New Subtask"
        onAdd={() => {
          addSubtaskItem({
            ...register(newSubtaskItemName(), boardTextInputRegisterOptions),
            label: subtaskItemLabel,
            placeholder: newSubtaskPlaceholder,
          });
        }}
        onDelete={(inputName: string) => {
          deleteSubtaskItem(inputName);
        }}
      />
      <Controller
        name="taskstatus"
        control={control}
        render={({ field }) => (
          <Dropdown label="Status" items={statusList} name={field.name} onChange={field.onChange} />
        )}
        shouldUnregister={true}
      />
      <Button variant="primary-s" type="submit">
        Create Task
      </Button>
    </form>
  );
};
