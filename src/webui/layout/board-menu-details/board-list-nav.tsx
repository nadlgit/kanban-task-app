import styles from './board-list-nav.module.css';

import { useEffect } from 'react';

import { BoardListNavButton } from './board-list-nav-button';
import { AddBoard, useBoardList } from 'webui/board';
import { useModalToggle } from 'webui/shared';

export const BoardListNav = () => {
  const { loading, boardList, activeBoardId, setActiveBoardId } = useBoardList();

  const {
    isModalOpen: isAddBoardOpen,
    closeModal: closeAddBoard,
    openModal: openAddBoard,
  } = useModalToggle();

  useEffect(() => {
    if (!loading && !boardList.length) {
      openAddBoard();
    }
  }, [boardList, loading, openAddBoard]);

  return (
    <>
      <nav className={styles.container}>
        <p className={styles.title}>{`All boards (${boardList.length})`}</p>{' '}
        <ul className={styles.list}>
          {boardList.map((item) => (
            <li key={item.id} aria-current={item.id === activeBoardId}>
              <BoardListNavButton
                label={item.name}
                onClick={() => setActiveBoardId(item.id)}
                isActive={item.id === activeBoardId}
              />
            </li>
          ))}
          <li>
            <BoardListNavButton label="+ Create New Board" onClick={openAddBoard} isCreate />
          </li>
        </ul>
      </nav>

      <AddBoard isOpen={isAddBoardOpen} close={closeAddBoard} onAdd={setActiveBoardId} />
    </>
  );
};
