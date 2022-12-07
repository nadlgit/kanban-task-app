import styles from './task.module.css';

import type { TaskEntity } from 'core/entities';

type TaskProps = {
  title: TaskEntity['title'];
  subtasks: TaskEntity['subtasks'];
  onTrigger: () => void;
};

export const Task = ({ title, subtasks, onTrigger }: TaskProps) => {
  const completedSubtasks = subtasks.filter(({ isCompleted }) => isCompleted === true);
  const taskInfo = `${completedSubtasks.length} of ${subtasks.length} subtasks`;
  return (
    <div
      className={styles.task}
      tabIndex={0}
      onClick={onTrigger}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onTrigger();
        }
      }}
    >
      <h3 className={styles.tasktitle}>{title}</h3>
      <p className={styles.taskinfo}>{taskInfo}</p>
    </div>
  );
};
