import styles from './column.module.css';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import { Task } from './task';
import type { ColumnEntity, UniqueId } from 'core/entities';
import { DroppableTypes, toDroppableColumnId } from 'webui/shared';

type ColumnProps = ColumnEntity & {
  viewTask: (columnId: UniqueId, taskId: UniqueId) => void;
  index: number;
  boardId: UniqueId;
};

export const Column = ({ id, name, tasks, viewTask, index, boardId }: ColumnProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {({ innerRef, draggableProps, dragHandleProps }, { isDragging }) => (
        <div
          ref={innerRef}
          {...draggableProps}
          className={styles.container}
          data-dragging={isDragging}
        >
          <h2 {...dragHandleProps} className={styles.title}>
            <span aria-hidden className={styles.color} />
            <span className={styles.columnname}>{name}</span>
            <span>&nbsp;{`(${tasks.length})`}</span>
          </h2>

          <Droppable
            droppableId={toDroppableColumnId({ boardId, columnId: id })}
            type={DroppableTypes.TASKS}
          >
            {({ innerRef, droppableProps, placeholder }, { isDraggingOver }) => (
              <div
                ref={innerRef}
                {...droppableProps}
                className={styles.tasklist}
                data-dragged-over={isDraggingOver}
              >
                {tasks.map((task, idx) => (
                  <Task
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    subtasks={task.subtasks}
                    onTrigger={() => viewTask(id, task.id)}
                    index={idx}
                  />
                ))}
                {placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
};
