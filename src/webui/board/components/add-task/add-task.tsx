import styles from './add-task.module.css';

import type { BoardEntity } from 'core/entities';

type AddTaskProps = { board: BoardEntity | null; onClose?: () => void };

export const AddTask = ({ board, onClose }: AddTaskProps) => {
  return <p>Add Task</p>;
};