import styles from './board-content.module.css';

import { useState } from 'react';

import { Column } from './column';
import { EditTask } from '../edit-task';
import { DeleteTask } from '../delete-task';
import { ViewTask } from '../view-task';
import type { BoardEntity, UniqueId } from 'core/entities';
import { useModalToggle } from 'webui/shared';

type BoardContentProps = { board: BoardEntity; addNewColumn: () => void };

export const BoardContent = ({ board, addNewColumn }: BoardContentProps) => {
  const {
    isModalOpen: isViewTaskOpen,
    closeModal: closeViewTask,
    openModal: openViewTask,
  } = useModalToggle();
  const {
    isModalOpen: isEditTaskOpen,
    closeModal: closeEditTask,
    openModal: openEditTask,
  } = useModalToggle();
  const {
    isModalOpen: isDeleteTaskOpen,
    closeModal: closeDeleteTask,
    openModal: openDeleteTask,
  } = useModalToggle();

  const [taskProps, setTaskProps] = useState<{ columnId: UniqueId; taskId: UniqueId }>();

  return (
    <>
      <div className={styles.container}>
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            viewTask={(columnId, taskId) => {
              if (columnId && taskId) {
                setTaskProps({ columnId, taskId });
                openViewTask();
              }
            }}
          />
        ))}
        <Column addNewColumn={addNewColumn} />
      </div>

      {taskProps && (
        <>
          <ViewTask
            isOpen={isViewTaskOpen}
            close={() => {
              closeViewTask();
              setTaskProps(undefined);
            }}
            board={board}
            {...taskProps}
            openEditTask={() => {
              closeViewTask();
              openEditTask();
            }}
            openDeleteTask={() => {
              closeViewTask();
              openDeleteTask();
            }}
          />
          <EditTask
            isOpen={isEditTaskOpen}
            close={() => {
              closeEditTask();
              setTaskProps(undefined);
            }}
            board={board}
            {...taskProps}
          />
          <DeleteTask
            isOpen={isDeleteTaskOpen}
            close={() => {
              closeDeleteTask();
              setTaskProps(undefined);
            }}
            board={board}
            {...taskProps}
          />
        </>
      )}
    </>
  );
};
