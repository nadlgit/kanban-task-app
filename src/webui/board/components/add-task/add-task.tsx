import styles from './add-task.module.css';

import type { BoardEntity } from 'core/entities';
import { Modal } from 'webui/shared';

type AddTaskProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const AddTask = ({ isOpen, close, board }: AddTaskProps) => {
  return (
    <Modal isOpen={isOpen} onClose={close}>
      <p>Add Task</p>
    </Modal>
  );
};
