import styles from './view-task.module.css';

import type { BoardEntity, UniqueId } from 'core/entities';
import { Modal } from 'webui/shared';

type ViewTaskProps = {
  isOpen: boolean;
  close: () => void;
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
};

export const ViewTask = ({ isOpen, close, board, columnId, taskId }: ViewTaskProps) => {
  return (
    <Modal isOpen={isOpen} onClose={close}>
      <p>{`View Task columnId=${columnId} taskId=${taskId}`}</p>
    </Modal>
  );
};
