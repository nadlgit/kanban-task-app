import styles from './board-list-nav.module.css';

export const BoardListNav = () => {
  return (
    <div className={styles.container}>
      <p>{`All boards (3)`}</p>
      <ul className={styles.list}>
        <li className={`${styles.item} ${styles.active}`}>
          <i className={styles.icon} />
          <a href="#">Board #1</a>
        </li>
        <li className={styles.item}>
          <i className={styles.icon} />
          <a href="#">Board #2</a>
        </li>
        <li className={styles.item}>
          <i className={styles.icon} />
          <a href="#">Board #3</a>
        </li>
        <li className={`${styles.item} ${styles.create}`}>
          <i className={styles.icon} />
          <button>+ Create New Board</button>
        </li>
      </ul>
    </div>
  );
};
