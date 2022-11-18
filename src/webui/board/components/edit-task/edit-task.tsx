import type { ComponentProps } from 'react';

import { EditTaskForm } from './edit-task-form';
import type { BoardEntity, UniqueId } from 'core/entities';
import { Modal, ModalHeading } from 'webui/shared';

type EditTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
};

export const EditTask = ({ isOpen, close, board, columnId, taskId }: EditTaskProps) => {
  const task = {
    title: '',
    description: '',
    subtasks: [],
    ...board.columns.find(({ id }) => id === columnId)?.tasks.find(({ id }) => id === taskId),
    statusId: columnId,
  };

  const onSubmit: ComponentProps<typeof EditTaskForm>['onSubmit'] = async () => {
    //todo
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Edit Task</ModalHeading>
      <EditTaskForm
        task={{
          title: task.title,
          description: task.description,
          subtasks: task.subtasks,
          statusId: task.statusId,
        }}
        statusList={board.columns.map(({ id, name }) => ({ value: id, label: name }))}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
