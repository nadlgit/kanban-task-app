import styles from './column.module.css';

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
      <p className={styles.titlezone}>
        {column ? (
          <>
            <span className={styles.color}></span>
            <span className={styles.title}>
              <span className={styles.columnname}>{column.name}</span>
              <span>&nbsp;{`(${column.tasks.length})`}</span>
            </span>
          </>
        ) : (
          <span>&nbsp;</span>
        )}
      </p>
      {column ? (
        <>
          {column.tasks.map((task) => (
            <div key={task.id} onClick={() => viewTask(column.id, task.id)} className={styles.task}>
              <p className={styles.tasktitle}>{task.title}</p>
              <p className={styles.taskinfo}>{`${
                task.subtasks.filter(({ isCompleted }) => isCompleted === true).length
              } of ${task.subtasks.length} subtasks`}</p>
            </div>
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
