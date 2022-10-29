import styles from './board-list-nav.module.css';

import { IconBoard } from './icon-board';
import { useBoardList } from 'webui/board';

export const BoardListNav = () => {
  const { boardList, activeBoardId, setActiveBoardId } = useBoardList();
  const boardCount = boardList.length;
  return (
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
          <button>
            <IconBoard />
            <span>+ Create New Board</span>
          </button>
        </li>
      </ul>
    </div>
  );
};
