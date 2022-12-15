import styles from './task.module.css';

import { Draggable } from 'react-beautiful-dnd';

import type { TaskEntity } from 'core/entities';

type TaskProps = Pick<TaskEntity, 'id' | 'title' | 'subtasks'> & {
  onTrigger: () => void;
  index: number;
};

export const Task = ({ id, title, subtasks, onTrigger, index }: TaskProps) => {
  const completedSubtasks = subtasks.filter(({ isCompleted }) => isCompleted === true);
  const taskInfo = `${completedSubtasks.length} of ${subtasks.length} subtasks`;
  return (
    <Draggable draggableId={id} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          {...dragHandleProps}
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
      )}
    </Draggable>
  );
};
