import type { ComponentProps } from 'react';

import { AddTaskForm } from './add-task-form';
import type { BoardEntity } from 'core/entities';
import { addTask } from 'core/usecases';
import { Modal, ModalHeading } from 'webui/shared';

type AddTaskProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const AddTask = ({ isOpen, close, board }: AddTaskProps) => {
  const onSubmit: ComponentProps<typeof AddTaskForm>['onSubmit'] = async (
    title,
    description,
    subtasks,
    statusId
  ) => {
    const task = {
      title,
      description,
      subtasks: subtasks.map(({ title }) => ({ title, isCompleted: false })),
    };
    await addTask(board.id, statusId, task);
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Add New Task</ModalHeading>
      <AddTaskForm
        statusList={board.columns.map(({ id, name }) => ({ value: id, label: name }))}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
