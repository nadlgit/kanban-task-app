import styles from './board-list-nav.module.css';

import { useEffect } from 'react';

import { BoardListNavItem } from './board-list-nav-item';
import { AddBoard, useBoardList } from 'webui/board';
import { Modal, useModalToggle } from 'webui/shared';

export const BoardListNav = () => {
  const { boardList, activeBoardId, setActiveBoardId } = useBoardList();

  const {
    isModalOpen: isAddBoardOpen,
    closeModal: closeAddBoard,
    openModal: openAddBoard,
  } = useModalToggle();

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
        <AddBoard onSubmit={closeAddBoard} />
      </Modal>
    </>
  );
};
