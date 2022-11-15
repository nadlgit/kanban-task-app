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
    <div style={{ border: '1px solid green', padding: 5 }}>
      {column ? (
        <>
          <p>
            <span>color</span>
            {`${column.name} (${column.tasks.length})`}
          </p>
          {column.tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => viewTask(column.id, task.id)}
              style={{ border: '1px solid blue' }}
            >
              <p>{task.title}</p>
              <p>{`${task.subtasks.filter(({ isCompleted }) => isCompleted === true).length} of ${
                task.subtasks.length
              } subtasks`}</p>
            </div>
          ))}
        </>
      ) : (
        <div onClick={addNewColumn}>+ New Column</div>
      )}
    </div>
  );
};
