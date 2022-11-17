import { useState } from 'react';

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
  const [hide, setHide] = useState(false);
  const task = board.columns
    .find(({ id }) => id === columnId)
    ?.tasks.find(({ id }) => id === taskId);
  return (
    <Modal isOpen={isOpen} onClose={close} hide={hide}>
      <ModalHeading>
        <span> {task?.title}</span>
        <TaskMenu
          hideView={() => setHide(true)}
          closeView={close}
          board={board}
          columnId={columnId}
          taskId={taskId}
        />
      </ModalHeading>
      <TaskContent />
    </Modal>
  );
};
