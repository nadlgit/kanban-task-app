import styles from './column.module.css';

import { Task } from './task';
import type { ColumnEntity, UniqueId } from 'core/entities';

type ColumnProps =
  | {
      column: ColumnEntity;
      viewTask: (columnId: UniqueId, taskId: UniqueId) => void;
      addNewColumn?: undefined;
    }
  | { column?: undefined; viewTask?: undefined; addNewColumn: () => void };

export const Column = ({ column, viewTask, addNewColumn }: ColumnProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {column ? (
          <>
            <span aria-hidden className={styles.color} />
            <span className={styles.columnname}>{column.name}</span>
            <span>&nbsp;{`(${column.tasks.length})`}</span>
          </>
        ) : (
          <span>&nbsp;</span>
        )}
      </h2>

      {column ? (
        <>
          {column.tasks.map((task) => (
            <Task
              key={task.id}
              title={task.title}
              subtasks={task.subtasks}
              onTrigger={() => viewTask(column.id, task.id)}
            />
          ))}
        </>
      ) : (
        <button onClick={addNewColumn} className={styles.newcolumn}>
          + New Column
        </button>
      )}
    </div>
  );
};
