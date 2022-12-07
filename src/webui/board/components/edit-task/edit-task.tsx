import type { ComponentProps } from 'react';

import { EditTaskForm } from './edit-task-form';
import type { BoardEntity, UniqueId } from 'core/entities';
import { editTask } from 'core/usecases';
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

  const onSubmit: ComponentProps<typeof EditTaskForm>['onSubmit'] = async (
    title,
    description,
    subtasks,
    statusId
  ) => {
    const taskUpdate: Parameters<typeof editTask>[2] = {
      id: taskId,
      title: title === task.title ? undefined : title,
      description: description === task.description ? undefined : description,
      subtasks:
        subtasks.length === task.subtasks.length &&
        subtasks.every(
          ({ title, previousIndex }, idx) =>
            previousIndex === idx && title === task.subtasks[previousIndex].title
        )
          ? undefined
          : subtasks.map(({ title, previousIndex }) => ({
              title,
              isCompleted: previousIndex ? task.subtasks[previousIndex].isCompleted : false,
            })),
      newColumnId: statusId === task.statusId ? undefined : statusId,
    };
    if (
      taskUpdate?.title ||
      taskUpdate?.description ||
      taskUpdate?.subtasks ||
      taskUpdate?.newColumnId
    ) {
      await editTask(board.id, columnId, taskUpdate);
    }
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} withDismiss>
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
