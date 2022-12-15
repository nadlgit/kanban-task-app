import styles from './board-content.module.css';

import { useState } from 'react';
import { Droppable } from 'react-beautiful-dnd';

import { AddColumn } from './add-column';
import { Column } from './column';
import { EditTask } from '../edit-task';
import { DeleteTask } from '../delete-task';
import { ViewTask } from '../view-task';
import type { BoardEntity, UniqueId } from 'core/entities';
import { DroppableTypes, useModalToggle } from 'webui/shared';

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

  type TaskPropsState = { columnId: UniqueId; taskId: UniqueId };
  const [viewTaskProps, setViewTaskProps] = useState<TaskPropsState>();
  const [editTaskProps, setEditTaskProps] = useState<TaskPropsState>();
  const [deleteTaskProps, setDeleteTaskProps] = useState<TaskPropsState>();

  const openView = (columnId: UniqueId, taskId: UniqueId) => {
    if (columnId && taskId) {
      setViewTaskProps({ columnId, taskId });
      openViewTask();
    }
  };
  const closeView = () => {
    closeViewTask();
    setViewTaskProps(undefined);
  };
  const openEdit = (columnId: UniqueId, taskId: UniqueId) => {
    if (columnId && taskId) {
      closeView();
      setEditTaskProps({ columnId, taskId });
      openEditTask();
    }
  };
  const closeEdit = () => {
    closeEditTask();
    setEditTaskProps(undefined);
  };
  const openDelete = (columnId: UniqueId, taskId: UniqueId) => {
    if (columnId && taskId) {
      closeView();
      setDeleteTaskProps({ columnId, taskId });
      openDeleteTask();
    }
  };
  const closeDelete = () => {
    closeDeleteTask();
    setDeleteTaskProps(undefined);
  };

  return (
    <>
      <div className={styles.container}>
        <Droppable droppableId={board.id} type={DroppableTypes.COLUMNS} direction="horizontal">
          {({ innerRef, droppableProps, placeholder }) => (
            <div ref={innerRef} {...droppableProps} className={styles.columnlist}>
              {board.columns.map((column, idx) => (
                <Column
                  key={column.id}
                  {...column}
                  viewTask={openView}
                  index={idx}
                  boardId={board.id}
                />
              ))}
              {placeholder}
            </div>
          )}
        </Droppable>
        <AddColumn onTrigger={addNewColumn} />
      </div>

      {viewTaskProps && (
        <ViewTask
          isOpen={isViewTaskOpen}
          close={closeView}
          board={board}
          {...viewTaskProps}
          openEditTask={openEdit}
          openDeleteTask={openDelete}
        />
      )}
      {editTaskProps && (
        <EditTask isOpen={isEditTaskOpen} close={closeEdit} board={board} {...editTaskProps} />
      )}
      {deleteTaskProps && (
        <DeleteTask
          isOpen={isDeleteTaskOpen}
          close={closeDelete}
          board={board}
          {...deleteTaskProps}
        />
      )}
    </>
  );
};
