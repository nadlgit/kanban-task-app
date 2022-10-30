import styles from './board-top-menu.module.css';
import IconAdd from './icon-add-task-mobile.svg';

import { AddTask, DeleteBoard, EditBoard, useActiveBoard } from 'webui/board';
import { Button, Menu, Modal, useIsMobile, useModalToggle } from 'webui/shared';

export const BoardTopMenu = () => {
  const isMobile = useIsMobile();
  const { board } = useActiveBoard();
  const disabled = !board;

  const {
    isModalOpen: isAddTaskOpen,
    closeModal: closeAddTask,
    openModal: openAddTask,
  } = useModalToggle();
  const {
    isModalOpen: isEditBoardOpen,
    closeModal: closeEditBoard,
    openModal: openEditBoard,
  } = useModalToggle();
  const {
    isModalOpen: isDeleteBoardOpen,
    closeModal: closeDeleteBoard,
    openModal: openDeleteBoard,
  } = useModalToggle();

  return (
    <>
      <div className={styles.container}>
        <Button variant="primary-s" fullWidth={false} onClick={openAddTask} disabled={disabled}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {isMobile ? <img src={IconAdd.src} alt="Add new task" /> : '+ Add New Task'}
        </Button>
        <Menu
          items={[
            { label: 'Edit Board', onClick: openEditBoard, disabled },
            {
              label: 'Delete Board',
              onClick: openDeleteBoard,
              variant: 'destructive',
              disabled,
            },
          ]}
        />
      </div>

      <Modal isOpen={isAddTaskOpen} onClose={closeAddTask}>
        <AddTask board={board} />
      </Modal>
      <Modal isOpen={isEditBoardOpen} onClose={closeEditBoard}>
        <EditBoard board={board} />
      </Modal>
      <Modal isOpen={isDeleteBoardOpen} onClose={closeDeleteBoard}>
        <DeleteBoard board={board} />
      </Modal>
    </>
  );
};
