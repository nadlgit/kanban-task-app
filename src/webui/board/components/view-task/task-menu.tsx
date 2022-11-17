import { DeleteTask } from '../delete-task';
import { EditTask } from '../edit-task';
import type { BoardEntity, UniqueId } from 'core/entities';
import { Menu, useModalToggle } from 'webui/shared';

type TaskMenuProps = {
  board: BoardEntity;
  columnId: UniqueId;
  taskId: UniqueId;
  hideView: () => void;
  closeView: () => void;
};

export const TaskMenu = ({ board, columnId, taskId, hideView, closeView }: TaskMenuProps) => {
  const disabled = !board?.columns?.length;

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

  return (
    <>
      <Menu
        items={[
          {
            label: 'Edit Task',
            onClick: () => {
              hideView();
              openEditTask();
            },
            disabled,
          },
          {
            label: 'Delete Task',
            onClick: () => {
              hideView();
              openDeleteTask();
            },
            variant: 'destructive',
            disabled,
          },
        ]}
      />

      {!disabled && (
        <>
          <EditTask
            isOpen={isEditTaskOpen}
            close={() => {
              closeEditTask();
              closeView();
            }}
            board={board}
            columnId={columnId}
            taskId={taskId}
          />
          <DeleteTask
            isOpen={isDeleteTaskOpen}
            close={() => {
              closeDeleteTask();
              closeView();
            }}
            board={board}
            columnId={columnId}
            taskId={taskId}
          />
        </>
      )}
    </>
  );
};
