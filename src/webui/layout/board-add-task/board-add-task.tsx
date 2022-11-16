import IconAdd from './icon-add-task-mobile.svg';

import { AddTask, useActiveBoard } from 'webui/board';
import { Button, useIsMobile, useModalToggle } from 'webui/shared';

export const BoardAddTask = () => {
  const isMobile = useIsMobile();
  const { board } = useActiveBoard();
  const disabled = !board?.columns?.length;

  const {
    isModalOpen: isAddTaskOpen,
    closeModal: closeAddTask,
    openModal: openAddTask,
  } = useModalToggle();

  return (
    <>
      <Button variant="primary-s" fullWidth={false} onClick={openAddTask} disabled={disabled}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {isMobile ? <img src={IconAdd.src} alt="Add new task" /> : '+ Add New Task'}
      </Button>

      {!disabled && <AddTask isOpen={isAddTaskOpen} close={closeAddTask} board={board} />}
    </>
  );
};
