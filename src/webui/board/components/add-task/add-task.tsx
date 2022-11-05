import styles from './add-task.module.css';

import type { BoardEntity } from 'core/entities';

type AddTaskProps = { board: BoardEntity; close: () => void };

export const AddTask = ({ board, close }: AddTaskProps) => {
  return <p>Add Task</p>;
};
