import styles from './board-list-nav.module.css';

import { IconBoard } from './icon-board';
import { useBoardList } from 'webui/board';

export const BoardListNav = () => {
  const { boardList, activeBoardId, setActiveBoardId } = useBoardList();
  return (
    <div className={styles.container}>
      <p className={styles.title}>{`All boards (3)`}</p>
      <ul className={styles.list}>
        <li className={`${styles.item} ${styles.active}`}>
          <IconBoard />
          <a href="#">Board #1</a>
        </li>
        <li className={styles.item}>
          <IconBoard />
          <a href="#">Board #2</a>
        </li>
        <li className={styles.item}>
          <IconBoard />
          <a href="#">Board #3</a>
        </li>
        <li className={`${styles.item} ${styles.create}`}>
          <IconBoard />
          <button>+ Create New Board</button>
        </li>
      </ul>
    </div>
  );
};
