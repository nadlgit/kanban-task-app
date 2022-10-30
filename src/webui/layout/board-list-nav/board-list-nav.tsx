import styles from './board-list-nav.module.css';

import { IconBoard } from './icon-board';
import { AddBoard, useBoardList } from 'webui/board';
import { Modal, useModalToggle } from 'webui/shared';

export const BoardListNav = () => {
  const { boardList, activeBoardId, setActiveBoardId } = useBoardList();
  const boardCount = boardList.length;

  const {
    isModalOpen: isAddBoardOpen,
    closeModal: closeAddBoard,
    openModal: openAddBoard,
  } = useModalToggle();

  return (
    <>
      <div className={styles.container}>
        <p className={styles.title}>{`All boards (${boardCount})`}</p>
        <ul className={styles.list}>
          {boardList.map((item) => (
            <li
              key={item.id}
              className={`${styles.item} ${item.id === activeBoardId ? styles.active : ''}`}
            >
              <button onClick={() => setActiveBoardId(item.id)}>
                <IconBoard />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
          <li className={`${styles.item} ${styles.create}`}>
            <button onClick={openAddBoard}>
              <IconBoard />
              <span>+ Create New Board</span>
            </button>
          </li>
        </ul>
      </div>

      <Modal isOpen={isAddBoardOpen} onClose={closeAddBoard}>
        <AddBoard />
      </Modal>
    </>
  );
};
