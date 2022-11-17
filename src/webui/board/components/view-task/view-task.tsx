import { useEffect, useState } from 'react';

import { TaskContent } from './task-content';
import { TaskMenu } from './task-menu';
import type { BoardEntity, UniqueId } from 'core/entities';
import { Modal, ModalHeading } from 'webui/shared';

type ViewTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
};

export const ViewTask = ({ isOpen, close, board, columnId, taskId }: ViewTaskProps) => {
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
  const [hideModal, setHideModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);

  const setSubtaskStatus = (index: number, status: boolean) => {
    setSubtasksStatus((l) => {
      const list = [...l];
      list[index] = status;
      return list;
    });
  };

  const hideView = () => setHideModal(true);
  const closeView = () => setCloseModal(true);

  useEffect(() => {
    if (closeModal) {
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
      close();
    }
  }, [close, closeModal, columnId, subtasksStatus, task.subtasks, taskStatus]);

  return (
    <Modal isOpen={isOpen} onClose={closeView} hide={hideModal}>
      <ModalHeading
        menu={
          <TaskMenu
            hideView={hideView}
            closeView={closeView}
            board={board}
            columnId={columnId}
            taskId={taskId}
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
