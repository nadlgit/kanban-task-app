import { useEffect, useState } from 'react';

import { TaskContent } from './task-content';
import type { BoardEntity, UniqueId } from 'core/entities';
import { editTask } from 'core/usecases';
import { Menu, Modal, ModalHeading } from 'webui/shared';

type ViewTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
  openEditTask: (columnId: UniqueId, taskId: UniqueId) => void;
  openDeleteTask: (columnId: UniqueId, taskId: UniqueId) => void;
};

export const ViewTask = ({
  isOpen,
  close,
  board,
  columnId,
  taskId,
  openEditTask,
  openDeleteTask,
}: ViewTaskProps) => {
  const task = {
    title: '',
    description: '',
    subtasks: [],
    ...board.columns.find(({ id }) => id === columnId)?.tasks.find(({ id }) => id === taskId),
    statusId: columnId,
  };
  const statusList = board.columns.map(({ id, name }) => ({ value: id, label: name }));

  const [taskStatus, setTaskStatus] = useState(task.statusId);
  const [subtasksStatus, setSubtasksStatus] = useState(
    task.subtasks.map(({ isCompleted }) => isCompleted)
  );
  const [closeAction, setCloseAction] = useState<'close' | 'editTask' | 'deleteTask'>();

  useEffect(() => {
    const updateTask = async () => {
      const taskUpdate: Parameters<typeof editTask>[2] = {
        id: taskId,
        subtasks: subtasksStatus.every((status, idx) => status === task.subtasks[idx].isCompleted)
          ? undefined
          : task.subtasks.map(({ title }, idx) => ({
              title,
              isCompleted: subtasksStatus[idx],
            })),
        newColumnId: taskStatus === task.statusId ? undefined : taskStatus,
      };
      if (taskUpdate?.subtasks || taskUpdate?.newColumnId) {
        await editTask(board.id, columnId, taskUpdate);
      }
    };

    if (closeAction !== undefined) {
      updateTask().then(() => {
        switch (closeAction) {
          case 'close':
            close();
            break;
          case 'editTask':
            openEditTask(taskStatus, taskId);
            break;
          case 'deleteTask':
            openDeleteTask(taskStatus, taskId);
            break;
        }
      });
    }
  }, [
    board.id,
    close,
    closeAction,
    columnId,
    openDeleteTask,
    openEditTask,
    subtasksStatus,
    task.statusId,
    task.subtasks,
    taskId,
    taskStatus,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={() => setCloseAction('close')}>
      <ModalHeading
        menu={
          <Menu
            items={[
              {
                label: 'Edit Task',
                onClick: () => setCloseAction('editTask'),
              },
              {
                label: 'Delete Task',
                onClick: () => setCloseAction('deleteTask'),
                variant: 'destructive',
              },
            ]}
          />
        }
      >
        {task.title}
      </ModalHeading>

      <TaskContent
        task={{
          description: task.description,
          subtasks: task.subtasks.map(({ title }, idx) => ({
            title,
            isCompleted: subtasksStatus[idx],
          })),
          statusId: task.statusId,
        }}
        statusList={statusList}
        onTaskStatusChange={setTaskStatus}
        onSubtaskStatusChange={(index: number, status: boolean) => {
          setSubtasksStatus((l) => {
            const list = [...l];
            list[index] = status;
            return list;
          });
        }}
      />
    </Modal>
  );
};
