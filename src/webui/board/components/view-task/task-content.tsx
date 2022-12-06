import styles from './task-content.module.css';

import type { ComponentProps } from 'react';

import type { TaskEntity, UniqueId } from 'core/entities';
import { Checkbox, Dropdown } from 'webui/shared';

type TaskContentProps = {
  task: Pick<TaskEntity, 'description' | 'subtasks'> & { statusId: UniqueId };
  statusList: ComponentProps<typeof Dropdown>['items'];
  onTaskStatusChange: (statusId: UniqueId) => void;
  onSubtaskStatusChange: (subtaskIndex: number, status: boolean) => void;
};

export const TaskContent = ({
  task,
  statusList,
  onTaskStatusChange,
  onSubtaskStatusChange,
}: TaskContentProps) => {
  return (
    <>
      <p className={styles.description}>{task.description}</p>
      <div>
        <p className={styles.label}>
          {`Subtasks (${
            task.subtasks.filter(({ isCompleted }) => isCompleted === true).length
          } of ${task.subtasks.length})`}
        </p>
        {task.subtasks.map(({ title, isCompleted }, idx) => (
          <Checkbox
            key={idx}
            label={title}
            defaultChecked={isCompleted}
            onChange={(e) => onSubtaskStatusChange(idx, e.target.checked)}
            autoFocus={idx === 0}
          />
        ))}
      </div>
      <Dropdown
        label="Current Status"
        items={statusList}
        defaultValue={task.statusId}
        onChange={onTaskStatusChange}
        autoFocus={task.subtasks.length === 0}
      />
    </>
  );
};
