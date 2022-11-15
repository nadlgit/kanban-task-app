import { BoardContent, EditBoard, EmptyBoard, useActiveBoard } from 'webui/board';
import { Loading } from 'webui/misc';
import { useModalToggle } from 'webui/shared';

export const ActiveBoard = () => {
  const { loading, board } = useActiveBoard();
  const {
    isModalOpen: isEditBoardOpen,
    closeModal: closeEditBoard,
    openModal: openEditBoard,
  } = useModalToggle();

  if (loading) {
    return <Loading />;
  }
  if (board === null) {
    return null;
  }
  return (
    <>
      {board.columns.length > 0 ? (
        <BoardContent board={board} addNewColumn={openEditBoard} />
      ) : (
        <EmptyBoard addNewColumn={openEditBoard} />
      )}

      <EditBoard isOpen={isEditBoardOpen} close={closeEditBoard} board={board} />
    </>
  );
};
