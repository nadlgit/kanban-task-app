import styles from './task-content.module.css';

import type { ComponentProps } from 'react';

import type { TaskEntity, UniqueId } from 'core/entities';
import { generateId } from 'infrastructure/utils';
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
  const completedSubtasks = task.subtasks.filter(({ isCompleted }) => isCompleted === true);
  const subtasksLabel = `Subtasks (${completedSubtasks.length} of ${task.subtasks.length})`;
  const subtasksLabelId = generateId('vtstl');
  return (
    <>
      <p className={styles.description}>{task.description}</p>
      <div role="group" aria-labelledby={subtasksLabelId} className={styles.subtasks}>
        <p id={subtasksLabelId} className={styles.label}>
          {subtasksLabel}
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
