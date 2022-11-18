import { useEffect, useState } from 'react';

import { TaskContent } from './task-content';
import type { BoardEntity, UniqueId } from 'core/entities';
import { Menu, Modal, ModalHeading } from 'webui/shared';

type ViewTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
  openEditTask: () => void;
  openDeleteTask: () => void;
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
  const [saveChanges, setSaveChanges] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  const setSubtaskStatus = (index: number, status: boolean) => {
    setSubtasksStatus((l) => {
      const list = [...l];
      list[index] = status;
      return list;
    });
  };

  useEffect(() => {
    if (saveChanges) {
      console.log(
        '%c should update task status',
        'background-color:lime;',
        taskStatus !== columnId
      );
      console.log(
        '%c should update subtasks status',
        'background-color:lime;',
        !subtasksStatus.every((status, idx) => status === task.subtasks[idx].isCompleted)
      );
      //todo: persist changes
    }
    if (closeModal) {
      close();
    }
  }, [close, closeModal, columnId, saveChanges, subtasksStatus, task.subtasks, taskStatus]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setSaveChanges(true);
        setCloseModal(true);
      }}
    >
      <ModalHeading
        menu={
          <Menu
            items={[
              {
                label: 'Edit Task',
                onClick: () => {
                  setSaveChanges(true);
                  openEditTask();
                },
              },
              {
                label: 'Delete Task',
                onClick: () => {
                  setSaveChanges(true);
                  openDeleteTask();
                },
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
        onSubtaskStatusChange={setSubtaskStatus}
      />
    </Modal>
  );
};
