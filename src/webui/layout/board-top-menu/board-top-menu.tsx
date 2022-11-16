import { DeleteBoard, EditBoard, useActiveBoard } from 'webui/board';
import { Menu, useModalToggle } from 'webui/shared';

export const BoardTopMenu = () => {
  const { board } = useActiveBoard();
  const disabled = !board;

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

      {!disabled && (
        <>
          <EditBoard isOpen={isEditBoardOpen} close={closeEditBoard} board={board} />
          <DeleteBoard isOpen={isDeleteBoardOpen} close={closeDeleteBoard} board={board} />
        </>
      )}
    </>
  );
};
