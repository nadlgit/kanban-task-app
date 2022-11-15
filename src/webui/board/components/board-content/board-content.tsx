import styles from './board-content.module.css';

import { useState } from 'react';

import { Column } from './column';
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

  const [viewTaskProps, setViewTaskProps] = useState<{ columnId: UniqueId; taskId: UniqueId }>();

  return (
    <>
      <div className={styles.container}>
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            viewTask={(columnId, taskId) => {
              if (columnId && taskId) {
                setViewTaskProps({ columnId, taskId });
                openViewTask();
              }
            }}
          />
        ))}
        <Column addNewColumn={addNewColumn} />
      </div>

      {viewTaskProps && (
        <ViewTask
          isOpen={isViewTaskOpen}
          close={() => {
            closeViewTask();
            setViewTaskProps(undefined);
          }}
          board={board}
          {...viewTaskProps}
        />
      )}
    </>
  );
};
