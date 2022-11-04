import styles from './board-list-nav.module.css';

import { useCallback, useEffect } from 'react';

import { BoardListNavItem } from './board-list-nav-item';
import type { UniqueId } from 'core/entities';
import { AddBoard, useBoardList } from 'webui/board';
import { Modal, useModalToggle } from 'webui/shared';

export const BoardListNav = () => {
  const { boardList, activeBoardId, setActiveBoardId } = useBoardList();

  const {
    isModalOpen: isAddBoardOpen,
    closeModal: closeAddBoard,
    openModal: openAddBoard,
  } = useModalToggle();

  const onSubmitAddBoard = useCallback(
    (newBoardId: UniqueId) => {
      closeAddBoard();
      setActiveBoardId(newBoardId);
    },
    [closeAddBoard, setActiveBoardId]
  );

  useEffect(() => {
    if (!boardList.length) {
      openAddBoard();
    }
  }, [boardList, openAddBoard]);

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>{`All boards (${boardList.length})`}</p>
        <ul className={styles.list}>
          {boardList.map((item) => (
            <BoardListNavItem
              key={item.id}
              label={item.name}
              onClick={() => setActiveBoardId(item.id)}
              isActive={item.id === activeBoardId}
            />
          ))}
          <BoardListNavItem label="+ Create New Board" onClick={openAddBoard} isCreate />
        </ul>
      </div>

      <Modal isOpen={isAddBoardOpen} onClose={closeAddBoard}>
        <AddBoard onSubmit={onSubmitAddBoard} />
      </Modal>
    </>
  );
};
