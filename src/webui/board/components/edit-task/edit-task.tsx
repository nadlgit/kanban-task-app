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
  const task = board.columns
    .find(({ id }) => id === columnId)
    ?.tasks.find(({ id }) => id === taskId);

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Edit Task</ModalHeading>
    </Modal>
  );
};
